import { expect } from "chai";
import "mocha";

import type { FullThrustShip } from "../src/schemas/ship.js";
import { evaluate } from "../src/index.js";
import { ErrorCode } from "../src/index.js";

const validTacoma = `{"hull":{"points":15,"rows":4,"stealth":"0","streamlining":"none"},"armour":[],"systems":[{"name":"drive","thrust":4,"advanced":false,"id":"CX-A9"},{"name":"ftl","advanced":false,"id":"O_hFB"},{"name":"fireControl","id":"1lIra"},{"name":"fireControl","id":"z8Ahb"},{"name":"screen","id":"xJc7e"}],"weapons":[{"name":"pds","id":"zkCHa"},{"name":"pds","id":"kRzGt"},{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"U66Pl"},{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"rnlPA"},{"name":"beam","class":2,"leftArc":"AP","numArcs":3,"id":"pxn5M"},{"name":"beam","class":2,"leftArc":"F","numArcs":3,"id":"Y174V"},{"name":"beam","class":2,"leftArc":"FP","numArcs":3,"id":"eySY3"}],"ordnance":[],"extras":[],"fighters":[],"mass":50,"class":"Tacoma Class Light Cruiser","name":"Aaron","points":107,"cpv":102,"notes":"The *Huron* is a rebuild of the earlier Hoshino class hulls that were built between 2157 and 2165; the lack of a suitable replacement CL design in the mid-2170s caused the Admiralty to look at ways of extending the service life of the obsolescent **Hoshinos**, and the Huron was the outcome of the project study. Projected operational life of the totally-refitted ships is now well into the 2190s, and there are even a handful of new hulls being built to the updated design."}`;

describe("Root exports", () => {
    it("Valid Tacoma class cruiser evaluates correctly", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        const evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        expect(evaluation.mass).to.equal(45);
        expect(evaluation.points).to.equal(107);
        expect(evaluation.cpv).to.equal(102);
    });
    it("Error Codes: NoMass", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.mass = undefined;
        let evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([ErrorCode.NoMass]);
        delete ship.mass;
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([ErrorCode.NoMass]);
    });
    it("Error Codes: BadMass", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.mass = 1;
        let evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([ErrorCode.BadMass]);
        ship.mass = 301;
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([ErrorCode.BadMass, ErrorCode.LowHull]);
    });
    it("Error Codes: LowHull", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.hull!.points = 1;
        let evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([ErrorCode.LowHull]);
        delete ship.hull;
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([ErrorCode.LowHull]);
    });
    it("Error Codes: OverShell", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.armour = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
        let evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([ErrorCode.OverShell]);
    });
    it("Error Codes: OverArmour", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.armour = [[10,0]];
        let evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([ErrorCode.OverArmour]);
    });
    it("Error Codes: OverMarine", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.systems!.push({name: "marines"});
        ship.systems!.push({name: "marines"});
        ship.systems!.push({name: "marines"});
        let evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({name: "marines"});
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([ErrorCode.OverMarine]);
        ship.systems!.push({name: "bay", type: "troop", capacity: 1, id: "test"});
        evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({name: "marines"});
        ship.systems!.push({name: "marines"});
        evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({name: "marines"});
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([ErrorCode.OverMarine]);
    });
    it("Error Codes: OverDCP", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.systems!.push({name: "damageControl"});
        ship.systems!.push({name: "damageControl"});
        ship.systems!.push({name: "damageControl"});
        let evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({name: "damageControl"});
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([ErrorCode.OverDCP]);
        ship.systems!.push({name: "bay", type: "passenger", capacity: 1, id: "test"});
        evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({name: "damageControl"});
        ship.systems!.push({name: "damageControl"});
        ship.systems!.push({name: "damageControl"});
        evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({name: "damageControl"});
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([ErrorCode.OverDCP]);
    });
    it("Error Codes: OverCrew", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.systems!.push({name: "damageControl"});
        ship.systems!.push({name: "damageControl"});
        ship.systems!.push({name: "marines"});
        let evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({name: "marines"});
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([ErrorCode.OverCrew]);
    });
    it("Error Codes: OverSpinal", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.weapons!.push({name: "spinalBeam", range: "medium"})
        let evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.weapons!.push({name: "spinalBeam", range: "short"})
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([ErrorCode.OverSpinal]);
    });
    it("Error Codes: OverTurret", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.systems!.push({name: "turret", leftArc: "F", numArcs: 1})
        let evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({name: "turret", leftArc: "F", numArcs: 1})
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([ErrorCode.OverTurret]);
    });
});
