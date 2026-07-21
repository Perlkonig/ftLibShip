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

/** Rack glyph labels (unique per gunboat type). */
export const type2initial: Map<GunboatType, string> = new Map([
    ["beam", "B"],
    ["plasma", "P"],
    ["graser", "Gr"],
    ["needle", "N"],
    ["pointDefense", "PDS"],
    ["pulseTorpedo", "PT"],
    ["submunition", "Sub"],
    ["kGun", "K"],
    ["missile", "Ms"],
    ["rocket", "Rk"],
    ["ads", "ADS"],
    ["gatling", "Gt"],
    ["mkp", "MKP"],
    ["scatterpack", "Sp"],
    ["plasmaBomber", "PB"],
]);

export const gunboatSquadronInsertSvg = (types: GunboatType[]): string => {
    const cols = 2;
    const rows = 3;
    const cellW = 128;
    const cellH = 88;
    const rectLeft = 329.4;
    const rectWidth = 301.2;
    const rectTop = 21;
    const rectHeight = 518.1;
    const centerX = rectLeft + rectWidth / 2;
    const gridW = cols * cellW;
    const gridH = rows * cellH;
    const gridLeft = centerX - gridW / 2;
    const gridAreaTop = 168;
    const gridAreaBottom = rectTop + rectHeight - 24;
    const gridTop = gridAreaTop + (gridAreaBottom - gridAreaTop - gridH) / 2;
    const defaultFontSize = 40;
    let out = "";
    for (let i = 0; i < Math.min(6, types.length); i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = gridLeft + col * cellW + cellW / 2;
        const y = gridTop + row * cellH + cellH / 2;
        const label =
            type2initial.get(types[i]) ??
            (type2abbrev.get(types[i]) ?? types[i]).slice(0, 1);
        const fontSize =
            label.length <= 2
                ? defaultFontSize
                : label.length === 3
                  ? 32
                  : 26;
        out += `<text x="${x}" y="${y}" dominant-baseline="middle" text-anchor="middle" font-size="${fontSize}" font-family="Roboto" font-weight="bold">${label}</text>`;
    }
    return out;
};
