import { readFileSync, writeFileSync } from "node:fs";

const json = readFileSync("src/schemas/ship.json", "utf-8");
writeFileSync(
    "src/schemas/shipSchema.ts",
    "// Auto-generated from ship.json — do not edit\n" +
        `export default ${json.trim()} as const;\n`
);
