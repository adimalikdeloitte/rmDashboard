const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  nativeTheme,
} = require("electron");
const fs = require("fs");
const axios = require("axios");
const https = require("https");
// Configure the agent with rejectUnauthorized set to false
const agent = new https.Agent({ rejectUnauthorized: false });

// const URL = "http://localhost:3000/";
const URL = "https://rlhfbackend.onrender.com/";
// const code_check_URL = "https://103.1.113.234/api/code_exec/";
const code_check_URL = "http://13.235.18.107:8080/api/code_exec/";

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // Enable hardware acceleration
      webgl: true,
      hardwareAcceleration: true,
    },
  });

  mainWindow.loadFile("index.html");
  nativeTheme.themeSource = "dark";

  let currFilePath = "";

  const checkFile = (fname) =>
    new Promise((resolve) => {
      const httpheaders = {
        "Content-Type": "application/json",
      };
      const axiosInstance = axios.create({
        httpsAgent: agent,
      });
      axiosInstance
        .post(
          URL + "check-file",
          { fileName: fname },
          {
            headers: httpheaders,
          }
        )
        .then((response) => {
          resolve({ response: response.data });
        })
        .catch((error) => {
          resolve({
            response: {
              message: "internal server error",
              isRejected: false,
            },
          });
        });
    });

  // Event listener for the open-file-dialog
  ipcMain.on("open-file-dialog", (event) => {
    dialog
      .showOpenDialog(mainWindow, {
        properties: ["openFile"],
        filters: [{ name: "Text Files", extensions: ["txt"] }],
      })
      .then((result) => {
        if (!result.canceled && result.filePaths.length > 0) {
          currFilePath = result.filePaths[0];
          fs.readFile(result.filePaths[0], "utf-8", async (err, data) => {
            if (err) {
              console.error("An error occurred while reading the file:", err);
              return;
            }
            const path = result.filePaths[0];
            const lastIndex = path.lastIndexOf("\\");
            const fileName = path.slice(lastIndex + 1);

            const fileCheck = await checkFile(fileName);

            const finalData = { fileName, data, fileCheck: fileCheck.response };
            event.sender.send("file-data", finalData);
          });
        }
      })
      .catch((err) => {
        console.error("An error occurred while opening the file picker:", err);
      });
  });

  function findOccurrence(bigString, substring, occurrence) {
    const regex = new RegExp(substring, "g");
    let count = 0;

    while (count < occurrence) {
      const match = regex.exec(bigString);
      if (!match) {
        break;
      }
      count++;
    }

    return count === occurrence ? regex.lastIndex - substring.length : -1;
  }

  // Event listener for the writing to file
  ipcMain.on("set-section", (event, message) => {
    const { newData } = message;

    fs.writeFile(currFilePath, newData, "latin1", (err) => {
      if (err) {
        console.error("Error writing file:", err);
        return;
      }
      console.log("File updated successfully!");
    });
  });

  function padTo2Digits(num) {
    return num.toString().padStart(2, "0");
  }

  function formatDate(date) {
    return (
      [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
      ].join("-") +
      " " +
      [
        padTo2Digits(date.getHours()),
        padTo2Digits(date.getMinutes()),
        padTo2Digits(date.getSeconds()),
      ].join(":")
    );
  }

  ipcMain.on("writeLogs", (event, data) => {
    const dummyData = {
      timestamp: formatDate(new Date()),
      podNumber: Number(data[0].podNumber),
      fileName: data[0].fileName,
      annotatorEmail: data[0].annotatorEmail,
      errorPercentage: data[0].errorPercentage,
      language: data[0].languageChoice,
      totalTimeTaken: data[0].totalFileTime,
      task: data[0].taskChoice,
      timeLog: data[0].timeLog,
    };

    // Set the headers for raw JSON
    const httpheaders = {
      "Content-Type": "application/json",
    };

    const axiosInstance = axios.create({
      httpsAgent: agent,
    });

    // Send POST request with raw JSON data
    axiosInstance
      .post(URL + "records", dummyData, {
        headers: httpheaders,
      })
      .then((response) => {
        console.log("Response:", response.data);
      })
      .catch((error) => {
        console.error("Error: ", error);
      });
  });

  ipcMain.on("writeRejectionLogs", (event, data) => {
    const payload = data[0];

    // Set the headers for raw JSON
    const httpheaders = {
      "Content-Type": "application/json",
    };

    const axiosInstance = axios.create({
      httpsAgent: agent,
    });

    // Send POST request with raw JSON data
    axiosInstance
      .post(URL + "log-rejection", payload, {
        headers: httpheaders,
      })
      .then((response) => {
        console.log("Response:", response.data);
      })
      .catch((error) => {
        console.error("Error: ", error);
      });
  });

  ipcMain.on("checkCode", (event, data) => {
    const codeBlocks = data.Completions.codeBlocks;
    if (data.lang === "JavaScript") {
      const results = {};
      codeBlocks.map((codes, cidx) => {
        codes.map((code, idx) => {
          try {
            const wrappedCode = `(function() { ${code} })();`;
            eval(wrappedCode);
            results["Completion_" + (cidx + 1) + "_code_" + (idx + 1)] =
              "executable";
          } catch (error) {
            results["Completion_" + (cidx + 1) + "_code_" + (idx + 1)] =
              "Not executable";
          }
        });
      });
      console.log({ results });
      event.sender.send("codeChecked", results);
    } else {
      let payloadJSON = {
        lang: data.lang,
        Completions: {},
      };
      codeBlocks.map((comp, cidx) => {
        comp.map((code, idx) => {
          payloadJSON.Completions[
            "Completion_" + (cidx + 1) + "_code_" + (idx + 1)
          ] = [code];
        });
      });

      let payload = JSON.stringify(payloadJSON);

      let config = {
        method: "get",
        maxBodyLength: Infinity,
        url: code_check_URL,
        headers: {
          "Content-Type": "application/json",
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false, // Bypass SSL certificate verification
        }),
        data: payload,
      };

      axios
        .request(config)
        .then((response) => {
          event.sender.send("codeChecked", response.data);
        })
        .catch((error) => {
          event.sender.send("codeChecked", error);
        });
    }
  });

  ipcMain.on("logToConsole", (event, message) => {
    console.log({ message });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
