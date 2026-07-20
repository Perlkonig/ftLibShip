import { expect } from "chai";
import "mocha";

import type { FullThrustShip } from "../src/schemas/ship.js";
import {
    EvalErrorCode,
    ValErrorCode,
    evaluate,
    validate,
} from "../src/index.js";
import type { IValidation } from "../src/index.js";
import { renderSvg, renderUri, calcRot, rotArc, resolveAmmunitionRemaining } from "../src/index.js";
import { scopeInternalIds } from "../src/lib/scopeInternalIds.js";
import { Kgun } from "../src/lib/systems/kgun.js";
import { Phaser } from "../src/lib/systems/phaser.js";
import { Turret } from "../src/lib/systems/turret.js";
import { Magazine } from "../src/lib/systems/magazine.js";
import { BoardingTorpedoMagazine } from "../src/lib/systems/boardingTorpedoMagazine.js";
import { BoardingTorpedoLauncher } from "../src/lib/systems/boardingTorpedoLauncher.js";

const validTacoma = `{"hull":{"points":15,"rows":4,"stealth":"0","streamlining":"none"},"armour":[],"systems":[{"name":"drive","thrust":6,"advanced":false,"id":"CX-A9"},{"name":"ftl","advanced":false,"id":"O_hFB"},{"name":"fireControl","id":"1lIra"},{"name":"fireControl","id":"z8Ahb"},{"name":"screen","id":"xJc7e"}],"weapons":[{"name":"pds","id":"zkCHa"},{"name":"pds","id":"kRzGt"},{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"U66Pl"},{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"rnlPA"},{"name":"beam","class":2,"leftArc":"AP","numArcs":3,"id":"pxn5M"},{"name":"beam","class":2,"leftArc":"F","numArcs":3,"id":"Y174V"},{"name":"beam","class":2,"leftArc":"FP","numArcs":3,"id":"eySY3"}],"ordnance":[],"extras":[],"fighters":[],"mass":50,"class":"Tacoma Class Light Cruiser","name":"Aaron","points":167,"cpv":142,"notes":"The *Huron* is a rebuild of the earlier Hoshino class hulls that were built between 2157 and 2165; the lack of a suitable replacement CL design in the mid-2170s caused the Admiralty to look at ways of extending the service life of the obsolescent **Hoshinos**, and the Huron was the outcome of the project study. Projected operational life of the totally-refitted ships is now well into the 2190s, and there are even a handful of new hulls being built to the updated design.","orientation":"alpha"}`;
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
        expect(evaluation.errors).to.have.deep.members([
            EvalErrorCode.BadMass,
            EvalErrorCode.OverMass,
        ]);
        ship.mass = 301;
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([
            EvalErrorCode.BadMass,
            EvalErrorCode.LowHull,
        ]);
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
        ship.armour = [[10, 0]];
        let evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([
            EvalErrorCode.OverMass,
        ]);
    });
    it("Error Codes: OverMarine", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.mass! += 1;
        ship.systems!.push({ name: "marines" });
        ship.systems!.push({ name: "marines" });
        ship.systems!.push({ name: "marines" });
        let evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({ name: "marines" });
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([
            EvalErrorCode.OverMarine,
        ]);
        ship.systems!.push({
            name: "bay",
            type: "troop",
            capacity: 3,
            id: "test",
        });
        evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({ name: "marines" });
        ship.systems!.push({ name: "marines" });
        evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({ name: "marines" });
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([
            EvalErrorCode.OverMarine,
        ]);
    });
    it("Error Codes: OverDCP", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.mass! += 1;
        ship.systems!.push({ name: "damageControl" });
        ship.systems!.push({ name: "damageControl" });
        ship.systems!.push({ name: "damageControl" });
        let evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({ name: "damageControl" });
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([EvalErrorCode.OverDCP]);
        ship.systems!.push({
            name: "bay",
            type: "passenger",
            capacity: 4,
            id: "test",
        });
        evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({ name: "damageControl" });
        ship.systems!.push({ name: "damageControl" });
        ship.systems!.push({ name: "damageControl" });
        evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({ name: "damageControl" });
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([EvalErrorCode.OverDCP]);
    });
    it("Error Codes: OverDCP on civilian ship", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.civilian = true;
        ship.mass = 100;
        ship.systems!.push(
            { name: "damageControl" },
            { name: "damageControl" },
            { name: "damageControl" }
        );
        expect(evaluate(ship).errors).to.include(EvalErrorCode.OverDCP);
    });
    it("Error Codes: OverCrew", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.systems!.push({ name: "damageControl" });
        ship.systems!.push({ name: "damageControl" });
        ship.systems!.push({ name: "marines" });
        let evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({ name: "marines" });
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([
            EvalErrorCode.OverCrew,
        ]);
    });
    it("Error Codes: OverSpinal", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.weapons!.push({ name: "spinalBeam", range: "medium" });
        let evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(1);
        expect(evaluation.errors).to.have.deep.members([
            EvalErrorCode.OverMass,
        ]);
        ship.weapons!.push({ name: "spinalBeam", range: "short" });
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([
            EvalErrorCode.OverSpinal,
            EvalErrorCode.OverMass,
        ]);
    });
    it("Error Codes: OverTurret", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.systems!.push({ name: "turret", leftArc: "F", numArcs: 1 });
        let evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(0);
        ship.systems!.push({ name: "turret", leftArc: "F", numArcs: 1 });
        evaluation = evaluate(ship);
        expect(evaluation.errors).to.have.deep.members([
            EvalErrorCode.OverTurret,
        ]);
    });
    it("Error Codes: DblUid", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        for (let sys of ship.systems!) {
            if (sys.name === "fireControl") {
                sys.id = "duplicate";
            }
        }
        let evaluation = evaluate(ship);
        expect(evaluation.errors.length).to.equal(1);
        expect(evaluation.errors).to.have.deep.members([EvalErrorCode.DblUID]);
    });
    it("Error Codes: UnknownSystem", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.systems!.push({ name: "notARealSystem" } as never);
        const evaluation = evaluate(ship);
        expect(evaluation.errors).to.include(EvalErrorCode.UnknownSystem);
    });
});

