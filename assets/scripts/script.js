const grdfile = document.querySelector("#grdfile");
const attfile = document.querySelector("#attfile");
const rosfile = document.querySelector("#rosfile");

const updateButton = document.querySelector("#calc");

const output = document.querySelector(".output");
const searchBoxFirstName = document.getElementById("searchBoxFirstName");
const searchBoxLastName = document.getElementById("searchBoxLastName");
const searchBoxNumb = document.getElementById("searchBoxNumb");

const hexterSelection = document.getElementById("hexterSelection");

const hexterSelector = {
    "hex1":"Hexter 1",
    "hex2":"Hexter 2",
    "hex3":"Hexter 3",
    "hex4":"Hexter 4",
    "hex5":"Hexter 5",
    "hex6":"Hexter 6",
};


let currTerm = "Hexter 5";

const oldDataColor = "#ff7e7e";
const newDataColor = "#74e074";

const shadedCellColor = "#dddddd";
const unshadedCellColor = "#ffffff";

const tableHeader = `<tr><th colspan=\"3\">Student</th> <th colspan=\"3\">Class</th> <th colspan=\"4\">Attendance</th> <th colspan=\"2\">Grade</th></tr> <tr><th>First Name</th> <th>Last Name</th> <th>ID</th> <th>Period</th> <th>Class Name</th> <th>Teacher</th> <th style="min-width: 40px">U</th> <th style="min-width: 40px">TU</th> <th style="min-width: 40px">EXT</th> <th style="min-width: 40px">Calc</th> <th>Percent</th> <th>Letter</th></tr>`

const uEqMultipliers = {
    U: 1,
    TU: 0.25,
    EXT: 0.5
}

const grdHeader = ["Last Name","First Name","ID","Grade","Teacher","Course Title","Term","Numeric","Letter"];
const attHeader = ["Student ID","First Name","Last Name","Counselor Name","Course","Section ID","Teacher Name","AEP","E","EI","EXT","HB","ISS","OSS","S","TE","TU","U","Total Absences"];
const rosHeader = ["Date","Display Text","HolidayType","Course ID","Course Title","Section ID","Teacher Name","AdditionalTeachers","Period","Room","StudentFirstName","StudentLastName","StudentMiddleName","Student Name","Grd","Perm ID","Phone","Trk","Track","Gender","Term","SectionGU","School Attendance Str","StaffSchoolYearGU","Counter","StudentSchoolYearGU","House","Team","Pathways House","PathwaysTeam","Counselor"];

const grdDataFields = {
    firstName: grdHeader.indexOf("First Name"),
    lastName: grdHeader.indexOf("Last Name"),
    ID: grdHeader.indexOf("ID"),
    courseName: grdHeader.indexOf("Course Title"),
    percent: grdHeader.indexOf("Numeric"),
    letter: grdHeader.indexOf("Letter")
}
const attDataFields = {
    firstName: attHeader.indexOf("First Name"), 
    lastName: attHeader.indexOf("Last Name"), 
    ID: attHeader.indexOf("Student ID"), 
    courseName: attHeader.indexOf("Course Title"), 
    sectionID: attHeader.indexOf("Section ID"), 
    numU: attHeader.indexOf("U"), 
    numTU: attHeader.indexOf("TU"), 
    numEXT: attHeader.indexOf("EXT")
}
const rosDataFields = {
    period: rosHeader.indexOf("Period"), 
    courseName: rosHeader.indexOf("Course Title"), 
    sectionID: rosHeader.indexOf("Section ID"), 
    teacher: rosHeader.indexOf("Teacher Name"),
    ID: rosHeader.indexOf("Perm ID"),
    term: rosHeader.indexOf("Term"),
}

let grdData;
let attData;
let rosData;
let stuData = {
    numStudents: 0,
    studentIDs: [],
    students: [],
};


// const newlineSplitter = new RegExp(/\r\n/);
// const quoteCommaSplitter = new RegExp(/\"\,/);
// const noQuoteSplitter = new RegExp(/\,/);

