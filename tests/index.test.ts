import { expect } from "chai";
import "mocha";

import type { FullThrustShip } from "../src/schemas/ship.js";
import { EvalErrorCode, ValErrorCode, evaluate, validate } from "../src/index.js";
import type { IValidation } from "../src/index.js";
import { renderSvg, renderUri, calcRot, rotArc } from "../src/index.js";

const validTacoma = `{"hull":{"points":15,"rows":4,"stealth":"0","streamlining":"none"},"armour":[],"systems":[{"name":"drive","thrust":6,"advanced":false,"id":"CX-A9"},{"name":"ftl","advanced":false,"id":"O_hFB"},{"name":"fireControl","id":"1lIra"},{"name":"fireControl","id":"z8Ahb"},{"name":"screen","id":"xJc7e"}],"weapons":[{"name":"pds","id":"zkCHa"},{"name":"pds","id":"kRzGt"},{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"U66Pl"},{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"rnlPA"},{"name":"beam","class":2,"leftArc":"AP","numArcs":3,"id":"pxn5M"},{"name":"beam","class":2,"leftArc":"F","numArcs":3,"id":"Y174V"},{"name":"beam","class":2,"leftArc":"FP","numArcs":3,"id":"eySY3"}],"ordnance":[],"extras":[],"fighters":[],"mass":50,"class":"Tacoma Class Light Cruiser","name":"Aaron","points":167,"cpv":142,"notes":"The *Huron* is a rebuild of the earlier Hoshino class hulls that were built between 2157 and 2165; the lack of a suitable replacement CL design in the mid-2170s caused the Admiralty to look at ways of extending the service life of the obsolescent **Hoshinos**, and the Huron was the outcome of the project study. Projected operational life of the totally-refitted ships is now well into the 2190s, and there are even a handful of new hulls being built to the updated design.","invaders":[{"type":"marines"},{"type":"damageControl","owner":1},{"type":"damageControl","owner":"test"}],"orientation":"alpha"}`;
// const validTacoma = `{"hull":{"points":15,"rows":4,"stealth":"0","streamlining":"none"},"armour":[],"systems":[{"name":"drive","thrust":4,"advanced":false,"id":"CX-A9"},{"name":"ftl","advanced":false,"id":"O_hFB"},{"name":"fireControl","id":"1lIra"},{"name":"fireControl","id":"z8Ahb"},{"name":"screen","id":"xJc7e"}],"weapons":[{"name":"pds","id":"zkCHa"},{"name":"pds","id":"kRzGt"},{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"U66Pl"},{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"rnlPA"},{"name":"beam","class":2,"leftArc":"AP","numArcs":3,"id":"pxn5M"},{"name":"beam","class":2,"leftArc":"F","numArcs":3,"id":"Y174V"},{"name":"beam","class":2,"leftArc":"FP","numArcs":3,"id":"eySY3"}],"ordnance":[],"extras":[],"fighters":[],"mass":50,"class":"Tacoma Class Light Cruiser","name":"Aaron","points":157,"cpv":132,"notes":"The *Huron* is a rebuild of the earlier Hoshino class hulls that were built between 2157 and 2165; the lack of a suitable replacement CL design in the mid-2170s caused the Admiralty to look at ways of extending the service life of the obsolescent **Hoshinos**, and the Huron was the outcome of the project study. Projected operational life of the totally-refitted ships is now well into the 2190s, and there are even a handful of new hulls being built to the updated design.","invaders":[{"type":"marines"},{"type":"damageControl","owner":1},{"type":"damageControl","owner":"test"}]}`;

describe("Root exports: Evaluate", () => {
    it("Valid Tacoma class cruiser evaluates correctly", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        const evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        expect(evaluation.mass).to.equal(50);
        expect(evaluation.points).to.equal(167);
        expect(evaluation.cpv).to.equal(142);
    });
    it("Error Codes: NoMass", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.mass = undefined;
        let evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([EvalErrorCode.NoMass]);
        delete ship.mass;
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([EvalErrorCode.NoMass]);
    });
    it("Error Codes: BadMass", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.mass = 1;
        let evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([EvalErrorCode.BadMass, EvalErrorCode.OverMass]);
        ship.mass = 301;
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([EvalErrorCode.BadMass, EvalErrorCode.LowHull]);
    });
    it("Error Codes: LowHull", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.hull!.points = 1;
        let evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([EvalErrorCode.LowHull]);
        delete ship.hull;
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([EvalErrorCode.LowHull]);
    });
    it("Error Codes: OverArmour", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.armour = [[10,0]];
        let evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([EvalErrorCode.OverMass]);
    });
    it("Error Codes: OverMarine", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.mass! += 1;
        ship.systems!.push({name: "marines"});
        ship.systems!.push({name: "marines"});
        ship.systems!.push({name: "marines"});
        let evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({name: "marines"});
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([EvalErrorCode.OverMarine]);
        ship.systems!.push({name: "bay", type: "troop", capacity: 3, id: "test"});
        evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({name: "marines"});
        ship.systems!.push({name: "marines"});
        evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({name: "marines"});
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([EvalErrorCode.OverMarine]);
    });
    it("Error Codes: OverDCP", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.mass! += 1;
        ship.systems!.push({name: "damageControl"});
        ship.systems!.push({name: "damageControl"});
        ship.systems!.push({name: "damageControl"});
        let evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({name: "damageControl"});
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([EvalErrorCode.OverDCP]);
        ship.systems!.push({name: "bay", type: "passenger", capacity: 4, id: "test"});
        evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({name: "damageControl"});
        ship.systems!.push({name: "damageControl"});
        ship.systems!.push({name: "damageControl"});
        evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({name: "damageControl"});
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([EvalErrorCode.OverDCP]);
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
        expect(evaluation.errors).to.have.deep.members([EvalErrorCode.OverCrew]);
    });
    it("Error Codes: OverSpinal", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.weapons!.push({name: "spinalBeam", range: "medium"})
        let evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(1);
        expect(evaluation.errors).to.have.deep.members([EvalErrorCode.OverMass]);
        ship.weapons!.push({name: "spinalBeam", range: "short"})
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([EvalErrorCode.OverSpinal, EvalErrorCode.OverMass]);
    });
    it("Error Codes: OverTurret", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.systems!.push({name: "turret", leftArc: "F", numArcs: 1})
        let evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({name: "turret", leftArc: "F", numArcs: 1})
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([EvalErrorCode.OverTurret]);
    });
    it("Error Codes: DblUid", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        for (let sys of ship.systems!) {
            if (sys.name === "fireControl") {
                sys.id="duplicate";
            }
        }
        let evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(1);
        expect(evaluation.errors).to.have.deep.members([EvalErrorCode.DblUID]);
    });
});

