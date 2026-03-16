const fs = require('fs');

if (!process.argv[2]) {
    throw new Error('Please provide the number of lines as an argument.');
}

const size = parseInt(process.argv[2], 10);

// Path to the JSON file
const filePath = `./duplicationDirectory${size}lines.json`;

// Read and parse the JSON file
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }
    try {
        const jsonData = JSON.parse(data);
        const directoryPath = './src/main/java';

        const getAllFiles = (dirPath, arrayOfFiles = []) => {
            const files = fs.readdirSync(dirPath);

            files.forEach(file => {
            const fullPath = `${dirPath}/${file}`;
            if (fs.statSync(fullPath).isDirectory()) {
                getAllFiles(fullPath, arrayOfFiles);
            } else {
                arrayOfFiles.push(fullPath);
            }
            });

            return arrayOfFiles;
        };

        const allFiles = getAllFiles(directoryPath);

        allFiles.forEach(filePath1 => {
            const readStream = fs.createReadStream(filePath1, 'utf8');

            let newFile = "";
            readStream.on('data', chunk => {
            const lines = chunk.split('\n');
            lines.forEach((line, index) => {
                const pathToCheck = filePath1.replace('./', '').replace(/\//g, '\\');
                let amount = 0;
                jsonData.forEach(duplication => {
                duplication.forEach(duplicationItem => {
                    if (duplicationItem.file === pathToCheck && (duplicationItem.index === index || duplicationItem.index > (index - size) && duplicationItem.index < index)) {
                    if (duplication.length > amount) {
                        amount = duplication.length;
                    }
                    }
                });
                });
                newFile += `${amount > 0 ? 'Duplication' : '           '} (${amount}) : ${line}\n`;
            });
            });

            readStream.on('end', () => {
            const outputDir = `./DuplicationOutput${size}Lines`;
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            const outputFilePath = `${outputDir}/${filePath1.replace(directoryPath + '/', '').replace(/\//g, '_')}.txt`;
            fs.writeFile(outputFilePath, newFile, err => {
                if (err) {
                console.error('Error writing to file:', err);
                } else {
                console.log(`File ${outputFilePath} created successfully.`);
                }
            });
            });

            readStream.on('error', readErr => {
            console.error(`Error reading file ${filePath1}:`, readErr);
            });
        });

    } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
    }
});