function fileChanged() {
    updateButton.style.backgroundColor = oldDataColor;
    updateButton.style.borderColor = oldDataColor;
}

class Student {
    constructor(ID) {
        this.ID = ID;
        this.firstName;
        this.lastName;
        this.classes = [];

        this.classFromCourseName = function (courseName) {
            for (const check of this.classes) {
                // console.log(`${courseName} || ${check.courseName}`);
                if (check.courseName === courseName) return check;
            }
            return -1;
        };

        this.classFromSectionID = function (sectionID) {
            for (let ii = 0; ii < this.classes.length; ii++) {
                if (this.classes[ii].sectionID === sectionID) return this.classes[ii];
            }
            return -1;
        };
    }
}

class Course {
    constructor() {
        this.period;
        this.courseName;
        this.sectionID;
        this.teacher;
        this.numU = "0";
        this.numTU = "0";
        this.numEXT = "0";
        this.numUEq = "0";
        this.percent = "--";
        this.letter = "--";

        this.updateUEq = function () {
            this.numUEq = 0;
            if (this.numU !== undefined) this.numUEq += this.numU * uEqMultipliers.U;
            if (this.numTU !== undefined) this.numUEq += this.numTU * uEqMultipliers.TU;
            if (this.numEXT !== undefined) this.numUEq += this.numEXT * uEqMultipliers.EXT;
        };

        this.toHTMLTable = function () {
            const courseTableOrder = [this.period, this.courseName, this.teacher, this.numU, this.numTU, this.numEXT, this.numUEq, this.percent, this.letter];
            let ret = "";
            let emt = 0;
            for (const data of courseTableOrder) {
                if (data === undefined) emt++;
                else { // if table has data
                    if (emt > 0) {
                        ret += `<td colspan=\"${emt}\"> </td>`;
                    }
                    ret += `<td>${data}</td>`;
                }
            }
            return ret;
        };
    }
}


function readCSVAsync(file) {
    return new Promise((resolve, reject) => {
        try {
            let reader = new FileReader()
            reader.onload = (evt) => resolve(evt.target.result
                .split(newlineSplitter)
                .map((line) => line.split(line.includes("\"") ? quoteCommaSplitter : noQuoteSplitter))
                .map((line) => line.map((cell) => cell.replaceAll('"', ''))));
            reader.readAsText(file);
            console.log(`Successfully read ${file.name}`);
        }
        catch(error) {
            reject(error);
        }
    })
}

function addNewStudent(ID) {
    stuData[ID] = new Student(ID);
    stuData["numStudents"]++;
    stuData.studentIDs.push(ID);
    stuData.students.push(stuData[ID]);
}

function sortClasses(a, b) {
    return a.period-b.period;
}

function sortStudents(sortBy, dirAsc=true) { // Returns an array of student IDs ordered by `sortBy`
    stuData.students.sort(compareStudents);
    writeTable(stuData.students);
    return stuData.students;

    function compareStudents(x, y) {
        let ret;
        if(sortBy === "ID" || sortBy === "percent") {
            if(Number.parseInt(x[sortBy]) < Number.parseInt(y[sortBy])) ret = -1;
            if(Number.parseInt(x[sortBy]) > Number.parseInt(y[sortBy])) ret = 1;
            return 0;
        }
        if(sortBy === "numU" || sortBy === "numTU" || sortBy === "numEXT" || sortBy === "numUEq") {
            let xNum = 0;
            let yNum = 0;
            for(const currClass of x.classes) xNum = Math.max(xNum, Number.parseInt(currClass[sortBy]));
            for(const currClass of y.classes) yNum = Math.max(yNum, Number.parseInt(currClass[sortBy]));
            ret = xNum > yNum;
        }
        else ret = x[sortBy] > y[sortBy];
        if(!dirAsc) ret = -ret;
        return ret;
    }


}

