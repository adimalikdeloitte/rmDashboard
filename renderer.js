const { ipcRenderer } = require("electron");

let infoSetCounter = 1;
let infoCounter = 1;
let jsonData, originalData;
let errorPercentage;
let totalFileTime = 0;

let arrForRankingStr = [];

const annotatorEmailToNameMapping = {
  "akassaha@deloitte.com": "Akash Saha",
  "anudasgupta@deloitte.com": "Anurag Dasgupta",
  "arnabdey@deloitte.com": "Arnab Dey",
  "sadutta@deloitte.com": "Saunak Dutta",
  "poukhan@deloitte.com": "Pousali Khan",
  "soumyaghosh@deloitte.com": "Soumya Ghosh",
  "rsharma28@deloitte.com": "Rishabh Sharma",
  "abhishekkh@deloitte.com": "Abhishek Khandelwal",
  "abhisverma@deloitte.com": "Abhishek Verma",
  "adimalik@deloitte.com": "Aditya Malik",
  "ishigarg@deloitte.com": "Ishika Garg",
  "bsrivastava@deloitte.com": "Bhuvaneshvar Srivastava",
  "jsingh6@deloitte.com": "Jyoti Singh",
  "manuyadav@deloitte.com": "Manujay Yadav",
  "jhsharma@deloitte.com": "Jhalak Sharma",
  "kvaish@deloitte.com": "Kashish Vaish",
  "abhishektyagi@deloitte.com": "Abhishek Tyagi",
  "rimakkapati@deloitte.com": "Rishitha Makkapati",
  "lsaisravani@deloitte.com": "SaiSravani Lakkamraju",
  "sviriyala@deloitte.com": "Santosh Viriyala",
  "akappatrala@deloitte.com": "Anitha Kappatrala",
  "uyadav@deloitte.com": "Ujjwal Yadav",
  "manchandrasekaran@deloitte.com": "Manikandan Chandrasekaran",
  "dg2@deloitte.com": "Divya G",
  "amanimuthu@deloitte.com": "Arun Manimuthu",
  "sharaagarwal@deloitte.com": "Sharad Agarwal",
  "artandon@deloitte.com": "Arpit Tandon",
  "himaarora@deloitte.com": "Himanshu Arora",
  "modey@deloitte.com": "Monasish Dey",
  "kbhadra@deloitte.com": "Kush Bhadra",
  "ronvarma@deloitte.com": "Ronak Varma",
  "shivanisharma@deloitte.com": "Shivani Sharma",
  "akmahale@deloitte.com": "Akanksha Mahale",
  "bmirakor@deloitte.com": "Bhagyashree Twatappa Mirakor",
  "pranavchauhan@deloitte.com": "Pranav Bankelal Chauhan",
  "amaile@deloitte.com": "Ashvini Maile",
  "sansarkar@deloitte.com": "Sanju Sarkar",
  "sabere@deloitte.com": "Sanjay Bere",
  "rmultani@deloitte.com": "Rishika Multani",
  "spatil3@deloitte.com": "Shubham Patil",
  "shsonar@deloitte.com": "Shubhada Sonar",
  "deepshah@deloitte.com": "Deep Shah",
  "pmerani@deloitte.com": "Preity Merani",
  "rutwshah@deloitte.com": "Rutwik Shah",
  "svasekar@deloitte.com": "Suvarna Vasekar",
  "rsingh29@deloitte.com": "Raj Singh",
  "ppuranik@deloitte.com": "Pranav Puranik",
  "mpanjabi@deloitte.com": "Maitreya Anil Panjabi",
  "rupsonawane@deloitte.com": "Rupesh Sonawane",
  "umyadav@deloitte.com": "Umakant Yadav",
  "amittal2@deloitte.com": "Aditi Mittal",
  "abgs@deloitte.com": "Abhiram GS",
  "gvalappil@deloitte.com": "Gopika Valappil",
  "anp1@deloitte.com": "Anil Kumar P",
  "pakhurana@deloitte.com": "Parinita Khurana",
  "pkar@deloitte.com": "Priyabrata Kar",
  "prr@deloitte.com": "Priyanka R",
  "shshaji@deloitte.com": "Shinoy Shaji",
  "sivasans@deloitte.com": "Sivasankari S",
  "rajniskumar@deloitte.com": "Rajnish Kumar",
  "swraj@deloitte.com": "Swetha Raj",
  "ssharma36@deloitte.com": "Swati Sharma",
  "abhishekm@deloitte.com": "Abhishek Mukherjee",
  "bhmukherjee@deloitte.com": "Bhaskar Mukherjee",
  "mtalha@deloitte.com": "Talha Mohammed",
  "bnidamarthy@deloitte.com": "Bhavana Nidamarthy",
  "abdurkhan@deloitte.com": "Abdur Rehman Khan",
  "sjyothish@deloitte.com": "Shreyas Jyothish",
  "viraman@deloitte.com": "Vignesh Raman",
  "dhramu@deloitte.com": "Ramu Dudhyala",
  "psulikeri@deloitte.com": "Praveenkumar Sulikeri",
  "ankitkumar@deloitte.com": "Ankit Kumar",
  "pgyanvi@deloitte.com": "Gyanvi Pandey",
  "tanajaiswal@deloitte.com": "Tanaya Jaiswal",
  "navnekumar@deloitte.com": "NAVNEET KUMAR",
  "nkumar21@deloitte.com": "Naveen Kumar",
  "aaypatil@deloitte.com": "Aayush Patil",
  "anjasaini@deloitte.com": "Anjali Saini",
  "paybasu@deloitte.com": "Payal Basu",
  "anna1@deloitte.com": "Anju NA",
  "asinha3@deloitte.com": "Ankita Sinha",
  "rkhajuria@deloitte.com": "Rahul Khajuria",
  "sharsingh@deloitte.com": "Shardendu Singh",
  "vdwivedi@deloitte.com": "Vinit Dwivedi",
  "shimittal@deloitte.com": "Shiwani Mittal",
  "aakashk@deloitte.com": "Aakash K",
  "simransingh@deloitte.com": "Simran Singh",
  "shruchandra@deloitte.com": "Shruti Chandra",
  "aadapa@deloitte.com": "Anusha Adapa",
  "tpotturi@deloitte.com": "Tarun Kumar P",
  "vareti@deloitte.com": "Vatsalya Sai Areti",
  "nareddy@deloitte.com": "Gangireddygari Naveen Reddy",
  "vtummala@deloitte.com": "Vijaya Pardha Saradhi Tummala",
  "fpinjari@deloitte.com": "Fathima Pinjari",
  "sakhan@deloitte.com": "Saif Ali Khan",
  "haderu@deloitte.com": "Harish Aderu",
  "salshaik@deloitte.com": "Salman Shaik",
  "gudkumar@deloitte.com": "Ajay Kumar Gudekal",
  "nganta@deloitte.com": "Neelaprasad Ganta",
  "nimrawat@deloitte.com": "Nimit Rawat",
  "sussv@deloitte.com": "SV Sushma",
  "srivm@deloitte.com": "M Srivathsa",
  "achakravarthy@deloitte.com": "Abhinandan Chakravarthy",
  "kmsrivastava@deloitte.com": "Aditi KM Srivastava",
  "anjchauhan@deloitte.com": "Anjali Chauhan",
  "khasinaparveen@deloitte.com": "Haseena Parveen Kattubadi",
  "shdeore@deloitte.com": "Shubham Deore",
  "aksonawane@deloitte.com": "Akshay Sonawane",
  "anberry@deloitte.com": "Anushka Berry",
  "devakashyap@deloitte.com": "Devansh Kashyap",
  "ekmishra@deloitte.com": "Ekta Mishra",
  "mshendkar@deloitte.com": "Mayur Shendkar",
  "svenkat2@deloitte.com": "Venkat S",
  "shpadhy@deloitte.com": "Shikhar Padhy",
  "kasoni@deloitte.com": "Kartik Soni",
  "ggala@deloitte.com": "Greeshma Gala",
  "pghavle@deloitte.com": "Pawan Ghavle",
  "rohitmittal@deloitte.com": "Rohit Mittal",
  "athmathur@deloitte.com": "Atharv Mathur",
  "shkolte@deloitte.com": "Shruti Kolte",
  "umaroju@deloitte.com": "Uday Maroju",
  "amishra15@deloitte.com": "Aditya Mishra",
  "achandrayan@deloitte.com": "Apoorva Chandrayan",
  "shrutnair@deloitte.com": "Shruti Nair",
  "nsarda@deloitte.com": "Namrata Sarda",
  "dmakani@deloitte.com": "Dewang Makani",
  "hmalnika@deloitte.com": "Hitarth Malnika",
  "shreyagupta1@deloitte.com": "Shreya Gupta",
  "sakchaudhari@deloitte.com": "Sakshi Chaudhari",
  "ltirthani@deloitte.com": "Lavesh Tirthani",
  "vdevjee@deloitte.com": "Vismay Devjee",
  "arunanand@deloitte.com": "Arunima Anand",
  "rchoithramani@deloitte.com": "Ria Choithramani",
  "aditkale@deloitte.com": "Aditi Kale",
  "jbhalchim@deloitte.com": "Jayesh Bhalchim",
  "shrsurve@deloitte.com": "Shruti Surve",
  "amkamat@deloitte.com": "Amruta Kamat",
  "amrbose@deloitte.com": "Amrita Bose",
  "pmore@deloitte.com": "Pratik More",
  "shrkale@deloitte.com": "Shreyas Kale",
  "prkoravi@deloitte.com": "Prathamesh Koravi",
  "bhavpatil@deloitte.com": "Bhavana Patil",
  "amartiwari@deloitte.com": "Amar Tiwari",
  "anshastri@deloitte.com": "Aniruddh Shastri",
  "nthadaboina@deloitte.com": "Nithin Thadaboina",
  "vikchavan@deloitte.com": "Vikrant Chavan",
  "wakahmed@deloitte.com": "Wakhee Ahmed",
  "rahulprasad@deloitte.com": "Rahul Prasad",
  "rsingh24@deloitte.com": "Rohit Singh",
  "gaurshukla@deloitte.com": "Gaurav Shukla",
  "harshiaggarwal@deloitte.com": "Harshit Aggarwal",
  "lovelsingh@deloitte.com": "Lovely Singh",
  "ravchauhan@deloitte.com": "Ravina Chauhan",
  "arybanerjee@deloitte.com": "Aryamaan Banerjee",
  "saummittal@deloitte.com": "Saumay Mittal",
  "zaiqureshi@deloitte.com": "Zaid Abdullah Qureshi",
  "simran@deloitte.com": "Imran Shaikh",
  "manipatil@deloitte.com": "Manish Patil",
  "jinjoseph@deloitte.com": "Jinson Joseph",
  "gnunia@deloitte.com": "Gourav Nunia",
  "atrdas@deloitte.com": "Atreyee Das",
  "nchinthakayala@deloitte.com": "Nagarjuna Chinthakayala",
  "rshekher@deloitte.com": "Raj Shekher",
  "sukr@deloitte.com": "Sushmitha KR",
  "nisankhe@deloitte.com": "Nidhi Sankhe",
  "blingala@deloitte.com": "Bhargav Lingala",
  "ksnair@deloitte.com": "Krishna S Nair",
  "bmehra@deloitte.com": "Bhuvan Mehra",
  "aeswarasatyaveni@deloitte.com": "Eswara Satyaveni Arnepalli",
  "jjannu@deloitte.com": "Jyothi Jannu",
  "samsaxena@deloitte.com": "Sameer Saxena",
  "samyagupta@deloitte.com": "Samyam Gupta",
  "scshekar@deloitte.com": "Suprith C Shekar",
  "soumysen@deloitte.com": "Soumyajit Sen",
  "jsabarinathanj@deloitte.com": "Sabarinathan J Jenish",
  "dnagasuresh@deloitte.com": "Dasari Naga Suresh",
  "dchaubey@deloitte.com": "Divya Chaubey",
  "agupta43@deloitte.com": "Anurag Gupta",
  "mbora@deloitte.com": "Mayur Bhargab Bora",
  "aksachdeva@deloitte.com": "Akshita Sachdeva",
  "dhadiga@deloitte.com": "Dharini Adiga",
  "visnayak@deloitte.com": "Vishal Nayak",
  "kasubramanian@deloitte.com": "Kanmani Subramanian",
  "mrayadav@deloitte.com": "Mragank Yadav",
  "skumar34@deloitte.com": "Shailesh Kumar",
  "pranavjain@deloitte.com": "Pranav Jain",
  "mansahni@deloitte.com": "Manmeet Sahni",
  "shvats@deloitte.com": "Shubham Vats",
  "maymukherjee@deloitte.com": "Mayukh Mukherjee",
  "kurkumar@deloitte.com": "Anil Kumar Kuricheti",
  "ramchakraborty@deloitte.com": "Ramyanath Chakraborty",
  "sbhagavathi@deloitte.com": "Saraswathi Bhagavathi",
  "nkonda@deloitte.com": "Naveen Konda",
  "aborse@deloitte.com": "Ankush Borse",
  "subhamsaha@deloitte.com": "Subham Saha",
  "anuracharya@deloitte.com": "Anurag Acharya",
  "shutripathi@deloitte.com": "Shubham Tripathi",
  "sreddynaidu@deloitte.com": "Sunkara Reddy Naidu",
  "damani@deloitte.com": "Dhamar Amani",
  "sragipani@deloitte.com": "Sai Thapan Ragipani",
  "sharm@deloitte.com": "Sharath M",
  "ravisharma@deloitte.com": "Ravi Sharma",
  "alivjoshi@deloitte.com": "Aliva Joshi",
  "maysingh@deloitte.com": "Mayank Singh",
  "plall@deloitte.com": "Prasoon Lall",
  "saajha@deloitte.com": "Saaket Jha",
  "veethota@deloitte.com": "Veereswarao Thota",
};

