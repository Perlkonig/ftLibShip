import { expect } from "chai";
import "mocha";

import { evaluate, fighterWingTotals } from "../src/index.js";
import type { FullThrustShip } from "../src/schemas/ship.js";
import { loadPresetFleets } from "../scripts/presetFleets.js";

describe("fighterWingTotals", () => {
    it("sums wing type and mod costs", () => {
        const ship: FullThrustShip = {
            mass: 50,
            hull: { points: 15, rows: 4, stealth: "0", streamlining: "none" },
            armour: [],
            systems: [
                { name: "drive", thrust: 2, id: "d" },
                { name: "ftl", id: "f" },
                { name: "hangar", id: "h1" },
            ],
            weapons: [],
            fighters: [{ type: "standard", hangar: "h1" }],
        };
        const wings = fighterWingTotals(ship);
        expect(wings).to.deep.equal({ points: 18, cpv: 48 });
        const infra = evaluate({ ...ship, fighters: [] });
        const full = evaluate(ship);
        expect(full.errors).to.deep.equal([]);
        expect(full.points).to.equal(infra.points + wings.points);
    });
});

describe("preset fleet points", () => {
    it("stored points equal infra plus equipped wing costs", () => {
        const fleets = loadPresetFleets();
        for (const faction of fleets) {
            for (const ship of faction.ships) {
                const wings = fighterWingTotals(ship);
                const infra = evaluate({
                    ...ship,
                    fighters: [],
                });
                const full = evaluate(ship);
                expect(full.errors).to.deep.equal([]);
                expect(ship.points).to.equal(full.points);
                expect(ship.cpv).to.equal(full.cpv);
                expect(full.points).to.equal(infra.points + wings.points);
                expect(full.cpv).to.equal(infra.cpv + wings.cpv);
            }
        }
    });
});
