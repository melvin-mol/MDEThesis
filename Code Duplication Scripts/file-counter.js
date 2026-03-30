const fs = require('fs');
const path = require('path');

module.exports = { countFilesRecursively }

function countFilesRecursively(dir, callback) {
    let fileCount = 0;

    fs.readdir(dir, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            callback(err, null);
            return;
        }

        let pending = files.length;
        if (!pending) {
            callback(null, fileCount);
            return;
        }

        files.forEach((file) => {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
                countFilesRecursively(fullPath, (err, count) => {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    fileCount += count;
                    if (!--pending) {
                        callback(null, fileCount);
                    }
                });
            } else {
                fileCount++;
                if (!--pending) {
                    callback(null, fileCount);
                }
            }
        });
    });
}