import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { renderIconSheet } from "../src/lib/iconSheet.js";

const outPath = resolve(process.argv[2] ?? "docs/ssd-icon-sheet.svg");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, renderIconSheet(), "utf-8");
console.log(`Wrote ${outPath}`);
