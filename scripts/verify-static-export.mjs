import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";

const requiredPaths = ["out/index.html", "out/_next"];

for (const relativePath of requiredPaths) {
  try {
    await access(resolve(relativePath), constants.R_OK);
  } catch {
    console.error(`Missing static export artifact: ${relativePath}`);
    process.exit(1);
  }
}

console.log("Static export artifact verified.");
