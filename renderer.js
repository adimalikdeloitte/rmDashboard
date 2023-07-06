const { ipcRenderer } = require("electron");

let infoSetCounter = 1;
let infoCounter = 1;
let jsonData, originalData;
let errorPercentage;

let arrForRankingStr = [];

document.getElementById("open-file-button").addEventListener("click", () => {
  ipcRenderer.send("open-file-dialog");
});

ipcRenderer.on("file-data", (event, data) => {
  jsonData = getData(data.data);
  originalData = data.data;
  fillContent(jsonData, data.fileName);
  document.getElementById("fileSelection").style.display = "none";
  document.getElementById("fileContent").style.display = "block";

  localStorage.setItem("annotatorEmail", annotatorEmail);
  localStorage.setItem("podNumber", podNumber);

  if (document.getElementById("rejectAnnotation2").checked) {
    document.getElementById(`mainContent`).style.display = `block`;
    document.getElementById(`noContent`).style.display = `none`;
  }
});

function fillContent(data, fileName) {
  // set the top section with prompt info
  document.getElementById("fileName").innerText = fileName;
  document.getElementById("promptId").innerText = data.promptObj.id;
  document.getElementById("prompt").innerText = data.promptObj.prompText;
  data.promptObj.question?.answer &&
    (document.getElementById(
      `rejectAnnotation${data.promptObj.question?.answer}`
    ).checked = true);

  // set completions
  for (let j = 0; j < data?.completionsArr?.length; j++) {
    const element = data?.completionsArr[j];

    const completionsContainer = document.getElementById("completions");

    // create collapse toggle button
    const completionButton = document.createElement("button");
    completionButton.setAttribute(
      "class",
      "btn btn-outline-secondary w-100 mb-3"
    );
    completionButton.setAttribute("data-bs-toggle", "collapse");
    completionButton.setAttribute(
      "data-bs-target",
      `#completion${String.fromCharCode(j + 65)}`
    );
    completionButton.setAttribute("aria-expanded", "false");
    completionButton.setAttribute(
      "aria-controls",
      `completion${String.fromCharCode(j + 65)}`
    );

    completionButton.innerText = `Completion ${String.fromCharCode(j + 65)}`;

    // add button to the container
    completionsContainer.appendChild(completionButton);

    // create a completion container
    const completionContainer = document.createElement("div");
    completionContainer.setAttribute(
      "id",
      `completion${String.fromCharCode(j + 65)}`
    );
    completionContainer.setAttribute("class", "collapse");

    // create a completion heading , example : Completion A
    const completionHeading = document.createElement("h6");
    completionHeading.innerText = `Completion ${String.fromCharCode(j + 65)}`;

    // insert heading in the container
    completionContainer.appendChild(completionHeading);

    // create a text box
    const completionText = document.createElement("textarea");
    completionText.setAttribute("readonly", "true");
    completionText.setAttribute("rows", "10");
    completionText.setAttribute("class", "p-3 w-100");
    completionText.setAttribute("style", "border-radius: 5px");
    completionText.setAttribute("placeholder", "Completion text ...");
    completionText.value = element?.answer;

    // insert textbox in container
    completionContainer.appendChild(completionText);

    element?.question?.questions?.forEach((v) => {
      const questionPara = document.createElement("p");
      questionPara.innerText = v.question;
      completionContainer.appendChild(questionPara);

      if (v.question.split(" ")[0] !== "Rate") {
        for (let key in v?.options) {
          const optionContainer = document.createElement("div");
          optionContainer.setAttribute("class", "form-check");

          const optionInput = document.createElement("input");
          optionInput.setAttribute("class", "form-check-input");
          optionInput.setAttribute("type", "radio");
          optionInput.setAttribute("name", `infoQuestionSet${infoSetCounter}`);
          optionInput.setAttribute("id", `infoRadio${infoCounter}`);

          optionContainer.appendChild(optionInput);

          const optionLabel = document.createElement("label");
          optionLabel.setAttribute("class", "form-check-label");
          optionLabel.setAttribute("for", `infoRadio${infoCounter}`);
          optionLabel.innerText = v?.options[key];

          optionContainer.appendChild(optionLabel);

          completionContainer.appendChild(optionContainer);

          if (v.answer && v.answer === key) optionInput.checked = true;

          infoCounter++;
        }
      } else {
        const numericInput = document.createElement("input");
        numericInput.setAttribute("type", "number");
        numericInput.setAttribute("placeholder", "Rating");
        numericInput.setAttribute("max", "7");
        numericInput.setAttribute("min", "1");
        numericInput.setAttribute("id", `infoRadio${infoCounter++}`);
        numericInput.value = v?.answer;

        questionPara.appendChild(numericInput);
      }

      infoSetCounter++;
      completionContainer.appendChild(document.createElement("br"));
    });

    // append completion container to outer container
    completionsContainer.appendChild(completionContainer);
  }

  // fill final questions
  document.getElementById("ranking").innerText =
    data?.notesObj["Ranking between completions. Eg: A > BD > C > E"];

  document.getElementById("confidence").value = Number(
    data?.notesObj[
      "Confidence of Ranking [1-10].1 means not confident at all, 10 means very confident."
    ]
  );

  document.getElementById("reason").value =
    data?.notesObj["Reason for ranking. (Free text)"];
  document.getElementById("timeTaken").value = Number(
    data?.notesObj["Time taken to complete the task (in mins)"]
  );
}

