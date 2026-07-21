import type { FullThrustShip } from "../schemas/ship.js";
import { getSystem, type ISystem } from "./systems/index.js";

export interface FighterWingTotals {
    points: number;
    cpv: number;
}

const wingToSystem = (
    wing: NonNullable<FullThrustShip["fighters"]>[number]
): ISystem => ({
    name: "fighters",
    type: wing.type,
    ...(wing.mods !== undefined && wing.mods.length > 0
        ? { mods: wing.mods }
        : {}),
    ...(wing.hangar !== undefined ? { hangar: wing.hangar } : {}),
});

/** Sum points/cpv for all wings in `ship.fighters[]` (same logic as evaluate). */
export const fighterWingTotals = (ship: FullThrustShip): FighterWingTotals => {
    let points = 0;
    let cpv = 0;
    if (ship.fighters === undefined) {
        return { points, cpv };
    }
    for (const wing of ship.fighters) {
        const obj = getSystem(wingToSystem(wing), ship);
        if (obj !== undefined) {
            points += obj.points();
            cpv += obj.cpv();
        }
    }
    return { points, cpv };
};

export { wingToSystem };
