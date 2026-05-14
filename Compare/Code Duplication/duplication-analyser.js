const { error } = require('console');
const fs = require('fs');
const path = require('path');

if (!process.argv[2]) {
    throw new Error('Please provide the number of lines as an argument.');
}

const amountOfLines = parseInt(process.argv[2], 10);

const filePath = path.join(__dirname, `duplicationDirectory${amountOfLines}lines.json`);

const fileReader = () => new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading the file:', err);
                reject(err);
            } else {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (parseErr) {
                    console.error('Error parsing JSON:', parseErr);
                    reject(parseErr);
                }
            }
        });
    });

const logBiggestDuplication = async () => {
    const jsonData = await fileReader();
    let largestArray = jsonData.reduce((max, current) => current.length > max.length ? current : max, []);
    console.log('The array with the most elements is:', largestArray);
}

const listOfMostDuplicationOrdered = async () => {
    const jsonData = await fileReader();
    return jsonData.sort((a, b) => b.length - a.length);
}

const index = 0;
const printLinesOfMostDuplication = async () => {
    const ordered = await listOfMostDuplicationOrdered();
    const file = ordered[index][0].file;
    const lineIndex = ordered[index][0].index;
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
        } else {
            const lines = data.split('\n');
            const snippet = lines.slice(lineIndex, lineIndex + amountOfLines).join('\n');
            console.log('Code snippet from the file:\n', snippet);
            console.log('File: ', file + ":" + lineIndex, " Index: ", lineIndex,  "-", lineIndex + amountOfLines);
            console.log("Amount of files that contains this duplication: ", ordered[index].length);
            console.log("Amount of duplication: ", ordered.length);
            const mostDuplicationAmount = ordered[index].length;
            const count = ordered.filter(item => item.length === mostDuplicationAmount).length;

            ordered
                .filter(item => item.length === mostDuplicationAmount)
                .forEach((duplication, duplicationIndex) => {
                    const duplicationFile = duplication[0].file;
                    const duplicationLineIndex = duplication[0].index;
                    const duplicationSnippet = lines.slice(duplicationLineIndex, duplicationLineIndex + amountOfLines).join('\n');
                    const directoryPath = path.join(__dirname, 'duplication_snippets');
                    if (!fs.existsSync(directoryPath)) {
                        fs.mkdirSync(directoryPath);
                    }
                    const duplicationSnippetFilePath = path.join(directoryPath, `snippet_${duplicationFile.replace(/[\/\\:]/g, '_')}_${duplicationLineIndex}_${duplicationIndex}.txt`);
                    fs.writeFile(duplicationSnippetFilePath, duplicationSnippet, (writeErr) => {
                        if (writeErr) {
                            console.error('Error writing the duplication snippet file:', writeErr);
                        } else {
                            console.log('Duplication snippet saved to:', duplicationSnippetFilePath);
                        }
                    });
                });
            console.log("Number of duplications with the same amount as the most duplicated:", count);
        }
    });
}

printLinesOfMostDuplication();