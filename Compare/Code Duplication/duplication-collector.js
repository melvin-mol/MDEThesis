const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { countFilesRecursively } = require('./file-counter.js');

let fileCount = 0;
let filesFinished = 0;
let lineCollector = [];
let duplicationDirectory = {};

if (!process.argv[2]) {
    throw new Error('Please provide the number of lines as an argument.');
}

const linesAmount = parseInt(process.argv[2], 10);

function readFilesRecursively(dir) {
    const myPromise = new Promise((resolve, reject) => {
        fs.readdir(dir, { withFileTypes: true }, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
                return;
            }
            
            files.forEach((file) => {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
                readFilesRecursively(fullPath);
            } else {
                const rl = readline.createInterface({
                    input: fs.createReadStream(fullPath),
                    crlfDelay: Infinity
                });

                let fileIndex = 0;
                let lines = [];
                rl.on('line', (line) => {
                    fileIndex++;
                    const trimmedLine = line.trim();
                    if (trimmedLine.length > 0) {
                        lines.push(trimmedLine);
                    } else {
                        lines.push('#------ ##EMPTY LINE## ------#');
                    }
                });

                rl.on('close', () => {
                    for (let index = 0; lines.length > (index + linesAmount); index++) {
                        let line = "";
                        for(let i = 0; i < linesAmount; i++) {
                            line = line + lines[index + i]
                        }
                        lineCollector.push({
                            line: line,
                            file: fullPath,
                            index: index
                        });
                    }
                    
                    process.stdout.clearLine(0);
                    process.stdout.cursorTo(0);
                    process.stdout.write("Files scanned: " + filesFinished + "/" + fileCount + "\r");

                    filesFinished++;
                    if (filesFinished === fileCount) {
                        resolve();
                    }
                });
            }
        })
    })
});

    // When all files are read, the duplication will be calculated
    myPromise.then(() => {
        console.log("All files read. Calculating duplicates...");         
        lineCollector.forEach((line, index) => {
            if (index % 100 === 0) {
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write("Calculating duplication: " + index + "/" + lineCollector.length +  "\r");
            }

            if (duplicationDirectory[line.line]) {
                duplicationDirectory[line.line].push({ file: line.file, index: line.index });
            } else {
                duplicationDirectory[line.line] = [{ file: line.file, index: line.index }];
            }
        });

        console.log("finished calculating duplicates. Found " + Object.keys(duplicationDirectory).length + " unique lines.");         

        const duplicates = Object.values(duplicationDirectory).filter(value => value.length > 1);

        const jsonFilePath = path.join(__dirname, `duplicationDirectory${linesAmount}lines.json`);
        fs.writeFile(jsonFilePath, JSON.stringify(duplicates, null, 2), (err) => {
            if (err) {
                console.error("Error writing JSON file:", err);
            } else {
                console.log("JSON file created successfully at:", jsonFilePath);
            }
        });
    });
}

const directoryPath = './src/main';
countFilesRecursively(directoryPath, (err, localCount) => {fileCount = localCount;});
readFilesRecursively(directoryPath);