function produceRankString(ratingsArr) {
  let rankedArr = ratingsArr.sort((a, b) => {
    return b[1] - a[1];
  });

  var rankedStr = rankedArr[0][0] + "";

  for (let i = 0; i < rankedArr.length - 1; i++) {
    if (rankedArr[i][1] === rankedArr[i + 1][1]) {
      rankedStr += rankedArr[i + 1][0];
    } else {
      rankedStr += " > " + rankedArr[i + 1][0];
    }
  }

  if (!rankedStr.includes(">") && rankedArr[0][1] === 1) {
    rankedStr = ">" + rankedStr;
  }

  return rankedStr;
}

function getData(dataStr) {
  function extractRemainingString(inputString, pattern) {
    const match = inputString.match(pattern);

    if (match) {
      const remainingString = inputString.substring(
        match.index + match[0].length
      );

      return remainingString.trim();
    }

    return null;
  }

  let data = dataStr.split(
    "============================================================"
  );

  var completions = data.slice(1, 6);

  var completionsArr = [];

  completionsArr = completions.map((comp) => {
    let item = comp.split(
      "=========================questions=========================="
    );

    return {
      answer: extractRemainingString(item[0], /Completion [ABCDE]:/),

      question: JSON.parse(item[1]),
    };
  });

  let prompt = data[0].split(
    "=========================questions=========================="
  );

  let promptObj = {
    id: prompt[0].split("\n")[0].split(" ")[1],

    prompText: extractRemainingString(prompt[0], /Prompt:/),

    question: JSON.parse(prompt[1]),
  };

  completionsArr = completionsArr.filter((x) => x.answer !== null);

  let notes = data[completionsArr.length + 1].split(
    "=========================questions=========================="
  );

  let notesObj = JSON.parse(notes[1]);

  return { promptObj, completionsArr, notesObj };
}

function toggleTheme() {
  if (typeof document.documentElement.attributes[0] === "undefined") {
    document.documentElement.setAttribute("data-bs-theme", "dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-bs-theme");
    localStorage.setItem("theme", "light");
  }
}

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

const startDelimiter =
    "=========================questions==========================",
  endDelimiter = "============================================================";

function setPromptData(occurrenceNumber) {
  // starting from top to check and fill the changes
  // set prompt section
  if (document.getElementById("rejectAnnotation1").checked) {
    jsonData.promptObj.question.answer = "1";
  } else if (document.getElementById("rejectAnnotation2").checked) {
    jsonData.promptObj.question.answer = "2";
  }

  // for prompt
  const startIndex =
    findOccurrence(originalData, startDelimiter, occurrenceNumber) +
    startDelimiter.length;
  const endIndex = findOccurrence(originalData, endDelimiter, occurrenceNumber);

  originalData =
    originalData.slice(0, startIndex) +
    "\n" +
    JSON.stringify(jsonData.promptObj.question, null, 4) +
    "\n" +
    originalData.slice(endIndex);
}