function buildHeader() {
    const header = document.createElement("thead");
    header.id = "header";
    const headerRow1 = document.createElement("tr");
    const headerRow2 = document.createElement("tr");

    const colGroupStudent = document.createElement("th");
    colGroupStudent.appendChild(document.createTextNode(`Student`));
    colGroupStudent.colSpan = 3;
    headerRow1.appendChild(colGroupStudent);
    
    const colGroupClass = document.createElement("th");
    colGroupClass.appendChild(document.createTextNode(`Class`));
    colGroupClass.colSpan = 3;
    headerRow1.appendChild(colGroupClass);
    
    const colGroupAttend = document.createElement("th");
    colGroupAttend.appendChild(document.createTextNode(`Attendance`));
    colGroupAttend.colSpan = 4;
    headerRow1.appendChild(colGroupAttend);
    
    const colGroupGrade = document.createElement("th");
    colGroupGrade.appendChild(document.createTextNode(`Grade`));
    colGroupGrade.colSpan = 2;
    headerRow1.appendChild(colGroupGrade);

    const colGroupZero = document.createElement("th");
    colGroupZero.appendChild(document.createTextNode(`Zero Hour`));
    colGroupZero.colSpan = 3;
    headerRow1.appendChild(colGroupZero);

    const colTitles = ["First Name", "Last Name", "ID", "P", "Class Name", "Teacher", "U", "TU", "EXT", "Calc", "Percent", "Letter", "Ask", "Did", "Signed"];
    const colStyles = ["", "", "", "", "", "", "width:20px", "width:20px; font-size: x-small", "width:20px; font-size: xx-small", "width:40px", "", "", "", "", ""];
    for(let ii = 0; ii < colTitles.length; ii++) {
        const currCol = document.createElement("th");
        currCol.appendChild(document.createTextNode(colTitles[ii]));
        currCol.setAttribute("style", colStyles[ii]);
        if(ii === 0) currCol.onclick = function() {sortStudents("firstName");};
        if(ii === 1) currCol.onclick = function() {sortStudents("lastName");};
        headerRow2.appendChild(currCol);
    }

    header.appendChild(headerRow1);
    header.appendChild(headerRow2);
    return header;
}

function buildTable() {
    document.getElementById("outputTable").appendChild(buildHeader());
}

function studentToTableRow2(student) {
    const currBody = document.createElement("tbody");
    currBody.id = student.ID;
    student.classes.sort(sortClasses);
    const numClasses = student.classes.length;
    let currRow = document.createElement("tr");

    const firstNameCell = document.createElement("th");
    firstNameCell.id = "firstName";
    firstNameCell.rowSpan = Math.max(numClasses, 1);
    firstNameCell.appendChild(document.createTextNode(student["firstName"]));
    currRow.appendChild(firstNameCell);
    
    const lastNameCell = document.createElement("th");
    lastNameCell.id = "lastName";
    lastNameCell.rowSpan = Math.max(numClasses, 1);;
    lastNameCell.appendChild(document.createTextNode(student["lastName"]));
    currRow.appendChild(lastNameCell);
    
    const IDCell = document.createElement("th");
    IDCell.id = "ID";
    IDCell.rowSpan = Math.max(numClasses, 1);;
    IDCell.appendChild(document.createTextNode(student["ID"]));
    currRow.appendChild(IDCell);

    let classData;

    if(numClasses === 0) {
        const noClassCell = document.createElement("td");
        noClassCell.colSpan = 9;
        noClassCell.appendChild(document.createTextNode("No Classes"));
        currRow.appendChild(noClassCell);
        currBody.appendChild(currRow);
    }

    if(numClasses > 0) {
        classData = courseToTableRow(student.classes[0]);
        for(const currData of classData) currRow.appendChild(currData);
        currBody.appendChild(currRow);
    }

    if(numClasses > 1) for(let ii = 1; ii < numClasses; ii++) {
        currRow = document.createElement("tr");
        classData = courseToTableRow(student.classes[ii])
        for(const currData of classData) currRow.appendChild(currData);
        currBody.appendChild(currRow);
    }
    return currBody;

    function courseToTableRow(course) { // Returns an array of 'td' elements
        const courseData = [course.period, course.courseName, course.teacher, course.numU, course.numTU, course.numEXT, course.numUEq, course.percent+"%", course.letter]
        const courseDataName = ["period", "courseName", "teacher", "numU", "numTU", "numEXT", "numUEq", "percent", "letter"]
        let ret = [];
        let currCell;
        for(let ii = 0; ii < courseData.length; ii++) { 
            currCell = document.createElement("td");
            currCell.appendChild(
                document.createTextNode(courseData[ii] === undefined ? "" : courseData[ii])
            )
            currCell.id = courseDataName[ii];
            ret.push(currCell);
        };
        ret = ret.concat(zeroCheckBoxes());
        return ret;
    }

    function zeroCheckBoxes() {
        let ask = document.createElement("td");
        let askCheck = document.createElement("input");
        askCheck.setAttribute("type", "checkbox");
        askCheck.setAttribute("id", "zeroAsked");
        askCheck.setAttribute("class", "zeroCells");
        askCheck.setAttribute("name", "zeroAsked");
        ask.appendChild(askCheck);

        let did = document.createElement("td");
        let didCheck = document.createElement("input");
        didCheck.setAttribute("type", "checkbox");
        didCheck.setAttribute("id", "zeroDid");
        didCheck.setAttribute("class", "zeroCells");
        didCheck.setAttribute("name", "zeroDid");
        did.appendChild(didCheck);

        let sig = document.createElement("td");
        let sigCheck = document.createElement("input");
        sigCheck.setAttribute("type", "checkbox");
        sigCheck.setAttribute("id", "zerosig");
        sigCheck.setAttribute("class", "zeroCells");
        sigCheck.setAttribute("name", "zerosig");
        sig.appendChild(sigCheck);

        return [ask, did, sig];
    }
}

