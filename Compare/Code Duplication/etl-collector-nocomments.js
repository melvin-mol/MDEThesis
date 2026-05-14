// Duplication collector for ETL transformations - ALL files with comments removed
// Outputs: compare-results/duplicationDirectory_nocomments_{N}lines.json
const fs = require('fs');
const path = require('path');

let fileCount = 0;
let filesFinished = 0;
let lineCollector = [];
let duplicationDirectory = {};

if (!process.argv[2]) {
    throw new Error('Please provide the number of lines as an argument.');
}

const linesAmount = parseInt(process.argv[2], 10);
const RESULTS_DIR = path.join(__dirname, 'compare-results');

const TARGET_DIR = 'fill in the target dir here';
const EXTENSION = '.etl';

function toRelativeFilePath(filePath) {
    return path.relative(TARGET_DIR, filePath).split(path.sep).join('/');
}

function stripCommentsPreserveLines(content) {
    let result = '';
    let inBlockComment = false;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < content.length; i++) {
        const ch = content[i];
        const next = i + 1 < content.length ? content[i + 1] : '';

        if (inBlockComment) {
            if (ch === '*' && next === '/') {
                inBlockComment = false;
                i++;
            } else if (ch === '\n') {
                result += '\n';
            }
            continue;
        }

        if (inString) {
            result += ch;
            if (ch === '\\') {
                if (i + 1 < content.length) {
                    result += content[i + 1];
                    i++;
                }
            } else if (ch === stringChar) {
                inString = false;
                stringChar = '';
            }
            continue;
        }

        if (ch === '"' || ch === "'") {
            inString = true;
            stringChar = ch;
            result += ch;
            continue;
        }

        if (ch === '/' && next === '/') {
            while (i < content.length && content[i] !== '\n') {
                i++;
            }
            if (i < content.length && content[i] === '\n') {
                result += '\n';
            }
            continue;
        }

        if (ch === '/' && next === '*') {
            inBlockComment = true;
            i++;
            continue;
        }

        result += ch;
    }

    return result;
}

function collectEtlFilesRecursively(dir, callback) {
    let collected = [];
    fs.readdir(dir, { withFileTypes: true }, (err, files) => {
        if (err) { callback(err, null); return; }
        let pending = files.length;
        if (!pending) { callback(null, collected); return; }

        files.forEach((file) => {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
                collectEtlFilesRecursively(fullPath, (subErr, subFiles) => {
                    if (subErr) { callback(subErr, null); return; }
                    collected = collected.concat(subFiles);
                    if (!--pending) callback(null, collected);
                });
            } else {
                if (path.extname(file.name).toLowerCase() === EXTENSION) {
                    collected.push(fullPath);
                }
                if (!--pending) callback(null, collected);
            }
        });
    });
}

function processFile(filePath, done) {
    fs.readFile(filePath, 'utf8', (err, rawContent) => {
        if (err) {
            done(err);
            return;
        }

        const withoutComments = stripCommentsPreserveLines(rawContent);
        const lines = withoutComments.split(/\r?\n/);

        const normalizedLines = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.length > 0) {
                normalizedLines.push(trimmed);
            }
        }

        for (let index = 0; normalizedLines.length > (index + linesAmount); index++) {
            let block = '';
            for (let i = 0; i < linesAmount; i++) {
                block += normalizedLines[index + i];
            }
            lineCollector.push({ line: block, file: toRelativeFilePath(filePath), index: index });
        }

        filesFinished++;
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write('Files scanned: ' + filesFinished + '/' + fileCount + '\r');

        done(null);
    });
}

function finalize() {
    console.log('\nAll files read. Calculating duplicates...');
    lineCollector.forEach((entry, index) => {
        if (index % 1000 === 0) {
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write('Calculating duplication: ' + index + '/' + lineCollector.length + '\r');
        }

        if (duplicationDirectory[entry.line]) {
            duplicationDirectory[entry.line].push({ file: entry.file, index: entry.index });
        } else {
            duplicationDirectory[entry.line] = [{ file: entry.file, index: entry.index }];
        }
    });

    console.log('\nFinished calculating duplicates. Found ' + Object.keys(duplicationDirectory).length + ' unique blocks.');

    const duplicates = Object.values(duplicationDirectory).filter(value => value.length > 1);

    fs.mkdirSync(RESULTS_DIR, { recursive: true });
    const jsonFilePath = path.join(RESULTS_DIR, `duplicationDirectory_nocomments_${linesAmount}lines.json`);
    fs.writeFile(jsonFilePath, JSON.stringify(duplicates, null, 2), (err) => {
        if (err) {
            console.error('Error writing JSON file:', err);
        } else {
            console.log('JSON file created: ' + jsonFilePath);
            console.log('Duplicate groups found: ' + duplicates.length);
        }
    });
}

collectEtlFilesRecursively(TARGET_DIR, (err, etlFiles) => {
    if (err) {
        console.error(err);
        return;
    }

    fileCount = etlFiles.length;
    console.log('Total ETL files to scan (comments removed): ' + fileCount);

    if (fileCount === 0) {
        console.log('No ETL files found.');
        return;
    }

    let pending = fileCount;
    etlFiles.forEach((filePath) => {
        processFile(filePath, (processErr) => {
            if (processErr) {
                console.error('Error processing file:', filePath, processErr);
            }
            pending--;
            if (pending === 0) {
                finalize();
            }
        });
    });
});
