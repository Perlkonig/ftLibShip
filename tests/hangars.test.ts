import { expect } from "chai";
import "mocha";

import type { FullThrustShip } from "../src/schemas/ship.js";
import {
    deployFighterFromHangar,
    dockFighterInHangar,
    fighterSquadrons,
    HangarDockError,
    renderSvg,
    resolveHangarOccupancy,
} from "../src/index.js";

const validKonstantin = `{"hull":{"points":72,"rows":4,"stealth":"0","streamlining":"none"},"armour":[],"systems":[{"name":"drive","thrust":2,"advanced":false,"id":"q7Leg"},{"name":"ftl","advanced":false,"id":"ldkgq"},{"name":"screen","area":false,"advanced":false,"id":"xv2qU"},{"name":"screen","area":false,"advanced":false,"id":"ZqYDP"},{"name":"fireControl","id":"mdpi2"},{"name":"fireControl","id":"IqDbI"},{"name":"hangar","id":"EQ2W6","isRack":false,"critRules":false},{"name":"hangar","id":"sw_ET","isRack":false,"critRules":false},{"name":"hangar","id":"DRonE","isRack":false,"critRules":false},{"name":"hangar","id":"5hxLH","isRack":false,"critRules":false},{"name":"hangar","id":"FJl7X","isRack":false,"critRules":false},{"name":"hangar","id":"I4LWH","isRack":false,"critRules":false}],"weapons":[{"name":"pds","id":"l5LdK"}],"ordnance":[],"extras":[],"fighters":[{"name":"fighters","type":"standard","id":"lgrLB","mods":[],"hangar":"EQ2W6"},{"name":"fighters","type":"standard","id":"4xXE-","mods":[],"hangar":"sw_ET"},{"name":"fighters","type":"interceptor","id":"viaG3","mods":[],"hangar":"DRonE","number":4,"skill":"ace"},{"name":"fighters","type":"standard","id":"pdLwG","mods":[],"hangar":"5hxLH"},{"name":"fighters","type":"standard","id":"brJEp","mods":[],"hangar":"FJl7X"},{"name":"fighters","type":"standard","id":"ykKy1","mods":[],"hangar":"I4LWH"}],"orientation":"alpha","points":842,"cpv":840,"mass":240,"class":"Attack Carrier","name":"Konstantin"}`;

const minimalHangarShip = `{"hull":{"points":15,"rows":4,"stealth":"0","streamlining":"none"},"armour":[],"systems":[{"name":"drive","thrust":2,"id":"drv1"},{"name":"ftl","id":"ftl1"},{"name":"hangar","id":"bayA"},{"name":"hangar","id":"bayB"}],"weapons":[],"ordnance":[],"fighters":[{"type":"standard","hangar":"bayA"}],"mass":50,"points":100,"cpv":80,"name":"Test"}`;

describe("resolveHangarOccupancy", () => {
    it("uses design-time fighter linkage by default", () => {
        const ship = JSON.parse(validKonstantin) as FullThrustShip;
        const occ = resolveHangarOccupancy("DRonE", ship);
        expect(occ).to.deep.include({
            hangarId: "DRonE",
            occupied: true,
            deployed: false,
            type: "interceptor",
            number: 4,
            capacity: 6,
            isPartial: true,
            skill: "ace",
        });
    });

    it("treats null overlay as deployed empty bay", () => {
        const ship = JSON.parse(validKonstantin) as FullThrustShip;
        const occ = resolveHangarOccupancy("EQ2W6", ship, {
            EQ2W6: null,
        });
        expect(occ.occupied).to.equal(false);
        expect(occ.deployed).to.equal(true);
        expect(occ.number).to.equal(0);
    });

    it("applies type and skill overrides from overlay", () => {
        const ship = JSON.parse(validKonstantin) as FullThrustShip;
        const occ = resolveHangarOccupancy("EQ2W6", ship, {
            EQ2W6: { type: "attack", number: 3, skill: "turkey" },
        });
        expect(occ).to.deep.include({
            occupied: true,
            type: "attack",
            number: 3,
            isPartial: true,
            skill: "turkey",
        });
    });

    it("defaults number to 6 for overlay on bay without design wing", () => {
        const ship = JSON.parse(minimalHangarShip) as FullThrustShip;
        const occ = resolveHangarOccupancy("bayB", ship, {
            bayB: { type: "plasma" },
        });
        expect(occ).to.deep.include({
            occupied: true,
            type: "plasma",
            number: 6,
            isPartial: false,
            skill: "standard",
        });
    });
});