describe("Root exports: Validate", () => {
    it ("All good", () => {
        const results = validate(validTacoma);
        expect(results.valid).to.be.true;
        expect(results.ajvErrors).to.be.undefined;
    });
    it("Bad JSON", () => {
        const badTacoma = validTacoma.replace(`"armour":[]`, `"armour": ""`);
        const results = validate(badTacoma);
        expect(results.valid).to.be.false;
        expect(results.code).to.be.equal(ValErrorCode.BadJSON);
        expect(results.ajvErrors).not.to.be.undefined;
        expect (results.ajvErrors!.length).to.be.greaterThan(0);
    });
    it("Bad construction", () => {
        const badTacoma = validTacoma.replace(`"armour":[]`, `"armour": [[10,10]]`);
        const results = validate(badTacoma);
        expect(results.valid).to.be.false;
        expect(results.code).to.be.equal(ValErrorCode.BadConstruction);
        expect(results.ajvErrors).to.be.undefined;
        expect(results.evalErrors).not.to.be.undefined
        expect (results.evalErrors!.length).to.be.greaterThan(0);
    });
    it("Points mismatch", () => {
        const badTacoma = validTacoma.replace(`"points":167,"cpv":142`, `"points":106,"cpv":103`);
        const results = validate(badTacoma);
        expect(results.valid).to.be.false;
        expect(results.code).to.be.equal(ValErrorCode.PointsMismatch);
        expect(results.ajvErrors).to.be.undefined;
        expect(results.evalErrors).to.be.undefined;
    });
});

describe("Renderer", () => {
    it("Rotational distance calculated correctly", () => {
        let n = calcRot("F", "F");
        expect(n).equal(0);
        n = calcRot("F", "FS");
        expect(n).equal(1);
        n = calcRot("F", "AS");
        expect(n).equal(2);
        n = calcRot("F", "A");
        expect(n).equal(3);
        n = calcRot("F", "AP");
        expect(n).equal(4);
        n = calcRot("F", "FP");
        expect(n).equal(5);
        n = calcRot("FP", "F");
        expect(n).equal(1);
        n = calcRot("FP", "FS");
        expect(n).equal(2);
        n = calcRot("FP", "AS");
        expect(n).equal(3);
        n = calcRot("FP", "A");
        expect(n).equal(4);
        n = calcRot("FP", "AP");
        expect(n).equal(5);
        n = calcRot("FP", "FP");
        expect(n).equal(0);
    });

    it("Arcs rotate correctly", () => {
        let arc = rotArc("F", 0);
        expect(arc).equal("F");
        arc = rotArc("F", 1);
        expect(arc).equal("FS");
        arc = rotArc("F", 2);
        expect(arc).equal("AS");
        arc = rotArc("F", 3);
        expect(arc).equal("A");
        arc = rotArc("F", 4);
        expect(arc).equal("AP");
        arc = rotArc("F", 5);
        expect(arc).equal("FP");
        arc = rotArc("F", 6);
        expect(arc).equal("F");
        arc = rotArc("F", 7);
        expect(arc).equal("FS");
    });

    it("Export", () => {
        const toExport = `{"hull":{"points":15,"rows":3,"stealth":"0","streamlining":"none"},"armour":[[3,2],[3,0]],"systems":[{"name":"drive","thrust":0,"advanced":false,"id":"Dui3J"}],"weapons":[],"ordnance":[],"extras":[],"fighters":[],"orientation":"alpha","points":121,"cpv":96,"mass":50,"class":"Light Cruiser","name":"Test"}`;
        console.log(renderSvg(JSON.parse(toExport), {damage: 2, armour: [[1,1],[1,1]]}));
    });
});
