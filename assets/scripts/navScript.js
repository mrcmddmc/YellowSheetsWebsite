const nav = document.getElementById("nav");
const pages = document.createElement("div");
const blank = document.createElement("div");
pages.id = "pages";
pages.style.display = "flex";
pages.style.width = "50%";
blank.id = "blank";
blank.style.display = "flex";
// blank.style.width = "50%";
nav.appendChild(pages);
nav.appendChild(blank);

makeLogo();
makeHome();
makeStat();
makePrint();

function makeLogo() {
    const logo = document.createElement("img");
    logo.src = "assets/images/school_logo.png";
    pages.appendChild(logo);
}

function makeHome() {
    const homeButton = document.createElement("input");
    homeButton.setAttribute("class", "navButton");
    homeButton.setAttribute("id", "homeButton");
    homeButton.setAttribute("type", "button");
    homeButton.setAttribute("value", "Home");
    pages.appendChild(homeButton);
}

function makeStat() {
    const statButton = document.createElement("input");
    statButton.setAttribute("class", "navButton");
    statButton.setAttribute("id", "statButton");
    statButton.setAttribute("type", "button");
    statButton.setAttribute("value", "Stats");
    pages.appendChild(statButton);
}

function makePrint() {
    const printButton = document.createElement("input");
    printButton.setAttribute("class", "navButton");
    printButton.setAttribute("id", "printButton");
    printButton.setAttribute("type", "button");
    printButton.setAttribute("value", "Print");
    pages.appendChild(printButton);
}

document.getElementById("printButton").addEventListener("click", () => {
    window.open("./otherPage.html");
})


