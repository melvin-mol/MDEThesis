const { spawnSync } = require("child_process");
const path = require("path");

const scripts = [
  "generate-duplication-trends.js",
  "generate-duplication-deep-trends.js",
  "generate-duplication-summary-full.js",
];

for (const script of scripts) {
  const absolute = path.join(__dirname, script);
  const result = spawnSync(process.execPath, [absolute], {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log("All duplication report files generated.");
