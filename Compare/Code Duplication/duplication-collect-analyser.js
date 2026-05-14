const { error } = require('console');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const { countFilesRecursively } = require('./file-counter.js');
const FILE_TO_CHECK_DUPLICATION_FOR = "";

let fileCount = 0;
let filesFinished = 0;
let lineCollector = [];

if (!process.argv[2]) {
    throw new Error('Please provide the number of lines as an argument.');
}

const linesAmount = parseInt(process.argv[2], 10);

function readFilesRecursively(dir, duplicationCheckFile, duplicationCheckIndex) {
    const myPromise = new Promise((resolve) => {
        fs.readdir(dir, { withFileTypes: true }, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
                return;
            }
            
            files.forEach((file) => {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
                readFilesRecursively(fullPath, duplicationCheckFile, duplicationCheckIndex);
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
    })});

    // When all files are read, the duplication will be calculated
    myPromise.then(async () => {
        console.log("All files read. Calculating duplicates...");         

        const getFileLineFromPathAndIndex = (filePath, lineIndex) =>
            new Promise((_, reject) => {
                const rl = readline.createInterface({
                    input: fs.createReadStream(filePath),
                    crlfDelay: Infinity
                });

                let currentLine = 0;
                let lineOfDuplication = "";
                rl.on('line', (line) => {
                    if (currentLine >= lineIndex && currentLine < lineIndex + linesAmount) {
                        if (line.length > 0) {
                            lineOfDuplication += line.trim();
                        } else {
                            lineOfDuplication += '#------ ##EMPTY LINE## ------#';
                        }
                    }
                    currentLine++;
                });

                rl.on('close', () => {
                    console.log(lineOfDuplication);
                    const l = lineCollector.filter((entry) => lineOfDuplication === entry.line);
                    console.log("Duplication amount: ", l.length);
                });

                rl.on('error', (err) => {
                    reject(err);
                });
            });

        await getFileLineFromPathAndIndex(duplicationCheckFile, duplicationCheckIndex);
        
    });
}

const directoryPath = './src/main';
countFilesRecursively(directoryPath, (_, localCount) => { fileCount = localCount; });
readFilesRecursively(directoryPath, FILE_TO_CHECK_DUPLICATION_FOR, 346);