function setCompletion(totalCompletions) {
  for (let i = 1; i <= totalCompletions; i++) {
    if (document.getElementById(`infoRadio${(i - 1) * 13 + 1}`).checked) {
      jsonData.completionsArr[i - 1].question.questions[0].answer = "1";
    } else if (
      document.getElementById(`infoRadio${(i - 1) * 13 + 2}`).checked
    ) {
      jsonData.completionsArr[i - 1].question.questions[0].answer = "2";
    }

    if (document.getElementById(`infoRadio${(i - 1) * 13 + 3}`).checked) {
      jsonData.completionsArr[i - 1].question.questions[1].answer = "1";
    } else if (
      document.getElementById(`infoRadio${(i - 1) * 13 + 4}`).checked
    ) {
      jsonData.completionsArr[i - 1].question.questions[1].answer = "2";
    } else if (
      document.getElementById(`infoRadio${(i - 1) * 13 + 5}`).checked
    ) {
      jsonData.completionsArr[i - 1].question.questions[1].answer = "3";
    }

    if (document.getElementById(`infoRadio${(i - 1) * 13 + 6}`).checked) {
      jsonData.completionsArr[i - 1].question.questions[2].answer = "1";
    } else if (
      document.getElementById(`infoRadio${(i - 1) * 13 + 7}`).checked
    ) {
      jsonData.completionsArr[i - 1].question.questions[2].answer = "2";
    } else if (
      document.getElementById(`infoRadio${(i - 1) * 13 + 8}`).checked
    ) {
      jsonData.completionsArr[i - 1].question.questions[2].answer = "3";
    } else if (
      document.getElementById(`infoRadio${(i - 1) * 13 + 9}`).checked
    ) {
      jsonData.completionsArr[i - 1].question.questions[2].answer = "4";
    } else if (
      document.getElementById(`infoRadio${(i - 1) * 13 + 10}`).checked
    ) {
      jsonData.completionsArr[i - 1].question.questions[2].answer = "5";
    }

    if (document.getElementById(`infoRadio${(i - 1) * 13 + 11}`).checked) {
      jsonData.completionsArr[i - 1].question.questions[3].answer = "1";
    } else if (
      document.getElementById(`infoRadio${(i - 1) * 13 + 12}`).checked
    ) {
      jsonData.completionsArr[i - 1].question.questions[3].answer = "2";
    }

    jsonData.completionsArr[i - 1].question.questions[4].answer =
      document.getElementById(`infoRadio${(i - 1) * 13 + 13}`).value;

    const startIndex =
      findOccurrence(originalData, startDelimiter, i + 1) +
      startDelimiter.length;
    const endIndex = findOccurrence(originalData, endDelimiter, i + 1);

    originalData =
      originalData.slice(0, startIndex) +
      "\n" +
      JSON.stringify(jsonData.completionsArr[i - 1].question, null, 4) +
      "\n" +
      originalData.slice(endIndex);
  }
}

function setFinalQuestions(occurrenceNumber) {
  // clear any values from ranking
  arrForRankingStr = [];

  for (let j = 1; j <= occurrenceNumber - 2; j++) {
    arrForRankingStr.push([
      `${String.fromCharCode(j + 64)}`,
      Number(document.getElementById(`infoRadio${j * 13}`).value),
    ]);
  }

  document.getElementById("ranking").innerText =
    produceRankString(arrForRankingStr);

  jsonData.notesObj["Ranking between completions. Eg: A > BD > C > E"] =
    produceRankString(arrForRankingStr);
  jsonData.notesObj[
    "Confidence of Ranking [1-10].1 means not confident at all, 10 means very confident."
  ] = document.getElementById("confidence").value;
  jsonData.notesObj["Reason for ranking. (Free text)"] =
    document.getElementById("reason").value;
  jsonData.notesObj["Time taken to complete the task (in mins)"] =
    document.getElementById("timeTaken").value;

  const startIndex =
    findOccurrence(originalData, startDelimiter, occurrenceNumber) +
    startDelimiter.length;
  const endIndex = findOccurrence(originalData, endDelimiter, occurrenceNumber);

  originalData =
    originalData.slice(0, startIndex) +
    "\n" +
    JSON.stringify(jsonData.notesObj, null, 4) +
    "\n" +
    originalData.slice(endIndex);
}

function setData() {
  setPromptData(1);
  setCompletion(jsonData.completionsArr?.length);
  setFinalQuestions(jsonData.completionsArr?.length + 2);

  // check if all fields are filled
  let flag = true;
  for (let x = 1; x <= jsonData.completionsArr?.length * 5; x++) {
    if (x % 5 !== 0) {
      const questionSet = document.getElementsByName(`infoQuestionSet${x}`);

      let flagForSet = false;
      for (let i = 0; i < questionSet.length; i++) {
        if (questionSet[i].checked) {
          flagForSet = true;
        }
      }

      flag = flag && flagForSet;
    }
  }

  //check if ratings are filled or not
  for (let x = 1; x <= jsonData.completionsArr?.length; x++) {
    if (document.getElementById(`infoRadio${x * 13}`).value === "") {
      flag = false;
    }
  }

  // check if final questions are filled
  if (document.getElementById("confidence").value === "") {
    console.log("confidence level not filled !");
    flag = false;
  }

  if (document.getElementById("reason").value === "") {
    console.log("reason not filled !");
    flag = false;
  }

  if (document.getElementById("timeTaken").value === "") {
    console.log("time taken not filled !");
    flag = false;
  }

  if (flag === false) {
    showSuccessAlert("Cannot update data : Please fill all fields !");
  } else {
    setTimeout(() => {
      ipcRenderer.send("set-section", {
        newData: originalData,
      });
      showSuccessAlert("Data updated successfully !");
    }, 1000);
  }
}

