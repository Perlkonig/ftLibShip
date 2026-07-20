import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { FullThrustShip } from "../src/schemas/ship.js";
import {
    evaluate,
    validate,
    ValErrorCode,
    type IValidation,
} from "../src/index.js";

export interface PresetFleet {
    name: string;
    ships: FullThrustShip[];
}

export interface PresetShipValidationFailure {
    faction: string;
    ship: FullThrustShip;
    validation: IValidation;
}

export const defaultPresetFleetsPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "preset-fleets.json"
);

export const loadPresetFleets = (
    path: string = defaultPresetFleetsPath
): PresetFleet[] => JSON.parse(readFileSync(path, "utf-8")) as PresetFleet[];

export const validatePresetFleets = (
    fleets: PresetFleet[]
): PresetShipValidationFailure[] => {
    const failures: PresetShipValidationFailure[] = [];

    for (const faction of fleets) {
        for (const ship of faction.ships) {
            const validation = validate(JSON.stringify(ship));
            if (!validation.valid) {
                failures.push({
                    faction: faction.name,
                    ship,
                    validation,
                });
            }
        }
    }

    return failures;
};

const formatAjvErrors = (validation: IValidation): string => {
    if (validation.ajvErrors === undefined || validation.ajvErrors.length === 0) {
        return "schema validation failed";
    }

    return validation.ajvErrors
        .map((error) => {
            const path = error.instancePath || "/";
            return `${path}: ${error.message ?? "invalid"}`;
        })
        .join("; ");
};

export const formatPresetShipValidationFailure = (
    failure: PresetShipValidationFailure
): string => {
    const shipLabel = failure.ship.name ?? "(unnamed)";
    const classSuffix = failure.ship.class ? ` (${failure.ship.class})` : "";
    const prefix = `${failure.faction} / ${shipLabel}${classSuffix}`;
    const { validation } = failure;

    switch (validation.code) {
        case ValErrorCode.BadJSON:
            return `${prefix}: ${formatAjvErrors(validation)}`;
        case ValErrorCode.BadConstruction:
            return `${prefix}: ${(validation.evalErrors ?? []).join(", ")}`;
        case ValErrorCode.PointsMismatch: {
            const evaluation = evaluate(failure.ship);
            return `${prefix}: points/cpv mismatch (stated ${failure.ship.points}/${failure.ship.cpv}, evaluated ${evaluation.points}/${evaluation.cpv})`;
        }
        default:
            return `${prefix}: validation failed`;
    }
};

export const countPresetShips = (fleets: PresetFleet[]): number =>
    fleets.reduce((count, faction) => count + faction.ships.length, 0);
