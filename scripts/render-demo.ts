import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import type { FullThrustShip } from "../src/schemas/ship.js";
import { renderSvg } from "../src/index.js";

const validKonstantin = `{"hull":{"points":72,"rows":4,"stealth":"0","streamlining":"none"},"armour":[],"systems":[{"name":"drive","thrust":2,"advanced":false,"id":"q7Leg"},{"name":"ftl","advanced":false,"id":"ldkgq"},{"name":"screen","area":false,"advanced":false,"id":"xv2qU"},{"name":"screen","area":false,"advanced":false,"id":"ZqYDP"},{"name":"fireControl","id":"mdpi2"},{"name":"fireControl","id":"IqDbI"},{"name":"hangar","id":"EQ2W6","isRack":false,"critRules":false},{"name":"hangar","id":"sw_ET","isRack":false,"critRules":false},{"name":"hangar","id":"DRonE","isRack":false,"critRules":false},{"name":"hangar","id":"5hxLH","isRack":false,"critRules":false},{"name":"hangar","id":"FJl7X","isRack":false,"critRules":false},{"name":"hangar","id":"I4LWH","isRack":false,"critRules":false}],"weapons":[{"name":"pds","id":"l5LdK"},{"name":"pds","id":"vwGAa"},{"name":"pds","id":"gh3ru"},{"name":"pds","id":"aDMFK"},{"name":"pds","id":"IpY96"},{"name":"pds","id":"25H7F"},{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"BepZp"},{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"Ds8zO"},{"name":"beam","class":2,"leftArc":"AP","numArcs":3,"id":"Vj_AN"},{"name":"beam","class":2,"leftArc":"AP","numArcs":3,"id":"ERb4o"},{"name":"beam","class":2,"leftArc":"F","numArcs":3,"id":"Ve2aC"},{"name":"beam","class":2,"leftArc":"F","numArcs":3,"id":"C6rZc"},{"name":"beam","class":3,"leftArc":"AP","numArcs":3,"id":"r34r8"},{"name":"beam","class":3,"leftArc":"FP","numArcs":3,"id":"1mABJ"},{"name":"beam","class":3,"leftArc":"FP","numArcs":3,"id":"xjptS"},{"name":"beam","class":3,"leftArc":"F","numArcs":3,"id":"7fLe0"}],"ordnance":[],"extras":[],"fighters":[{"name":"fighters","type":"standard","id":"lgrLB","mods":[],"hangar":"EQ2W6"},{"name":"fighters","type":"standard","id":"4xXE-","mods":[],"hangar":"sw_ET"},{"name":"fighters","type":"standard","id":"viaG3","mods":[],"hangar":"DRonE"},{"name":"fighters","type":"standard","id":"pdLwG","mods":[],"hangar":"5hxLH"},{"name":"fighters","type":"standard","id":"brJEp","mods":[],"hangar":"FJl7X"},{"name":"fighters","type":"standard","id":"ykKy1","mods":[],"hangar":"I4LWH"}],"orientation":"alpha","points":842,"cpv":840,"mass":240,"class":"Attack Carrier","name":"Konstantin"}`;

const outPath = resolve(process.argv[2] ?? "scratch.svg");

const ship = JSON.parse(validKonstantin) as FullThrustShip;
ship.flawed = true;
ship.armour = [
    [3, 2],
    [2, 0],
];
ship.hashseed = "render-demo";
ship.systems!.push(
    { name: "mineLayer", capacity: 4, id: "minesA" },
    { name: "magazine", capacity: 6, id: "mag1" }
);
ship.ordnance = [
    {
        name: "salvoLauncher",
        leftArc: "FP",
        numArcs: 3,
        magazine: "mag1",
        id: "salvoL1",
    },
];

const svg = renderSvg(ship, {
    damage: 4,
    armour: [
        [2, [1, 1]],
        [1, [0, 0]],
    ],
    ammunition: {
        minesA: 2,
        mag1: 2,
    },
    disabled: ["_corePower", "Vj_AN"],
    destroyed: ["Ds8zO", "C6rZc"],
    invaders: [
        { type: "marines" },
        { type: "damageControl", owner: 1 },
    ],
    invertFooter: true,
});

if (svg === undefined) {
    console.error("renderSvg returned undefined");
    process.exit(1);
}

writeFileSync(outPath, svg, "utf-8");
console.log(`Wrote ${outPath}`);