describe("Root exports: Validate", () => {
    it("All good", () => {
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
        expect(results.ajvErrors!.length).to.be.greaterThan(0);
    });
    it("Bad JSON syntax", () => {
        const results = validate("{not json");
        expect(results.valid).to.be.false;
        expect(results.code).to.be.equal(ValErrorCode.BadJSON);
        expect(results.ajvErrors).to.be.undefined;
    });
    it("Bad construction", () => {
        const badTacoma = validTacoma.replace(
            `"armour":[]`,
            `"armour": [[10,10]]`
        );
        const results = validate(badTacoma);
        expect(results.valid).to.be.false;
        expect(results.code).to.be.equal(ValErrorCode.BadConstruction);
        expect(results.ajvErrors).to.be.undefined;
        expect(results.evalErrors).not.to.be.undefined;
        expect(results.evalErrors!.length).to.be.greaterThan(0);
    });
    it("Points mismatch", () => {
        const badTacoma = validTacoma.replace(
            `"points":167,"cpv":142`,
            `"points":106,"cpv":103`
        );
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

    it("RenderOpts produce expected SVG markers", () => {
        const ship = JSON.parse(validKonstantin) as FullThrustShip;
        ship.flawed = true;
        ship.armour = [[3, 2], [2, 0]];
        ship.hashseed = "demo";
        const svg = renderSvg(ship, {
            damage: 2,
            armour: [
                [1, [1, 1]],
                [1, [0, 0]],
            ],
            disabled: ["_corePower", "Vj_AN"],
            destroyed: ["Ds8zO", "C6rZc"],
            invaders: [
                { type: "marines" },
                { type: "damageControl", owner: 1 },
            ],
            invertFooter: true,
        });
        expect(svg).to.be.a("string");
        expect(svg).to.include("Invaders");
        expect(svg).to.include("svglib_hullDamaged");
        expect(svg).to.include('class="disabled"');
        expect(svg).to.include('class="destroyed"');
        expect(svg).to.include("svgInvert");
        expect(svg).to.match(
            /id="_internalCorePower"[\s\S]*?class="_rect" fill="red"/
        );
        expect(svg).to.include("svglib_armourRegenLost");
        expect(svg).to.include("svglib_armourRegenDamaged");
    });

    it("ammunition reduces mine and magazine icons on SSD", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.systems!.push(
            { name: "mineLayer", capacity: 4, id: "minesA" },
            { name: "magazine", capacity: 3, id: "mag1" }
        );
        ship.ordnance = [
            {
                name: "salvoLauncher",
                leftArc: "FP",
                numArcs: 3,
                magazine: "mag1",
                id: "launch1",
            },
        ];
        const sectionUseCount = (
            svg: string,
            heading: string,
            nextHeading: string
        ) => {
            const start = svg.indexOf(heading);
            const end = svg.indexOf(nextHeading, start + 1);
            const section = svg.slice(start, end > start ? end : undefined);
            return (section.match(/<use /g) ?? []).length;
        };
        const full = renderSvg(ship)!;
        const partial = renderSvg(ship, {
            ammunition: { minesA: 2, mag1: 1 },
        })!;
        expect(sectionUseCount(full, ">Mines<", ">Magazine<")).to.equal(4);
        expect(sectionUseCount(partial, ">Mines<", ">Magazine<")).to.equal(2);
        expect(sectionUseCount(full, ">Magazine<", ">Weapons<")).to.equal(4);
        expect(sectionUseCount(partial, ">Magazine<", ">Weapons<")).to.equal(2);
        expect(resolveAmmunitionRemaining(4, "minesA", { minesA: 99 })).to.equal(
            4
        );
        expect(resolveAmmunitionRemaining(4, "minesA", { minesA: -1 })).to.equal(
            0
        );
    });

    it("boarding torpedo magazine and launcher mass/points", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        const mag = new BoardingTorpedoMagazine(
            { name: "boardingTorpedoMagazine", capacity: 4, id: "btMag" },
            ship
        );
        expect(mag.mass()).to.equal(4);
        expect(mag.points()).to.equal(12);
        expect(mag.fullName()).to.equal("Boarding Torpedo Magazine");

        const launcher = new BoardingTorpedoLauncher(
            {
                name: "boardingTorpedoLauncher",
                leftArc: "FS",
                numArcs: 3,
                magazine: "btMag",
                id: "btL1",
            },
            ship
        );
        expect(launcher.mass()).to.equal(2);
        expect(launcher.points()).to.equal(6);
        expect(launcher.glyph().svg).to.include(">BT<");
    });

    it("boarding torpedo launcher renders in magazine section, not weapons", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.systems!.push({
            name: "boardingTorpedoMagazine",
            capacity: 3,
            id: "btMag1",
        });
        ship.weapons!.push({
            name: "boardingTorpedoLauncher",
            leftArc: "FS",
            numArcs: 3,
            magazine: "btMag1",
            id: "btL1",
        });
        const sectionUseCount = (
            svg: string,
            heading: string,
            nextHeading: string
        ) => {
            const start = svg.indexOf(heading);
            const end = svg.indexOf(nextHeading, start + 1);
            const section = svg.slice(start, end > start ? end : undefined);
            return (section.match(/<use /g) ?? []).length;
        };
        const full = renderSvg(ship)!;
        const partial = renderSvg(ship, { ammunition: { btMag1: 1 } })!;
        expect(sectionUseCount(full, ">Magazine<", ">Weapons<")).to.equal(4);
        expect(sectionUseCount(partial, ">Magazine<", ">Weapons<")).to.equal(2);
        expect(full).to.include('id="btL1"');
    });

    it("BadMagazinePairing when launcher and magazine ammo types mismatch", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.systems!.push(
            {
                name: "boardingTorpedoMagazine",
                capacity: 6,
                id: "btMag1",
            },
            { name: "magazine", capacity: 6, id: "mag1" }
        );
        ship.ordnance = [
            {
                name: "salvoLauncher",
                leftArc: "FP",
                numArcs: 3,
                magazine: "btMag1",
                id: "salvoL1",
            },
        ];
        ship.weapons!.push({
            name: "boardingTorpedoLauncher",
            leftArc: "FP",
            numArcs: 3,
            magazine: "mag1",
            id: "btL1",
        });
        const evaluation = evaluate(ship);
        expect(evaluation.errors).to.include(EvalErrorCode.BadMagazinePairing);
        expect(
            evaluation.errors.filter(
                (e) => e === EvalErrorCode.BadMagazinePairing
            ).length
        ).to.equal(2);
    });

    it("plain salvo magazine evaluates without errors", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.systems!.push({ name: "magazine", capacity: 6, id: "mag1" });
        const evaluation = evaluate(ship);
        expect(evaluation.errors).to.not.include(
            EvalErrorCode.BadMagazinePairing
        );
    });

    it("disabled without destroyed still applies styling", () => {
        const ship = JSON.parse(validKonstantin) as FullThrustShip;
        const svg = renderSvg(ship, { disabled: ["Vj_AN"] });
        expect(svg).to.include('class="disabled"');
    });

    it("damaged drive shows halved thrust in red", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        const svg = renderSvg(ship, { disabled: ["CX-A9"] });
        expect(svg).to.match(/font-size="400" fill="red"[^>]*>3</);
    });

    it("damaged thrust-1 drive shows 0 in red", () => {
        const ship = JSON.parse(validKonstantin) as FullThrustShip;
        const drive = ship.systems!.find((s) => s.name === "drive")!;
        drive.thrust = 1;
        const svg = renderSvg(ship, { disabled: ["q7Leg"] });
        expect(svg).to.match(/font-size="400" fill="red"[^>]*>0</);
    });

    it("destroyed drive shows 0 thrust in red", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        const svg = renderSvg(ship, { destroyed: ["CX-A9"] });
        expect(svg).to.match(/font-size="400" fill="red"[^>]*>0</);
        expect(svg).to.include('class="destroyed"');
    });

    it("invader owner is rendered", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        const svg = renderSvg(ship, {
            invaders: [{ type: "damageControl", owner: "P2" }],
        });
        expect(svg).to.include(">P2<");
    });

    it("deployed systems and builtin DCP render greyed", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.systems!.push(
            { name: "damageControl", id: "dcp1" },
            { name: "marines", id: "m1" }
        );
        const svg = renderSvg(ship, {
            deployed: ["dcp1", "m1"],
            deployedBuiltinDcp: 1,
        });
        expect(svg).to.match(/id="dcp1"[^>]*class="disabled"/);
        expect(svg).to.match(/id="m1"[^>]*class="disabled"/);
        expect(svg).to.match(
            /href="#svglib_hullCrew"[^>]*class="disabled"/
        );
    });

    it("renderSvg does not mutate input ship", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        const before = JSON.stringify(ship);
        renderSvg(ship, { damage: 1 });
        expect(JSON.stringify(ship)).to.equal(before);
    });

    it("renderUri returns a data URI", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        const uri = renderUri(ship);
        expect(uri).to.match(/^data:image\/svg\+xml/);
    });

    it("scopeInternalIds namespaces nested symbol ids and hrefs", () => {
        const svg = `<symbol id="outer"><defs><symbol id="_internalFoo" viewBox="0 0 1 1"/><symbol id="_internalFooBar" viewBox="0 0 1 1"/></defs><use href="#_internalFooBar"/><use href="#_internalFoo"/></symbol>`;
        const scoped = scopeInternalIds("outer", svg);
        expect(scoped).to.include('id="outer_internalFooBar"');
        expect(scoped).to.include('id="outer_internalFoo"');
        expect(scoped).to.include('href="#outer_internalFooBar"');
        expect(scoped).to.include('href="#outer_internalFoo"');
        expect(scoped).not.to.include('id="_internalFoo"');
        expect(scoped).not.to.include('href="#_internalFoo"');
    });

    it("renderSvg output has no duplicate element ids", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.systems = [
            { name: "drive", thrust: 6, advanced: false, id: "CX-A9" },
            { name: "ftl", advanced: false, id: "O_hFB" },
            {
                name: "magazine",
                capacity: 2,
                modifier: "er",
                id: "mag1",
            },
            {
                name: "magazine",
                capacity: 3,
                modifier: "er",
                id: "mag2",
            },
        ];
        ship.weapons = [
            { name: "ads", leftArc: "F", numArcs: 3, id: "ads1" },
            { name: "ads", leftArc: "FP", numArcs: 3, id: "ads2" },
        ];
        ship.ordnance = [{ name: "salvo", modifier: "er", id: "salvo1" }];
        const svg = renderSvg(ship);
        expect(svg).to.be.a("string");
        const ids = [...svg!.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
        const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
        expect(dupes).to.deep.equal([]);
    });
});