let languageChoice = localStorage.getItem("languageChoice") || "",
  annotatorEmail = localStorage.getItem("annotatorEmail") || "",
  podNumber = localStorage.getItem("podNumber") || "";

document.getElementById("annotatorEmail").value =
  localStorage.getItem("annotatorEmail") || "";

if (localStorage.getItem("languageChoice") === "Java") {
  document.getElementById("languageChoiceJava").checked = true;
} else if (localStorage.getItem("languageChoice") === "Python") {
  document.getElementById("languageChoicePython").checked = true;
} else if (localStorage.getItem("languageChoice") === "JavaScript") {
  document.getElementById("languageChoiceJavascript").checked = true;
}

// set the theme
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.setAttribute("data-bs-theme", "dark");
} else {
  document.documentElement.setAttribute("data-bs-theme", "light");
}

document.getElementById("podNumber").value =
  localStorage.getItem("podNumber") || "";

setTimeout(() => {
  onConfigChoice(0, 0);
}, 1000);

function onConfigChoice(choice, option) {
  if (choice === "language") {
    languageChoice = option;
    localStorage.setItem("languageChoice", languageChoice);
  } else if (choice === "annotatorEmail") {
    annotatorEmail = document.getElementById("annotatorEmail").value;
  } else if (choice === "podNumber") {
    podNumber = document.getElementById("podNumber").value;
  }

  if (
    languageChoice != "" &&
    annotatorEmail != "" &&
    annotatorEmail.includes("@deloitte.com") &&
    podNumber !== ""
  ) {
    document.getElementById("filePicker").removeAttribute("style");
  }
}

function checkRating(completions) {
  var errorList = [];

  completions.map((comp, index) => {
    let ques = comp.question.questions;

    if (ques[1].answer === "3") {
      return { errorList };
    }

    if (ques[0].answer != "1") {
      if (ques[4].answer > 1) {
        errorList.push(
          "Completion " +
            String.fromCharCode(index + 65) +
            ": Rating cannot be higher than 1 for submitted choices."
        );
      }
    } else {
      //   if (!["1", "3"].includes(ques[1].answer)) {

      if (ques[1].answer != "1") {
        if (ques[3].answer != "1") {
          if (ques[4].answer > 1) {
            errorList.push(
              "Completion " +
                String.fromCharCode(index + 65) +
                ": Rating cannot be higher than 1 for submitted choices."
            );
          }
        } else {
          if (ques[4].answer > 4) {
            errorList.push(
              "Completion " +
                String.fromCharCode(index + 65) +
                ": Rating cannot be higher than 4 for submitted choices."
            );
          }
        }
      } else {
        if (ques[3].answer != "1") {
          if (ques[4].answer > 4) {
            errorList.push(
              "Completion " +
                String.fromCharCode(index + 65) +
                ": Rating cannot be higher than 4 for submitted choices."
            );
          }
        } else {
          if (ques[4].answer < 4) {
            errorList.push(
              "Completion " +
                String.fromCharCode(index + 65) +
                ": Rating cannot be less than 4 for submitted choices."
            );
          }
        }
      }
    }
  });

  return { errorList };
}

function runChecks() {
  const checksArr = checkRating(jsonData.completionsArr).errorList;
  document.getElementById("ratingChecks").innerHTML = "";
  checksArr.forEach((check) => {
    const listItem = document.createElement("li");
    listItem.style.color = "red";
    listItem.innerText = check;

    document.getElementById("ratingChecks").appendChild(listItem);
  });

  errorPercentage = (checksArr.length / 5) * 100;
  document.getElementById(
    "errorPercentage"
  ).innerText = `Error Percentage : ${errorPercentage} %`;

  let someData = {
    timestamp: new Date(),
    podNumber,
    fileName: document.getElementById("fileName").innerText,
    annotatorEmail,
    errorPercentage,
    languageChoice,
  };
  ipcRenderer.send("writeLogs", [someData]);

  showSuccessAlert("Run checks successful !");
}

function showSuccessAlert(message) {
  const alertHTML = `
      <div id="successAlert" class="alert alert-success alert-dismissible fade show" role="alert">
        ${message}
      </div>
    `;

  const alertContainer = document.getElementById("alertContainer");
  alertContainer.innerHTML = "";
  alertContainer.insertAdjacentHTML("beforeend", alertHTML);

  setTimeout(function () {
    const successAlert = document.getElementById("successAlert");
    if (successAlert) {
      successAlert.classList.remove("show");
      successAlert.classList.add("fade");
    }
  }, 3000);
}
