import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { FullThrustShip } from "../src/schemas/ship.js";
import { evaluate, fighterWingTotals } from "../src/index.js";
import {
    defaultPresetFleetsPath,
    loadPresetFleets,
    type PresetFleet,
    validatePresetFleets,
} from "./presetFleets.js";

export interface PresetTotalsDeltaFailure {
    faction: string;
    ship: FullThrustShip;
    message: string;
}

export const verifyPresetShipPointsDelta = (
    ship: FullThrustShip
): PresetTotalsDeltaFailure | undefined => {
    const oldPoints = ship.points;
    const oldCpv = ship.cpv;
    const oldMass = ship.mass;

    if (oldPoints === undefined || oldCpv === undefined || oldMass === undefined) {
        return {
            faction: "",
            ship,
            message: "missing points, cpv, or mass",
        };
    }

    const wings = fighterWingTotals(ship);
    const ev = evaluate(ship);

    if (ev.errors.length > 0) {
        return {
            faction: "",
            ship,
            message: `evaluate errors: ${ev.errors.join(", ")}`,
        };
    }

    const expectedPoints = oldPoints + wings.points;
    const expectedCpv = oldCpv + wings.cpv;

    if (ev.points !== expectedPoints) {
        return {
            faction: "",
            ship,
            message: `points: old=${oldPoints} wings=${wings.points} expected=${expectedPoints} actual=${ev.points}`,
        };
    }
    if (ev.cpv !== expectedCpv) {
        return {
            faction: "",
            ship,
            message: `cpv: old=${oldCpv} wings=${wings.cpv} expected=${expectedCpv} actual=${ev.cpv}`,
        };
    }
    if (ev.mass !== oldMass) {
        return {
            faction: "",
            ship,
            message: `mass: old=${oldMass} actual=${ev.mass} (wings should not change mass)`,
        };
    }

    return undefined;
};

export const applyEvaluatedTotals = (ship: FullThrustShip): void => {
    const ev = evaluate(ship);
    ship.points = ev.points;
    ship.cpv = ev.cpv;
};

export const refreshPresetFleetTotals = (
    fleets: PresetFleet[]
): PresetTotalsDeltaFailure[] => {
    const failures: PresetTotalsDeltaFailure[] = [];

    for (const faction of fleets) {
        for (const ship of faction.ships) {
            const failure = verifyPresetShipPointsDelta(ship);
            if (failure !== undefined) {
                failures.push({
                    ...failure,
                    faction: faction.name,
                });
                continue;
            }
            applyEvaluatedTotals(ship);
        }
    }

    return failures;
};

const formatFailure = (f: PresetTotalsDeltaFailure): string => {
    const label = f.ship.name ?? "(unnamed)";
    const classSuffix = f.ship.class ? ` (${f.ship.class})` : "";
    return `${f.faction} / ${label}${classSuffix}: ${f.message}`;
};

const main = () => {
    const fleetsPath = resolve(
        process.argv[2] ??
            defaultPresetFleetsPath
    );
    const fleets = loadPresetFleets(fleetsPath);

    const failures = refreshPresetFleetTotals(fleets);
    if (failures.length > 0) {
        console.error(
            `${failures.length} preset ship(s) failed points/cpv delta check:`
        );
        for (const f of failures) {
            console.error(formatFailure(f));
        }
        process.exit(1);
    }

    writeFileSync(fleetsPath, `${JSON.stringify(fleets, null, 4)}\n`, "utf-8");

    const validationFailures = validatePresetFleets(fleets);
    if (validationFailures.length > 0) {
        console.error("Post-write validation failed.");
        process.exit(1);
    }

    const shipCount = fleets.reduce((n, f) => n + f.ships.length, 0);
    console.log(
        `Updated points/cpv for ${shipCount} ships in ${fleets.length} factions (${fleetsPath}).`
    );
};

const isMain =
    process.argv[1] !== undefined &&
    resolve(fileURLToPath(import.meta.url)) ===
        resolve(process.argv[1]);

if (isMain) {
    main();
}
