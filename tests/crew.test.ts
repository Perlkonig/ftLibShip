import { expect } from "chai";
import "mocha";

import type { FullThrustShip } from "../src/schemas/ship.js";
import {
    applyDeployedBuiltinDcp,
    crewFactor,
    dcpAvailability,
    hullDcpGrid,
} from "../src/index.js";

const validTacoma = `{"hull":{"points":15,"rows":4,"stealth":"0","streamlining":"none"},"armour":[],"systems":[{"name":"drive","thrust":6,"advanced":false,"id":"CX-A9"},{"name":"ftl","advanced":false,"id":"O_hFB"},{"name":"fireControl","id":"1lIra"},{"name":"fireControl","id":"z8Ahb"},{"name":"screen","id":"xJc7e"}],"weapons":[{"name":"pds","id":"zkCHa"},{"name":"pds","id":"kRzGt"},{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"U66Pl"},{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"rnlPA"},{"name":"beam","class":2,"leftArc":"AP","numArcs":3,"id":"pxn5M"},{"name":"beam","class":2,"leftArc":"F","numArcs":3,"id":"Y174V"},{"name":"beam","class":2,"leftArc":"FP","numArcs":3,"id":"eySY3"}],"ordnance":[],"extras":[],"fighters":[],"mass":50,"class":"Tacoma Class Light Cruiser","name":"Aaron","points":167,"cpv":142,"notes":"","orientation":"alpha"}`;

describe("crewFactor", () => {
    it("military mass 50 yields 3 crew factors", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        expect(crewFactor(ship)).to.equal(3);
    });

    it("civilian mass 100 yields 2 crew factors", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.civilian = true;
        ship.mass = 100;
        expect(crewFactor(ship)).to.equal(2);
    });
});

describe("applyDeployedBuiltinDcp", () => {
    it("marks last surviving star on Tacoma grid", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        const grid = hullDcpGrid(ship)!;
        applyDeployedBuiltinDcp(grid, 1);
        expect(grid.flat().filter((c) => c === 3).length).to.equal(1);
        expect(grid[3][2]).to.equal(3);
    });

    it("applies after hull damage to remaining stars only", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        const grid = hullDcpGrid(ship, { damage: 5, deployedBuiltinDcp: 1 })!;
        expect(grid.flat().filter((c) => c === 1).length).to.equal(1);
        expect(grid.flat().filter((c) => c === 3).length).to.equal(1);
    });
});

describe("dcpAvailability", () => {
    it("Tacoma with no state reports full builtin DCP", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        const dcp = dcpAvailability(ship);
        expect(dcp).to.deep.equal({
            crewFactor: 3,
            builtin: 3,
            builtinDeployed: 0,
            hired: 0,
            hiredAvailable: 0,
            hiredDeployed: 0,
            available: 3,
        });
    });

    it("hull damage reduces surviving builtin DCP", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        const dcp = dcpAvailability(ship, { damage: 5 });
        expect(dcp.builtin).to.equal(2);
        expect(dcp.available).to.equal(2);
    });

    it("deployed hired DCP reduces hiredAvailable", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.systems!.push(
            { name: "damageControl", id: "dcp1" },
            { name: "damageControl", id: "dcp2" }
        );
        const dcp = dcpAvailability(ship, { deployed: ["dcp1"] });
        expect(dcp.hired).to.equal(2);
        expect(dcp.hiredAvailable).to.equal(1);
        expect(dcp.hiredDeployed).to.equal(1);
        expect(dcp.available).to.equal(4);
    });

    it("deployed marines id does not reduce DCP count", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.systems!.push({ name: "marines", id: "m1" });
        const dcp = dcpAvailability(ship, { deployed: ["m1"] });
        expect(dcp.available).to.equal(3);
    });

    it("destroyed hired DCP matches disabled semantics", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.systems!.push({ name: "damageControl", id: "dcp1" });
        const disabled = dcpAvailability(ship, { disabled: ["dcp1"] });
        const destroyed = dcpAvailability(ship, { destroyed: ["dcp1"] });
        expect(disabled.hiredAvailable).to.equal(destroyed.hiredAvailable);
        expect(disabled.available).to.equal(destroyed.available);
    });

    it("deployedBuiltinDcp reduces builtin from end of track", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        const dcp = dcpAvailability(ship, { deployedBuiltinDcp: 2 });
        expect(dcp.builtin).to.equal(1);
        expect(dcp.builtinDeployed).to.equal(2);
        expect(dcp.available).to.equal(1);
    });

    it("combines hull damage, absent hired DCP, and absent builtin", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.systems!.push({ name: "damageControl", id: "dcp1" });
        const dcp = dcpAvailability(ship, {
            damage: 5,
            deployed: ["dcp1"],
            deployedBuiltinDcp: 1,
        });
        expect(dcp.builtin).to.equal(1);
        expect(dcp.builtinDeployed).to.equal(1);
        expect(dcp.hiredAvailable).to.equal(0);
        expect(dcp.available).to.equal(1);
    });
});
