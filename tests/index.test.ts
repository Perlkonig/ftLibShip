import { expect } from "chai";
import "mocha";

import type { FullThrustShip } from "../src/schemas/ship.js";
import { EvalErrorCode, ValErrorCode, evaluate, validate } from "../src/index.js";
import type { IValidation } from "../src/index.js";
import { renderSvg, renderUri, calcRot, rotArc } from "../src/index.js";
import { Kgun } from "../src/lib/systems/kgun.js";

const validTacoma = `{"hull":{"points":15,"rows":4,"stealth":"0","streamlining":"none"},"armour":[],"systems":[{"name":"drive","thrust":6,"advanced":false,"id":"CX-A9"},{"name":"ftl","advanced":false,"id":"O_hFB"},{"name":"fireControl","id":"1lIra"},{"name":"fireControl","id":"z8Ahb"},{"name":"screen","id":"xJc7e"}],"weapons":[{"name":"pds","id":"zkCHa"},{"name":"pds","id":"kRzGt"},{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"U66Pl"},{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"rnlPA"},{"name":"beam","class":2,"leftArc":"AP","numArcs":3,"id":"pxn5M"},{"name":"beam","class":2,"leftArc":"F","numArcs":3,"id":"Y174V"},{"name":"beam","class":2,"leftArc":"FP","numArcs":3,"id":"eySY3"}],"ordnance":[],"extras":[],"fighters":[],"mass":50,"class":"Tacoma Class Light Cruiser","name":"Aaron","points":167,"cpv":142,"notes":"The *Huron* is a rebuild of the earlier Hoshino class hulls that were built between 2157 and 2165; the lack of a suitable replacement CL design in the mid-2170s caused the Admiralty to look at ways of extending the service life of the obsolescent **Hoshinos**, and the Huron was the outcome of the project study. Projected operational life of the totally-refitted ships is now well into the 2190s, and there are even a handful of new hulls being built to the updated design.","invaders":[{"type":"marines"},{"type":"damageControl","owner":1},{"type":"damageControl","owner":"test"}],"orientation":"alpha"}`;
const validKonstantin = `{"hull":{"points":72,"rows":4,"stealth":"0","streamlining":"none"},"armour":[],"systems":[{"name":"drive","thrust":2,"advanced":false,"id":"q7Leg"},{"name":"ftl","advanced":false,"id":"ldkgq"},{"name":"screen","area":false,"advanced":false,"id":"xv2qU"},{"name":"screen","area":false,"advanced":false,"id":"ZqYDP"},{"name":"fireControl","id":"mdpi2"},{"name":"fireControl","id":"IqDbI"},{"name":"hangar","id":"EQ2W6","isRack":false,"critRules":false},{"name":"hangar","id":"sw_ET","isRack":false,"critRules":false},{"name":"hangar","id":"DRonE","isRack":false,"critRules":false},{"name":"hangar","id":"5hxLH","isRack":false,"critRules":false},{"name":"hangar","id":"FJl7X","isRack":false,"critRules":false},{"name":"hangar","id":"I4LWH","isRack":false,"critRules":false}],"weapons":[{"name":"pds","id":"l5LdK"},{"name":"pds","id":"vwGAa"},{"name":"pds","id":"gh3ru"},{"name":"pds","id":"aDMFK"},{"name":"pds","id":"IpY96"},{"name":"pds","id":"25H7F"},{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"BepZp"},{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"Ds8zO"},{"name":"beam","class":2,"leftArc":"AP","numArcs":3,"id":"Vj_AN"},{"name":"beam","class":2,"leftArc":"AP","numArcs":3,"id":"ERb4o"},{"name":"beam","class":2,"leftArc":"F","numArcs":3,"id":"Ve2aC"},{"name":"beam","class":2,"leftArc":"F","numArcs":3,"id":"C6rZc"},{"name":"beam","class":3,"leftArc":"AP","numArcs":3,"id":"r34r8"},{"name":"beam","class":3,"leftArc":"FP","numArcs":3,"id":"1mABJ"},{"name":"beam","class":3,"leftArc":"FP","numArcs":3,"id":"xjptS"},{"name":"beam","class":3,"leftArc":"F","numArcs":3,"id":"7fLe0"}],"ordnance":[],"extras":[],"fighters":[{"name":"fighters","type":"standard","id":"lgrLB","mods":[],"hangar":"EQ2W6"},{"name":"fighters","type":"standard","id":"4xXE-","mods":[],"hangar":"sw_ET"},{"name":"fighters","type":"standard","id":"viaG3","mods":[],"hangar":"DRonE"},{"name":"fighters","type":"standard","id":"pdLwG","mods":[],"hangar":"5hxLH"},{"name":"fighters","type":"standard","id":"brJEp","mods":[],"hangar":"FJl7X"},{"name":"fighters","type":"standard","id":"ykKy1","mods":[],"hangar":"I4LWH"}],"orientation":"alpha","points":842,"cpv":840,"mass":240,"class":"Attack Carrier","name":"Konstantin"}`;

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
        // const toExport = `{"hull":{"points":15,"rows":3,"stealth":"0","streamlining":"none"},"armour":[[3,2],[3,0]],"systems":[{"name":"drive","thrust":5,"advanced":false,"id":"Dui3J"}],"weapons":[{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"5h1Dc"},{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"5h1De"},{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"5h1Dd"}],"ordnance":[],"extras":[],"fighters":[],"orientation":"alpha","points":124,"cpv":99,"mass":50,"class":"Light Cruiser","name":"Test"}`;
        const ship = JSON.parse(validKonstantin) as FullThrustShip;
        ship.flawed = true;
        console.log(renderSvg(ship, {damage: 2, /*armour: [[1,1],[1,1]],*/ disabled: ["_corePower", "Vj_AN"], destroyed: ["Ds8zO", "C6rZc"]}));
    });
});

