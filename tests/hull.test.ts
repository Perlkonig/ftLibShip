import { expect } from "chai";
import "mocha";
import { formRows } from "../src/lib/hull.js";
import type { FullThrustShip } from "../src/schemas/ship.js";

describe("Hull module", () => {
    it("`formRows` returns something with blank ship", () => {
        const startShip: FullThrustShip = {
            hull: {points: 1, rows: 4, stealth: "0", streamlining: "none"},
            armour: [] as [number, number][],
            systems: [
                {
                    name: "drive",
                    thrust: 0,
                    advanced: false
                }
            ],
            weapons: [],
            ordnance: [],
            extras: [],
            fighters: [],
            layout: {} as any
        };
        const hullArray = formRows(startShip);
        expect(hullArray).not.to.be.undefined;
    });
});
