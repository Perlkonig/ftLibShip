import { expect } from "chai";
import "mocha";

import {
    formatPresetShipValidationFailure,
    loadPresetFleets,
    validatePresetFleets,
} from "../scripts/presetFleets.js";

describe("preset fleets", () => {
    it("all faction ships validate and evaluate without errors", () => {
        const failures = validatePresetFleets(loadPresetFleets());

        if (failures.length > 0) {
            const report = failures
                .map(formatPresetShipValidationFailure)
                .join("\n");
            expect.fail(`preset fleet validation failures:\n${report}`);
        }
    });
});
