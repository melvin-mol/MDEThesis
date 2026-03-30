#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const targetDir = __dirname;
const outputFile = path.join(__dirname, 'duplication-group-counts.txt');

if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
  console.error(`Target directory not found: ${targetDir}`);
  process.exit(1);
}

const files = fs.readdirSync(targetDir);
const regex = /^duplicationDirectory(\d+)(?:lines|Lines)\.json$/i;

const counts = new Map();

for (const fileName of files) {
  const match = fileName.match(regex);
  if (!match) {
    continue;
  }

  const nValue = Number(match[1]);
  const fullPath = path.join(targetDir, fileName);

  try {
    const raw = fs.readFileSync(fullPath, 'utf8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      throw new Error('JSON root is not an array');
    }
    counts.set(nValue, data.length);
  } catch (error) {
    console.error(`Failed reading ${fileName}: ${error.message}`);
    process.exit(2);
  }
}

if (counts.size === 0) {
  console.error('No duplicationDirectory*lines.json files found.');
  process.exit(3);
}

const sortedN = [...counts.keys()].sort((a, b) => a - b);
const lines = sortedN.map((n) => `N=${n}: ${counts.get(n)} duplicate groups`);
const output = `${lines.join('\n')}\n`;

fs.writeFileSync(outputFile, output, 'utf8');
console.log(`Wrote ${sortedN.length} lines to fixed file: ${outputFile}`);
console.log(output.trim());