describe("Mass calculations", () => {
    it("K-guns", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        const kgun = {name: "kgun", modifier: "none", class: 1};
        let mass = new Kgun(kgun, ship).mass();
        expect(mass).equal(2);
        mass = new Kgun({...kgun, class: 2, numArcs: 1}, ship).mass();
        expect(mass).equal(3);
        mass = new Kgun({...kgun, class: 3}, ship).mass();
        expect(mass).equal(5);
        mass = new Kgun({...kgun, class: 4}, ship).mass();
        expect(mass).equal(8);
        mass = new Kgun({...kgun, class: 5}, ship).mass();
        expect(mass).equal(11);
        mass = new Kgun({...kgun, class: 6}, ship).mass();
        expect(mass).equal(14);
        mass = new Kgun({...kgun, class: 7}, ship).mass();
        expect(mass).equal(17);
        mass = new Kgun({...kgun, class: 8}, ship).mass();
        expect(mass).equal(20);
        mass = new Kgun({...kgun, class: 9}, ship).mass();
        expect(mass).equal(23);
        mass = new Kgun({...kgun, class: 10}, ship).mass();
        expect(mass).equal(26);
        mass = new Kgun({...kgun, modifier: "short"}, ship).mass();
        expect(mass).equal(1.5);
    });
});

describe("Flawed designs", () => {
    it("Under weight caught", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.flawed = true;
        const results = evaluate(ship);
        expect(results.errors).to.have.deep.members([EvalErrorCode.FlawedUnderMass]);
    });
    it("Correctly applied", () => {
        const ship = JSON.parse(validKonstantin) as FullThrustShip;
        ship.flawed = true;
        const results = evaluate(ship);
        expect(results.errors.length).to.equal(0);
        expect(results.mass).to.equal(240);
        expect(results.points).to.equal(674);
        expect(results.cpv).to.equal(672);
    });
});