describe("dockFighterInHangar", () => {
    it("docks a wing into an empty bay", () => {
        const ship = JSON.parse(minimalHangarShip) as FullThrustShip;
        const hangars = deployFighterFromHangar({}, "bayB");
        const next = dockFighterInHangar(ship, hangars, "bayB", {
            type: "attack",
            number: 2,
            skill: "ace",
        });
        const occ = resolveHangarOccupancy("bayB", ship, next);
        expect(occ).to.deep.include({
            occupied: true,
            type: "attack",
            number: 2,
            skill: "ace",
        });
    });

    it("throws UNKNOWN_HANGAR for invalid bay id", () => {
        const ship = JSON.parse(minimalHangarShip) as FullThrustShip;
        expect(() =>
            dockFighterInHangar(ship, {}, "NOPE", { type: "standard" })
        ).to.throw(HangarDockError, /Unknown hangar/);
        try {
            dockFighterInHangar(ship, {}, "NOPE", { type: "standard" });
        } catch (e) {
            expect((e as HangarDockError).code).to.equal("UNKNOWN_HANGAR");
        }
    });

    it("throws HANGAR_OCCUPIED when design already links a wing", () => {
        const ship = JSON.parse(minimalHangarShip) as FullThrustShip;
        expect(() =>
            dockFighterInHangar(ship, {}, "bayA", { type: "interceptor" })
        ).to.throw(HangarDockError, /already occupied/);
        try {
            dockFighterInHangar(ship, {}, "bayA", { type: "interceptor" });
        } catch (e) {
            expect((e as HangarDockError).code).to.equal("HANGAR_OCCUPIED");
        }
    });

    it("throws HANGAR_OCCUPIED when overlay already berthed a wing", () => {
        const ship = JSON.parse(minimalHangarShip) as FullThrustShip;
        const hangars = deployFighterFromHangar({}, "bayB");
        const docked = dockFighterInHangar(ship, hangars, "bayB", {
            type: "attack",
        });
        expect(() =>
            dockFighterInHangar(ship, docked, "bayB", { type: "plasma" })
        ).to.throw(HangarDockError, /already occupied/);
    });
});

describe("fighterSquadrons", () => {
    it("returns one resolved entry per hangar in systems order", () => {
        const ship = JSON.parse(minimalHangarShip) as FullThrustShip;
        const squadrons = fighterSquadrons(ship);
        expect(squadrons.map((s) => s.hangarId)).to.deep.equal([
            "bayA",
            "bayB",
        ]);
        expect(squadrons[0].occupied).to.equal(true);
        expect(squadrons[1].occupied).to.equal(false);
    });

    it("supports launch-ready filtering", () => {
        const ship = JSON.parse(validKonstantin) as FullThrustShip;
        const hangars = { EQ2W6: null, sw_ET: null } as const;
        const ready = fighterSquadrons(ship, hangars).filter(
            (s) => s.occupied && s.number > 0
        );
        expect(ready.length).to.equal(4);
        expect(ready.every((s) => s.number > 0)).to.equal(true);
    });
});

describe("renderSvg hangars", () => {
    it("renders empty bay when deployed via hangars overlay", () => {
        const ship = JSON.parse(minimalHangarShip) as FullThrustShip;
        const svg = renderSvg(ship, {
            hangars: { bayA: null },
            minimal: true,
        })!;
        const useMatch = svg.match(/<use id="bayA" href="#([^"]+)"/);
        expect(useMatch).to.not.equal(null);
        const symId = useMatch![1];
        const symMatch = svg.match(
            new RegExp(`<symbol id="${symId}"[^>]*>([\\s\\S]*?)</symbol>`)
        );
        expect(symMatch).to.not.equal(null);
        expect(symMatch![1]).to.not.include("573.5,334");
    });

    it("renders partial squadron count and ace badge", () => {
        const ship = JSON.parse(minimalHangarShip) as FullThrustShip;
        const svg = renderSvg(ship, {
            minimal: true,
            hangars: {
                bayB: { type: "interceptor", number: 3, skill: "ace" },
            },
        })!;
        expect(svg).to.include(">3</text>");
        expect(svg).to.include(">A</text>");
        expect(svg).to.include('opacity="0.45"');
    });

    it("renders turkey badge without count for full wing", () => {
        const ship = JSON.parse(minimalHangarShip) as FullThrustShip;
        const svg = renderSvg(ship, {
            minimal: true,
            hangars: {
                bayB: { type: "standard", number: 6, skill: "turkey" },
            },
        })!;
        expect(svg).to.include(">T</text>");
        expect(svg).to.not.include('opacity="0.45"');
    });
});