function storeData() {
    
}

function loadData() {
  
}

async function loadRosData() {
    rosData = await readCSVAsync(rosfile.files[0]);
    rosData.shift();
  
    for(const line of rosData) {
        if(line[rosDataFields.term] !== currTerm) continue;
        currID = line[rosDataFields.ID];
        if(stuData[currID] === undefined) addNewStudent(currID);
        let currClass = stuData[currID].classFromSectionID(line[rosDataFields.sectionID]);
        if(currClass === -1) {
            currClass = new Course()
            stuData[currID].classes.push(currClass);
        }
        currClass.period = line[rosDataFields.period];
        currClass.courseName = line[rosDataFields.courseName];
        currClass.sectionID = line[rosDataFields.sectionID];
        currClass.teacher = line[rosDataFields.teacher];
    }
}

async function loadAttData() {
    attData = await readCSVAsync(attfile.files[0]);
    attData.shift();

    for(const line of attData) {
        currID = line[attDataFields.ID];
        if(stuData[currID] === undefined) addNewStudent(currID);
        currClass = stuData[currID].classFromSectionID(line[attDataFields.sectionID]);
        stuData[currID].firstName = line[attDataFields.firstName];
        stuData[currID].lastName = line[attDataFields.lastName];
        if(currClass === -1) continue;
        currClass.numU = line[attDataFields.numU];
        currClass.numTU = line[attDataFields.numTU];
        currClass.numEXT = line[attDataFields.numEXT];
        currClass.updateUEq();
    }
}

async function loadGrdData() {
    grdData = await readCSVAsync(grdfile.files[0]);
    grdData.shift();

    for(const line of grdData) {
        currID = line[grdDataFields.ID];
        if(stuData[currID] === undefined) addNewStudent(currID);
        if(stuData[currID].firstName === undefined) stuData[currID].firstName = line[grdDataFields.firstName];
        if(stuData[currID].lastName === undefined) stuData[currID].lastName = line[grdDataFields.lastName];
        currClass = stuData[currID].classFromCourseName(line[grdDataFields.courseName]);
        if(currClass === -1) continue;
        currClass.percent = parseFloat(line[grdDataFields.percent]).toPrecision(3).toString();
        currClass.letter = line[grdDataFields.letter];
    }
} 

