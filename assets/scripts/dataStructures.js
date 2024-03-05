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
    }
}