const newlineSplitter = new RegExp(/\r\n/);
const quoteCommaSplitter = new RegExp(/\"\,/);
const noQuoteSplitter = new RegExp(/\,/);

function readCSV(file) {
    return new Promise((resolve, reject) => {
        try {
            let reader = new FileReader();
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