document.getElementById("open-file-button").addEventListener("click", () => {
  ipcRenderer.send("open-file-dialog");
});

ipcRenderer.on("file-data", (event, data) => {
  totalFileTime = 0;
  setInterval(() => {
    totalFileTime++;
  }, 1000);
  jsonData = getData(data.data);
  originalData = data.data;
  fillContent(jsonData, data.fileName);
  document.getElementById("fileSelection").style.display = "none";
  document.getElementById("fileContent").style.display = "block";

  localStorage.setItem("annotatorEmail", annotatorEmail);
  localStorage.setItem("podNumber", podNumber);

  localStorage.setItem(
    "annotatorName",
    annotatorEmailToNameMapping[annotatorEmail]
  );

  document.getElementById("annotatorName").value =
    annotatorEmailToNameMapping[annotatorEmail];

  if (document.getElementById("rejectAnnotation2").checked) {
    document.getElementById(`mainContent`).style.display = `block`;
    document.getElementById(`noContent`).style.display = `none`;
  }

  let tempLang = localStorage.getItem("languageChoice")?.toLowerCase();
  tempLang !== "javascript" ? (tempLang += "-programming") : tempLang;
  document.getElementById("compilerLink").addEventListener("click", () => {
    window.open(
      `https://www.programiz.com/${tempLang}/online-compiler/`,
      "_blank"
    );
  });
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
        const numericInput = document.createElement("select");
        numericInput.setAttribute("id", `infoRadio${infoCounter++}`);
        numericInput.setAttribute("class", "m-2");
        for (let f = 1; f <= 7; f++) {
          const optionsDropdown = document.createElement("option");
          optionsDropdown.innerText = f;
          optionsDropdown.setAttribute("value", f);
          Number(v?.answer) === f &&
            optionsDropdown.setAttribute("selected", true);
          numericInput.appendChild(optionsDropdown);
        }

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

  document.getElementById("annotatorName").value =
    data?.notesObj["Annotator Name"];
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

  // if (!rankedStr.includes(">") && rankedArr[0][1] === 1) {

  //   rankedStr = ">" + rankedStr;

  // }

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

  jsonData.notesObj["Annotator Name"] =
    document.getElementById("annotatorName").value;

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

function checkEmptyValues() {
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

  if (document.getElementById("annotatorName").value === "") {
    console.log("Annotator Name not filled !");
    flag = false;
  }

  return flag;
}

function setData() {
  setPromptData(1);
  setCompletion(jsonData.completionsArr?.length);
  setFinalQuestions(jsonData.completionsArr?.length + 2);

  if (checkEmptyValues() === false) {
    showFailAlert("Cannot update data : Please fill all fields !");
  } else {
    localStorage.setItem("annotatorName", jsonData?.notesObj["Annotator Name"]);
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
  podNumber = localStorage.getItem("podNumber") || "",
  annotatorName = localStorage.getItem("annotatorName") || "";

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

function checkAbbreviations(notesObj) {
  const regex = /\b[A-Z]{2,}\b/g; // Regex pattern for finding all caps words with at least two letters

  const matches = notesObj[Object.keys(notesObj)[2]].match(regex);

  return {
    abbreviations: matches ? matches : [],
    message:
      '"Reason for ranking" contains the following abbreviations which are not allowed : ',
  };
}

function checkLinesOfCode(completions) {
  const max = 20;

  var loc = [];

  var pattern = /\`\`\`[\w\s]*\n([\s\S]*?)\`\`\`/gm;

  completions.map((comp, index) => {
    let codeBlocks = comp.answer.match(pattern);

    let lines = [];

    codeBlocks?.map((cB, idx) => {
      lines.push(cB.split("\n").length - 2);
    });

    loc.push(lines);
  });

  var message = [];

  loc.map((codes, i) => {
    codes.map((cLines, j) => {
      if (cLines > max && completions[i].question.questions[1].answer === "1") {
        message.push(
          "Code snippet " +
            (j + 1) +
            " of completion " +
            String.fromCharCode(i + 65) +
            " has more than " +
            max +
            " lines of code, and should be marked not executable."
        );
      }
    });
  });

  return { loc, message };
}

function checkRating(completions) {
  /* changes */

  var errorList = [];

  completions.map((comp, index) => {
    let ques = comp.question.questions;

    /* NA answers will not be rejected anymore */

    // if (ques[1].answer === "3") {

    //   return { errorList };

    // }

    if (ques[0].answer != "1") {
      if (ques[4].answer > 1) {
        errorList.push(
          "Completion " +
            String.fromCharCode(index + 65) +
            ": Rating cannot be higher than 1 for submitted choices."
        );
      }
    } else {
      if (!["1", "3"].includes(ques[1].answer)) {
        /* checking for 'NA' as true as well, and not just 'yes' */

        //   if (ques[1].answer != "1") {

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
          if (ques[4].answer <= 4) {
            errorList.push(
              "Completion " +
                String.fromCharCode(index + 65) +
                ": Rating has to be more than 4 for submitted choices." /* changed the message text */
            );
          }
        }
      }
    }
  });

  return { errorList };
}

function runChecks() {
  if (checkEmptyValues() === false) {
    showFailAlert("Cannot run checks: please fill empty values !");
  } else {
    let checksArr = checkRating(jsonData.completionsArr).errorList;
    const { message, abbreviations } = checkAbbreviations(jsonData.notesObj);
    // const locMessage = checkLinesOfCode(jsonData.completionsArr).message;
    if (abbreviations.length !== 0) {
      checksArr.push(message + abbreviations);
    }

    // checksArr = [...checksArr, ...locMessage];

    document.getElementById("ratingChecks").innerHTML = "";
    checksArr.forEach((check) => {
      const listItem = document.createElement("li");
      listItem.style.color = "red";
      listItem.innerText = check;

      document.getElementById("ratingChecks").appendChild(listItem);
    });

    errorPercentage = ((checksArr.length / 10) * 100).toFixed(2);
    document.getElementById(
      "errorPercentage"
    ).innerText = `Error Percentage : ${errorPercentage} %`;

    let someData = {
      timestamp: new Date(),
      podNumber,
      fileName: document.getElementById("fileName").innerText,
      annotatorEmail,
      errorPercentage: Number(errorPercentage),
      languageChoice,
      totalFileTime: Math.floor(totalFileTime / 60),
      taskChoice: "RM",
    };
    ipcRenderer.send("writeLogs", [someData]);

    showSuccessAlert("Run checks successful !");
  }
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

function showFailAlert(message) {
  const alertHTML = `
      <div id="failAlert" class="alert alert-danger alert-dismissible fade show" role="alert">
        ${message}
      </div>
    `;

  const alertContainer = document.getElementById("alertContainer");
  alertContainer.innerHTML = "";
  alertContainer.insertAdjacentHTML("beforeend", alertHTML);

  setTimeout(function () {
    const failAlert = document.getElementById("failAlert");
    if (failAlert) {
      failAlert.classList.remove("show");
      failAlert.classList.add("fade");
    }
  }, 3000);
}

function checkRatingHelper(ques) {
  if (ques[0] === "-") {
    return { start: 1, end: 7 };
  }

  // if (ques[1] === "3") {
  //   return { start: 1, end: 7 };
  // }

  if (ques[0] != "1") {
    return { start: 1, end: 1 };
  } else {
    if (ques[1] != "1" && ques[1] != "3") {
      if (ques[3] != "1") {
        return { start: 1, end: 1 };
      } else {
        return { start: 1, end: 4 };
      }
    } else {
      if (ques[3] != "1") {
        return { start: 1, end: 4 };
      } else {
        return { start: 5, end: 7 };
      }
    }
  }
}

// remove unwanted options from rating
document.addEventListener("click", (e) => {
  if (e.target.id.includes("infoRadio")) {
    const idNum = Number(e.target.id.substring(9));
    if (idNum <= 12) {
      const ques = [];
      if (document.getElementById("infoRadio1").checked) {
        ques.push("1");
      } else if (document.getElementById("infoRadio2").checked) {
        ques.push("2");
      }

      if (document.getElementById("infoRadio3").checked) {
        ques.push("1");
      } else if (document.getElementById("infoRadio4").checked) {
        ques.push("2");
      } else if (document.getElementById("infoRadio5").checked) {
        ques.push("3");
      }

      // insert blank for options 6-10
      ques.push("-");

      if (document.getElementById("infoRadio11").checked) {
        ques.push("1");
      } else if (document.getElementById("infoRadio12").checked) {
        ques.push("2");
      }

      const { start, end } = checkRatingHelper(ques);

      const infoRadio = document.getElementById("infoRadio13");
      infoRadio.innerHTML = "";
      for (let i = start; i <= end; i++) {
        const allowedOption = document.createElement("option");
        allowedOption.innerText = i;
        allowedOption.value = i;

        infoRadio.appendChild(allowedOption);
      }
    } else if (idNum > 13 && idNum <= 25) {
      const ques = [];
      if (document.getElementById("infoRadio14").checked) {
        ques.push("1");
      } else if (document.getElementById("infoRadio15").checked) {
        ques.push("2");
      }

      if (document.getElementById("infoRadio16").checked) {
        ques.push("1");
      } else if (document.getElementById("infoRadio17").checked) {
        ques.push("2");
      } else if (document.getElementById("infoRadio18").checked) {
        ques.push("3");
      }

      // insert blank for options 19-23
      ques.push("-");

      if (document.getElementById("infoRadio24").checked) {
        ques.push("1");
      } else if (document.getElementById("infoRadio25").checked) {
        ques.push("2");
      }

      const { start, end } = checkRatingHelper(ques);

      const infoRadio = document.getElementById("infoRadio26");
      infoRadio.innerHTML = "";
      for (let i = start; i <= end; i++) {
        const allowedOption = document.createElement("option");
        allowedOption.innerText = i;
        allowedOption.value = i;

        infoRadio.appendChild(allowedOption);
      }
    } else if (idNum > 26 && idNum <= 38) {
      const ques = [];
      if (document.getElementById("infoRadio27").checked) {
        ques.push("1");
      } else if (document.getElementById("infoRadio28").checked) {
        ques.push("2");
      }

      if (document.getElementById("infoRadio29").checked) {
        ques.push("1");
      } else if (document.getElementById("infoRadio30").checked) {
        ques.push("2");
      } else if (document.getElementById("infoRadio31").checked) {
        ques.push("3");
      }

      // insert blank for options 32-36
      ques.push("-");

      if (document.getElementById("infoRadio37").checked) {
        ques.push("1");
      } else if (document.getElementById("infoRadio38").checked) {
        ques.push("2");
      }

      const { start, end } = checkRatingHelper(ques);

      const infoRadio = document.getElementById("infoRadio39");
      infoRadio.innerHTML = "";
      for (let i = start; i <= end; i++) {
        const allowedOption = document.createElement("option");
        allowedOption.innerText = i;
        allowedOption.value = i;

        infoRadio.appendChild(allowedOption);
      }
    } else if (idNum > 39 && idNum <= 51) {
      const ques = [];
      if (document.getElementById("infoRadio40").checked) {
        ques.push("1");
      } else if (document.getElementById("infoRadio41").checked) {
        ques.push("2");
      }

      if (document.getElementById("infoRadio42").checked) {
        ques.push("1");
      } else if (document.getElementById("infoRadio43").checked) {
        ques.push("2");
      } else if (document.getElementById("infoRadio44").checked) {
        ques.push("3");
      }

      // insert blank for options 45-49
      ques.push("-");

      if (document.getElementById("infoRadio50").checked) {
        ques.push("1");
      } else if (document.getElementById("infoRadio51").checked) {
        ques.push("2");
      }

      const { start, end } = checkRatingHelper(ques);

      const infoRadio = document.getElementById("infoRadio52");
      infoRadio.innerHTML = "";
      for (let i = start; i <= end; i++) {
        const allowedOption = document.createElement("option");
        allowedOption.innerText = i;
        allowedOption.value = i;

        infoRadio.appendChild(allowedOption);
      }
    } else if (idNum > 52 && idNum <= 64) {
      const ques = [];
      if (document.getElementById("infoRadio53").checked) {
        ques.push("1");
      } else if (document.getElementById("infoRadio54").checked) {
        ques.push("2");
      }

      if (document.getElementById("infoRadio55").checked) {
        ques.push("1");
      } else if (document.getElementById("infoRadio56").checked) {
        ques.push("2");
      } else if (document.getElementById("infoRadio57").checked) {
        ques.push("3");
      }

      // insert blank for options 58-62
      ques.push("-");

      if (document.getElementById("infoRadio63").checked) {
        ques.push("1");
      } else if (document.getElementById("infoRadio64").checked) {
        ques.push("2");
      }

      const { start, end } = checkRatingHelper(ques);

      const infoRadio = document.getElementById("infoRadio65");
      infoRadio.innerHTML = "";
      for (let i = start; i <= end; i++) {
        const allowedOption = document.createElement("option");
        allowedOption.innerText = i;
        allowedOption.value = i;

        infoRadio.appendChild(allowedOption);
      }
    } else if (idNum > 65 && idNum <= 77) {
      const ques = [];
      if (document.getElementById("infoRadio66").checked) {
        ques.push("1");
      } else if (document.getElementById("infoRadio67").checked) {
        ques.push("2");
      }

      if (document.getElementById("infoRadio68").checked) {
        ques.push("1");
      } else if (document.getElementById("infoRadio69").checked) {
        ques.push("2");
      } else if (document.getElementById("infoRadio70").checked) {
        ques.push("3");
      }

      // insert blank for options 71-75
      ques.push("-");

      if (document.getElementById("infoRadio76").checked) {
        ques.push("1");
      } else if (document.getElementById("infoRadio77").checked) {
        ques.push("2");
      }

      const { start, end } = checkRatingHelper(ques);

      const infoRadio = document.getElementById("infoRadio78");
      infoRadio.innerHTML = "";
      for (let i = start; i <= end; i++) {
        const allowedOption = document.createElement("option");
        allowedOption.innerText = i;
        allowedOption.value = i;

        infoRadio.appendChild(allowedOption);
      }
    }
  }
});

function removeDoubleQuotes(inputElement) {
  const inputValue = inputElement.value;
  const sanitizedValue = inputValue.replace(/"/g, ""); // Remove all double quotes

  // Update the value of the text box with the sanitized input
  inputElement.value = sanitizedValue;
}
