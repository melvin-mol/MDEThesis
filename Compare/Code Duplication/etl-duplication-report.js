// ETL duplication report - reads both all and nosyntax JSON outputs and prints summary statistics
// Usage: node etl-duplication-report.js <N>
const fs = require('fs');
const path = require('path');
const RESULTS_DIR = path.join(__dirname, 'compare-results');

if (!process.argv[2]) {
    throw new Error('Please provide the number of lines as an argument.');
}

const N = parseInt(process.argv[2], 10);

function readJson(filename) {
    const filePath = path.join(RESULTS_DIR, filename);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
}

function report(label, data) {
    if (!data) { console.log(label + ": FILE NOT FOUND"); return; }
    const total = data.length;
    const sorted = data.sort((a, b) => b.length - a.length);

    // File pair counts
    const pairCounts = {};
    sorted.forEach(group => {
        const files = [...new Set(group.map(e => path.basename(e.file)))].sort();
        if (files.length >= 2) {
            const key = files[0] + " | " + files[1];
            pairCounts[key] = (pairCounts[key] || 0) + 1;
        }
    });
    const uniquePairs = Object.keys(pairCounts).length;
    const top5 = Object.entries(pairCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const top5Total = top5.reduce((s, [, c]) => s + c, 0);
    const top5Share = total > 0 ? ((top5Total / total) * 100).toFixed(1) : "0.0";

    console.log(`\n=== ${label} (N=${N}) ===`);
    console.log(`  Duplicate groups: ${total}`);
    console.log(`  Unique file pairs: ${uniquePairs}`);
    console.log(`  Top-5 pair share: ${top5Share}%`);
    console.log(`  Top-5 pairs:`);
    top5.forEach(([key, count], i) => {
        console.log(`    ${i + 1}. ${key} => ${count} groups`);
    });
}

const allData = readJson(`duplicationDirectory_all_${N}lines.json`);
const noSyntaxData = readJson(`duplicationDirectory_nosyntax_${N}lines.json`);

report("All ETL files (incl. syntax lib)", allData);
report("ETL files excl. syntax lib", noSyntaxData);
