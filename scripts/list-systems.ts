import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { buildSystemCatalog } from "../src/lib/systemCatalog.js";

const outPath = resolve(process.argv[2] ?? "systems-catalog.json");

const catalog = buildSystemCatalog();
const output = {
    generatedAt: new Date().toISOString(),
    count: catalog.length,
    systems: catalog,
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`, "utf-8");
console.log(`Wrote ${catalog.length} systems to ${outPath}`);
