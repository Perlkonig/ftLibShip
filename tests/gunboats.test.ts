import { expect } from "chai";
import "mocha";

import type { FullThrustShip } from "../src/schemas/ship.js";
import {
    EvalErrorCode,
    evaluate,
    renderSvg,
    squadronPoints,
    resolveRackOccupancy,
    deploySquadronFromRack,
    recoverSquadronOnRack,
    recoverSquadronInBoatBay,
    resolveBoatBayOccupancy,
    GunboatRackError,
    gunboatTypePoints,
} from "../src/index.js";

const minimalGunboatCarrier = `{"hull":{"points":15,"rows":4,"stealth":"0","streamlining":"none"},"armour":[],"systems":[{"name":"drive","thrust":2,"id":"drv1"},{"name":"ftl","id":"ftl1"},{"name":"gunboatRack","id":"rackA"},{"name":"bay","type":"boat","capacity":27,"id":"bay1"}],"weapons":[],"ordnance":[],"fighters":[],"gunboatSquadrons":[{"rack":"rackA","protection":"heavy","ecm":2,"boats":[{"type":"beam"},{"type":"graser"},{"type":"plasma"},{"type":"missile"},{"type":"pointDefense"},{"type":"kGun"}]}],"mass":100,"points":0,"cpv":0,"name":"GB Test"}`;

const setPointsFromEvaluate = (ship: FullThrustShip): FullThrustShip => {
    const ev = evaluate(ship);
    return { ...ship, points: ev.points, cpv: ev.cpv };
};

describe("gunboatTypePoints", () => {
    it("assigns 9/12/15 by type tier", () => {
        expect(gunboatTypePoints("beam")).to.equal(9);
        expect(gunboatTypePoints("missile")).to.equal(12);
        expect(gunboatTypePoints("gatling")).to.equal(15);
    });
});

describe("squadronPoints", () => {
    it("sums boats and squadron mods", () => {
        const ship = JSON.parse(minimalGunboatCarrier) as FullThrustShip;
        const sq = ship.gunboatSquadrons![0];
        // 60 boat points + heavy 12 + ecm 6
        expect(squadronPoints(sq)).to.equal(78);
    });
});

describe("evaluate gunboats", () => {
    it("includes rack mass and squadron points", () => {
        const ship = JSON.parse(minimalGunboatCarrier) as FullThrustShip;
        const ev = evaluate(ship);
        expect(ev.errors).to.deep.equal([]);
        expect(ev.mass).to.be.at.most(100);
        expect(squadronPoints(ship.gunboatSquadrons![0])).to.equal(78);
        expect(ev.points).to.be.greaterThan(78);
    });

    it("flags FTL on rack", () => {
        const ship = JSON.parse(minimalGunboatCarrier) as FullThrustShip;
        ship.gunboatSquadrons![0].mods = ["ftl"];
        const ev = evaluate(ship);
        expect(ev.errors).to.include(EvalErrorCode.FtlOnRack);
    });

    it("allows empty gunboat rack without a squadron", () => {
        const ship = JSON.parse(minimalGunboatCarrier) as FullThrustShip;
        ship.systems!.push({ name: "gunboatRack", id: "orphan" });
        ship.mass = 120;
        const ev = evaluate(ship);
        expect(ev.errors).to.deep.equal([]);
    });

    it("flags unknown rack reference", () => {
        const ship = JSON.parse(minimalGunboatCarrier) as FullThrustShip;
        ship.gunboatSquadrons![0].rack = "NOPE";
        const ev = evaluate(ship);
        expect(ev.errors).to.include(EvalErrorCode.UnknownGunboatRack);
    });
});

describe("resolveRackOccupancy", () => {
    it("defaults to design squadron on home rack", () => {
        const ship = JSON.parse(minimalGunboatCarrier) as FullThrustShip;
        const occ = resolveRackOccupancy("rackA", ship);
        expect(occ.occupied).to.equal(true);
        expect(occ.boats).to.have.length(6);
        expect(occ.boats[0].type).to.equal("beam");
        expect(occ.protection).to.equal("heavy");
    });

    it("treats null overlay as deployed empty rack", () => {
        const ship = JSON.parse(minimalGunboatCarrier) as FullThrustShip;
        const occ = resolveRackOccupancy("rackA", ship, { rackA: null });
        expect(occ.occupied).to.equal(false);
        expect(occ.deployed).to.equal(true);
    });

    it("supports recovery on spare rack", () => {
        const ship = JSON.parse(minimalGunboatCarrier) as FullThrustShip;
        ship.systems!.push({ name: "gunboatRack", id: "rackSpare" });
        let racks = deploySquadronFromRack({}, "rackA");
        racks = recoverSquadronOnRack(ship, racks, "rackSpare", "rackA");
        const home = resolveRackOccupancy("rackA", ship, racks);
        const spare = resolveRackOccupancy("rackSpare", ship, racks);
        expect(home.occupied).to.equal(false);
        expect(spare.occupied).to.equal(true);
        expect(spare.boats).to.have.length(6);
    });
});

describe("boat bay recovery", () => {
    it("shows squadron when recovered in boat bay", () => {
        const ship = JSON.parse(minimalGunboatCarrier) as FullThrustShip;
        const bays = recoverSquadronInBoatBay(ship, {}, "bay1", "rackA");
        const occ = resolveBoatBayOccupancy("bay1", ship, bays);
        expect(occ.occupied).to.equal(true);
        expect(occ.boats[1].type).to.equal("graser");
    });

    it("throws when bay occupied", () => {
        const ship = JSON.parse(minimalGunboatCarrier) as FullThrustShip;
        const bays = recoverSquadronInBoatBay(ship, {}, "bay1", "rackA");
        expect(() =>
            recoverSquadronInBoatBay(ship, bays, "bay1", "rackA")
        ).to.throw(GunboatRackError, /already occupied/);
    });
});

describe("renderSvg gunboats", () => {
    it("renders Gun label on empty spare rack", () => {
        const ship = setPointsFromEvaluate(
            JSON.parse(minimalGunboatCarrier) as FullThrustShip
        );
        const svg = renderSvg(ship, {
            minimal: true,
            gunboatRacks: { rackA: null },
        })!;
        expect(svg).to.include(">Gun</text>");
    });

    it("renders heterogeneous abbreviations on occupied rack", () => {
        const ship = setPointsFromEvaluate(
            JSON.parse(minimalGunboatCarrier) as FullThrustShip
        );
        const svg = renderSvg(ship, { minimal: true })!;
        expect(svg).to.include(">B</text>");
        expect(svg).to.include(">Gr</text>");
        expect(svg).to.include(">PDS</text>");
        expect(svg).to.include(">K</text>");
    });

    it("renders gunboats in boat bay overlay", () => {
        const ship = setPointsFromEvaluate(
            JSON.parse(minimalGunboatCarrier) as FullThrustShip
        );
        const svg = renderSvg(ship, {
            minimal: true,
            boatBays: { bay1: { squadron: "rackA" } },
        })!;
        expect(svg).to.include(">M</text>");
    });
});
