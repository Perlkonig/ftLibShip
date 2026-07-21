import { expect } from "chai";
import "mocha";

import type { FullThrustShip } from "../src/schemas/ship.js";
import { evaluate, fighterWingTotals } from "../src/index.js";
import { loadPresetFleets } from "../scripts/presetFleets.js";
import { verifyPresetShipPointsDelta } from "../scripts/refresh-preset-fleet-totals.js";

describe("verifyPresetShipPointsDelta", () => {
    it("accepts when evaluate equals old totals plus wing costs only", () => {
        const exc = loadPresetFleets()
            .flatMap((f) => f.ships)
            .find((s) => s.name === "Excalibur");
        expect(exc).to.not.equal(undefined);

        const wings = fighterWingTotals(exc!);
        const ship = JSON.parse(JSON.stringify(exc)) as FullThrustShip;
        ship.points = (exc!.points as number) - wings.points;
        ship.cpv = (exc!.cpv as number) - wings.cpv;

        expect(verifyPresetShipPointsDelta(ship)).to.equal(undefined);
        expect(evaluate(ship).points).to.equal(exc!.points);
    });
});