function writeTable(studentList) {
    const tab = document.getElementById("outputTable");
    for(const x of document.querySelectorAll("tbody")) x.remove();
    // const tab = document.createElement("table");
    // tab.id = "outputTable";
    // tab.className = "outputTable";
    // document.body.appendChild(tab);
    // tab.appendChild(buildHeader());

    while(stuData.studentIDs.includes(undefined)) {
        stuData.studentIDs.splice(stuData.studentIDs.indexOf(undefined), 1);
    }

    while(stuData.studentIDs.includes("")) {
        stuData.studentIDs.splice(stuData.studentIDs.indexOf(""), 1);
    }

    // studentList.filter((x) => {x.ID !== ""})
    // studentList.filter((x) => {x.ID !== undefined})

    for(const currStu of studentList) {
        if(currStu.ID === undefined) continue;
        if(currStu.firstName === undefined) {
            currStu.firstName = "";
            continue;
        };
        if(currStu.lastName === undefined) {
            currStu.lastName = "";
            continue;
        };
        const currRow = studentToTableRow2(currStu);
        if(currStu.ID !== "") tab.appendChild(currRow);
    }
    alternateRowColors(); 
}

async function dataUpdate() {
        
    loadRosData();
    loadAttData();
    loadGrdData();

    // window.localStorage.setItem("stuData", JSON.stringify(stuData));

    writeTable(stuData.students);

    updateButton.style.backgroundColor = newDataColor;
    updateButton.style.borderColor = newDataColor;
}

function searchForStudentByFirstName(name) { // Returns an array of the IDs of students whose First Name contains name
    let ret = [];
    for(const currID of stuData.studentIDs) {
        if(stuData[currID].firstName === undefined) continue;
        if(stuData[currID].firstName.toLowerCase().includes(name.toLowerCase())) ret.push(currID);
    }
    return ret
}

function searchForStudentByLastName(name) { // Returns an array of the IDs of students whose Last Name contains name
    let ret = [];
    for(const currID of stuData.studentIDs) {
        if(stuData[currID].lastName === undefined) continue;
        if(stuData[currID].lastName.toLowerCase().includes(name.toLowerCase())) ret.push(currID);
    }
    return ret
}

function alternateRowColors() {
    let shaded = true;
    const rows = document.querySelectorAll("tbody");
    for(const currRow of rows) {
        if(currRow.style.display === "") {
            currRow.style.backgroundColor = shaded ? shadedCellColor : unshadedCellColor;
            shaded = !shaded;
        }
    }
}

grdfile.addEventListener("change", fileChanged);
attfile.addEventListener("change", fileChanged);
rosfile.addEventListener("change", fileChanged);

updateButton.addEventListener("click", dataUpdate)

searchBoxFirstName.addEventListener("change", () => {
    if(searchBoxFirstName.value === "") return; 
    output.innerHTML = `Output: ${searchBoxFirstName.value}`;
    const searchResults = searchForStudentByFirstName(searchBoxFirstName.value);
    for(const currID of stuData.studentIDs) document.getElementById(currID).style.display = searchResults.includes(currID) ? "" : "None";
    alternateRowColors();
})

searchBoxLastName.addEventListener("change", () => {
    if(searchBoxLastName.value === "") return; 
    output.innerHTML = `Output: ${searchBoxLastName.value}`
    const searchResults = searchForStudentByLastName(searchBoxLastName.value);
    for(const currID of stuData.studentIDs) document.getElementById(currID).style.display = searchResults.includes(currID) ? "" : "None";
    alternateRowColors();
})

searchBoxNumb.addEventListener("change", () => {
    if(searchBoxLastName.value === "") return; 
    output.innerHTML = `Output: ${searchBoxNumb.value}`
    for(const currID of stuData.studentIDs) document.getElementById(currID).style.display = currID === searchBoxNumb.value ? "" : "None";
    alternateRowColors();
})

hexterSelection.addEventListener("change", () => {
    currTerm = hexterSelector[document.querySelector('input[name="hexSelect"]:checked').value];
})

document.querySelector("body").addEventListener("load", buildTable());