describe("Mass calculations", () => {
    it("K-guns", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        const kgun = { name: "kgun", modifier: "none", class: 1 };
        let mass = new Kgun(kgun, ship).mass();
        expect(mass).equal(2);
        mass = new Kgun({ ...kgun, class: 2, numArcs: 1 }, ship).mass();
        expect(mass).equal(3);
        mass = new Kgun({ ...kgun, class: 3 }, ship).mass();
        expect(mass).equal(5);
        mass = new Kgun({ ...kgun, class: 4 }, ship).mass();
        expect(mass).equal(8);
        mass = new Kgun({ ...kgun, class: 5 }, ship).mass();
        expect(mass).equal(11);
        mass = new Kgun({ ...kgun, class: 6 }, ship).mass();
        expect(mass).equal(14);
        mass = new Kgun({ ...kgun, class: 7 }, ship).mass();
        expect(mass).equal(17);
        mass = new Kgun({ ...kgun, class: 8 }, ship).mass();
        expect(mass).equal(20);
        mass = new Kgun({ ...kgun, class: 9 }, ship).mass();
        expect(mass).equal(23);
        mass = new Kgun({ ...kgun, class: 10 }, ship).mass();
        expect(mass).equal(26);
        mass = new Kgun({ ...kgun, modifier: "short" }, ship).mass();
        expect(mass).equal(1.5);
    });
    it("Phasers use any advanced fire control", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.systems = [
            { name: "fireControl", id: "standard" },
            { name: "fireControl", advanced: true, id: "advanced" },
        ];
        const phaser = new Phaser(
            { name: "phaser", class: 1, numArcs: 3 },
            ship
        );
        expect(phaser.mass()).to.equal(1);
        expect(phaser.points()).to.equal(6);
    });
    it("Turret mass handles invalid numArcs", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        const turret = new Turret(
            { name: "turret", numArcs: 99 as 1, weapons: [] },
            ship
        );
        expect(turret.mass()).to.equal(0);
    });
});

describe("Flawed designs", () => {
    it("Under weight caught", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.flawed = true;
        const results = evaluate(ship);
        expect(results.errors).to.have.deep.members([
            EvalErrorCode.FlawedUnderMass,
        ]);
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
