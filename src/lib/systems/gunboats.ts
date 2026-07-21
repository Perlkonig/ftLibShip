import type { FullThrustShip } from "../../schemas/ship.js";

export type GunboatType = NonNullable<
    FullThrustShip["gunboatSquadrons"]
>[number]["boats"][number]["type"];

export type GunboatSquadronDesign = NonNullable<
    FullThrustShip["gunboatSquadrons"]
>[number];

export const type2name: Map<GunboatType, string> = new Map([
    ["beam", "Beam Gunboat"],
    ["plasma", "Plasma Gun Gunboat"],
    ["graser", "Graser Gunboat"],
    ["needle", "Needle Gunboat"],
    ["pointDefense", "Point Defense Gunboat"],
    ["pulseTorpedo", "Pulse Torpedo Gunboat"],
    ["submunition", "Submunition Gunboat"],
    ["kGun", "K-Gun Gunboat"],
    ["missile", "Missile Gunboat"],
    ["rocket", "Rocket Gunboat"],
    ["ads", "Area Defense System Gunboat"],
    ["gatling", "Gatling Gunboat"],
    ["mkp", "MKP Gunboat"],
    ["scatterpack", "Scatterpack Gunboat"],
    ["plasmaBomber", "Plasma Bomber Gunboat"],
]);

/** Short labels for SSD squadron inserts (max ~3 chars). */
export const type2abbrev: Map<GunboatType, string> = new Map([
    ["beam", "Bm"],
    ["plasma", "Pl"],
    ["graser", "Gr"],
    ["needle", "Nd"],
    ["pointDefense", "PD"],
    ["pulseTorpedo", "PT"],
    ["submunition", "Sb"],
    ["kGun", "K2"],
    ["missile", "Ms"],
    ["rocket", "Rk"],
    ["ads", "AD"],
    ["gatling", "Gt"],
    ["mkp", "MK"],
    ["scatterpack", "Sc"],
    ["plasmaBomber", "PB"],
]);

export const gunboatTypePoints = (type: GunboatType): number => {
    switch (type) {
        case "beam":
        case "plasma":
        case "graser":
        case "needle":
        case "pointDefense":
            return 9;
        case "pulseTorpedo":
        case "submunition":
        case "kGun":
        case "missile":
        case "rocket":
        case "ads":
            return 12;
        case "gatling":
        case "mkp":
        case "scatterpack":
        case "plasmaBomber":
            return 15;
    }
};

export const squadronPoints = (squadron: GunboatSquadronDesign): number => {
    let points = 0;
    for (const boat of squadron.boats) {
        points += gunboatTypePoints(boat.type);
    }
    if (squadron.mods?.includes("ftl")) {
        points += 6;
    }
    if (squadron.protection === "heavy" || squadron.protection === "screened") {
        points += 12;
    }
    const ecm = squadron.ecm ?? 0;
    points += ecm * 3;
    return points;
};

export const gunboatSquadronInsertSvg = (types: GunboatType[]): string => {
    const cols = 3;
    const rows = 2;
    const cellW = 90;
    const cellH = 70;
    const startX = 345;
    const startY = 200;
    let out = "";
    for (let i = 0; i < Math.min(6, types.length); i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * cellW + cellW / 2;
        const y = startY + row * cellH + cellH / 2;
        const label = type2abbrev.get(types[i]) ?? types[i];
        out += `<text x="${x}" y="${y}" dominant-baseline="middle" text-anchor="middle" font-size="22" font-family="Roboto">${label}</text>`;
    }
    return out;
};
