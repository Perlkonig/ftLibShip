import { resolve } from "node:path";

import {
    countPresetShips,
    defaultPresetFleetsPath,
    formatPresetShipValidationFailure,
    loadPresetFleets,
    validatePresetFleets,
} from "./presetFleets.js";

const fleetsPath = resolve(process.argv[2] ?? defaultPresetFleetsPath);
const fleets = loadPresetFleets(fleetsPath);
const failures = validatePresetFleets(fleets);

if (failures.length === 0) {
    console.log(
        `All ${countPresetShips(fleets)} preset ships in ${fleets.length} factions passed validation.`
    );
    process.exit(0);
}

console.error(
    `${failures.length} preset ship(s) failed validation in ${fleetsPath}:`
);
for (const failure of failures) {
    console.error(formatPresetShipValidationFailure(failure));
}
process.exit(1);
