// Duplication collector for ETL transformations - EXCLUDING uppaal code syntax library
// Outputs: compare-results/duplicationDirectory_nosyntax_{N}lines.json
const fs = require('fs');
const path = require('path');
const readline = require('readline');

let fileCount = 0;
let filesFinished = 0;
let lineCollector = [];
let duplicationDirectory = {};

if (!process.argv[2]) {
    throw new Error('Please provide the number of lines as an argument.');
}

const linesAmount = parseInt(process.argv[2], 10);
const RESULTS_DIR = path.join(__dirname, 'compare-results');

const TARGET_DIR = 'C:\\Dev\\School\\OU\\Master\\Afstuderen\\MDEThesis\\Case Study\\epsilon transformations';
const EXTENSION = '.etl';
const EXCLUDE_DIR = 'uppaal code syntax';

function toRelativeFilePath(filePath) {
    return path.relative(TARGET_DIR, filePath).split(path.sep).join('/');
}

function shouldExclude(filePath) {
    return filePath.toLowerCase().includes(EXCLUDE_DIR.toLowerCase());
}

function countEtlFilesRecursively(dir, callback) {
    let fileCount = 0;
    fs.readdir(dir, { withFileTypes: true }, (err, files) => {
        if (err) { callback(err, null); return; }
        let pending = files.length;
        if (!pending) { callback(null, fileCount); return; }
        files.forEach((file) => {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
                if (shouldExclude(fullPath)) {
                    if (!--pending) callback(null, fileCount);
                    return;
                }
                countEtlFilesRecursively(fullPath, (err, count) => {
                    if (err) { callback(err, null); return; }
                    fileCount += count;
                    if (!--pending) callback(null, fileCount);
                });
            } else {
                if (path.extname(file.name).toLowerCase() === EXTENSION && !shouldExclude(fullPath)) fileCount++;
                if (!--pending) callback(null, fileCount);
            }
        });
    });
}

function readFilesRecursively(dir) {
    if (shouldExclude(dir)) return;

    const myPromise = new Promise((resolve, reject) => {
        fs.readdir(dir, { withFileTypes: true }, (err, files) => {
            if (err) { console.error('Error reading directory:', err); return; }

            files.forEach((file) => {
                const fullPath = path.join(dir, file.name);
                if (file.isDirectory()) {
                    if (!shouldExclude(fullPath)) readFilesRecursively(fullPath);
                } else {
                    if (path.extname(file.name).toLowerCase() !== EXTENSION || shouldExclude(fullPath)) {
                        filesFinished++;
                        if (filesFinished === fileCount) resolve();
                        return;
                    }

                    const rl = readline.createInterface({
                        input: fs.createReadStream(fullPath),
                        crlfDelay: Infinity
                    });

                    let lines = [];
                    rl.on('line', (line) => {
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
                            for (let i = 0; i < linesAmount; i++) {
                                line = line + lines[index + i];
                            }
                            lineCollector.push({ line: line, file: toRelativeFilePath(fullPath), index: index });
                        }

                        process.stdout.clearLine(0);
                        process.stdout.cursorTo(0);
                        process.stdout.write("Files scanned: " + filesFinished + "/" + fileCount + "\r");

                        filesFinished++;
                        if (filesFinished === fileCount) resolve();
                    });
                }
            });
        });
    });

    myPromise.then(() => {
        console.log("\nAll files read. Calculating duplicates...");
        lineCollector.forEach((line, index) => {
            if (index % 100 === 0) {
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write("Calculating duplication: " + index + "/" + lineCollector.length + "\r");
            }
            if (duplicationDirectory[line.line]) {
                duplicationDirectory[line.line].push({ file: line.file, index: line.index });
            } else {
                duplicationDirectory[line.line] = [{ file: line.file, index: line.index }];
            }
        });

        console.log("\nFinished calculating duplicates. Found " + Object.keys(duplicationDirectory).length + " unique lines.");

        const duplicates = Object.values(duplicationDirectory).filter(value => value.length > 1);

        fs.mkdirSync(RESULTS_DIR, { recursive: true });
        const jsonFilePath = path.join(RESULTS_DIR, `duplicationDirectory_nosyntax_${linesAmount}lines.json`);
        fs.writeFile(jsonFilePath, JSON.stringify(duplicates, null, 2), (err) => {
            if (err) {
                console.error("Error writing JSON file:", err);
            } else {
                console.log("JSON file created: " + jsonFilePath);
                console.log("Duplicate groups found: " + duplicates.length);
            }
        });
    });
}

countEtlFilesRecursively(TARGET_DIR, (err, localCount) => {
    if (err) { console.error(err); return; }
    fileCount = localCount;
    console.log("Total ETL files to scan (excl. syntax lib): " + fileCount);
    readFilesRecursively(TARGET_DIR);
});
