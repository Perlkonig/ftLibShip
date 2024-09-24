import type { FullThrustShip } from "../schemas/ship.js";
import fnv from "fnv-plus";
import { nanoid } from "nanoid";
import { svgLib } from "./svgLib.js";

export const formRows = (ship: FullThrustShip): number[][] | undefined => {
    if (ship.hull !== undefined) {
        let cf = 1;
        if (ship.mass !== undefined) {
            if (ship.civilian !== undefined && ship.civilian) {
                cf = Math.ceil(ship.mass / 50);
            } else {
                cf = Math.ceil(ship.mass / 20);
            }
        }
        const interval = Math.ceil(ship.hull.points / cf);
        const boxes: number[] = [];
        for (let i = 0; i < ship.hull.points; i++) {
            if ((i + 1) % interval === 0 || i === ship.hull.points - 1) {
                boxes.push(1);
            } else {
                boxes.push(0);
            }
        }
        const hullRows: number[][] = [];
        let baselen = Math.floor(ship.hull.points / ship.hull.rows);
        let delta = ship.hull.points % ship.hull.rows;
        for (let i = 0; i < ship.hull.rows; i++) {
            if (baselen > boxes.length) {
                baselen = boxes.length;
            }
            const node = boxes.splice(0, baselen);
            if (delta > 0) {
                node.push(...boxes.splice(0, 1));
                delta--;
            }
            hullRows.push(node);
        }
        return hullRows;
    }
    return undefined;
};

export interface IRenderOpts {
    cellsize: number;
    dim?: {
        height: number;
        width: number;
    };
    hullDamage?: number;
    // first row is innermost row of armour
    // first element of each row is regular armour, second is regenerative armour
    armourDamage?: [number, number][];
}

export const genSvg = (
    ship: FullThrustShip,
    opts: IRenderOpts
): string | undefined => {
    const { cellsize, dim, hullDamage, armourDamage } = opts;
    const hullRows = formRows(ship);
    if (hullRows === undefined || ship.hull === undefined) {
        return undefined;
    }
    // apply hull damage
    if (hullDamage !== undefined) {
        let applied = hullDamage;
        for (let row = 0; row < hullRows.length; row++) {
            for (let col = 0; col < hullRows[row].length; col++) {
                if (applied > 0) {
                    hullRows[row][col] = 2;
                    applied--;
                }
            }
        }
    }

    let totalHeight: number;
    let totalWidth: number;
    if (dim !== undefined) {
        totalHeight = dim.height;
        totalWidth = dim.width;
    } else {
        let rows = hullRows.length;
        if (ship.hasOwnProperty("armour") && ship.armour !== undefined) {
            rows += ship.armour.length;
        }
        totalHeight = cellsize * rows;

        let cols = hullRows[0].length;
        // If there's armour, make sure there's enough room for armour that exceeds hull cols
        if (ship.hasOwnProperty("armour") && ship.armour !== undefined) {
            cols = Math.max(cols, ...ship.armour.map((x) => x[0] + x[1]));
        }
        if (ship.hull.stealth === "2") {
            cols++;
        } else if (
            ship.hull.stealth === "1" &&
            hullRows[1].length === hullRows[0].length
        ) {
            cols++;
        }
        totalWidth = cellsize * cols;
    }

    const blocksHigh = Math.floor(totalHeight / cellsize);
    const svgHull = svgLib.find((x) => x.id === "svglib_hull")!;
    const svgHullCrew = svgLib.find((x) => x.id === "svglib_hullCrew")!;
    const svgHullDmgd = svgLib.find((x) => x.id === "svglib_hullDamaged")!;
    const svgArmour = svgLib.find((x) => x.id === "svglib_armour")!;
    const svgArmourDmgd = svgLib.find((x) => x.id === "svglib_armourDamaged")!;
    const svgArmourRegen = svgLib.find((x) => x.id === "svglib_armourRegen")!;
    const svgArmourRegenDmgd = svgLib.find(
        (x) => x.id === "svglib_armourRegenDamaged"
    )!;
    const svgStealth = svgLib.find((x) => x.id === "svglib_stealthHull")!;
    let hullid = "_ssdHull";
    if (ship.hashseed !== undefined) {
        fnv.seed(ship.hashseed);
        hullid = fnv.hash("_ssdHull").hex();
    }
    let s = `<symbol id="${hullid}" viewBox="-1 -1 ${totalWidth + 2} ${totalHeight + 2}">`;
    s += `<defs>`;
    if (ship.hull.stealth !== "0") {
        s += svgStealth.svg;
    }
    s += svgHull.svg;
    s += svgHullCrew.svg;
    if (hullDamage !== undefined) {
        s += svgHullDmgd.svg;
    }
    if (
        ship.hasOwnProperty("armour") &&
        ship.armour !== undefined &&
        ship.armour.length > 0
    ) {
        s += svgArmour.svg;
        s += svgArmourRegen.svg;
    }
    if (armourDamage !== undefined) {
        s += svgArmourDmgd.svg;
        s += svgArmourRegenDmgd.svg;
    }
    s += `</defs>`;

    // Hull boxes
    hullRows.reverse();
    for (let row = 0; row < hullRows.length; row++) {
        const boxes = hullRows[row];
        const y = (blocksHigh - (row + 1)) * cellsize;
        for (let col = 0; col < boxes.length; col++) {
            const x = col * cellsize;
            let id = "svglib_hull";
            let width = svgHull.width * cellsize;
            let height = svgHull.height * cellsize;
            if (boxes[col] === 1) {
                id = "svglib_hullCrew";
                width = svgHullCrew.width * cellsize;
                height = svgHullCrew.height * cellsize;
            } else if (boxes[col] === 2) {
                id = "svglib_hullDamaged";
                width = svgHullDmgd.width * cellsize;
                height = svgHullDmgd.height * cellsize;
            }
            s += `<use href="#${id}" x="${x}" y="${y}" width="${width}" height="${height}" />`;
        }
        if (
            (ship.hull.stealth === "2" &&
                (hullRows.length - (row + 1) === 2 ||
                    hullRows.length - (row + 1) === 0)) ||
            (ship.hull.stealth === "1" && hullRows.length - (row + 1) === 1)
        ) {
            s += `<use href="#${svgStealth.id}" x="${boxes.length * cellsize}" y="${y}" width="${svgStealth.width * cellsize}" height="${svgStealth.height * cellsize}" />`;
        }
    }

    // Armour circles
    if (ship.armour !== undefined && ship.armour.length > 0) {
        for (let row = 0; row < ship.armour.length; row++) {
            let applied = 0;
            let appliedRegen = 0;
            if (armourDamage !== undefined) {
                if (row + 1 <= armourDamage.length) {
                    [applied, appliedRegen] = armourDamage[row];
                }
            }
            const y = (blocksHigh - (ship.hull.rows + 1) - row) * cellsize;
            for (let col = 0; col < ship.armour[row][0]; col++) {
                const x = col * cellsize;
                const width = svgArmour.width * cellsize;
                const height = svgArmour.height * cellsize;
                let id = "svglib_armour";
                if (applied > 0) {
                    id = "svglib_armourDamaged";
                    applied--;
                }
                s += `<use href="#${id}" x="${x}" y="${y}" width="${width}" height="${height}" />`;
            }
            const offset = ship.armour[row][0];
            for (let col = 0; col < ship.armour[row][1]; col++) {
                const x = (col + offset) * cellsize;
                const width = svgArmourRegen.width * cellsize;
                const height = svgArmourRegen.height * cellsize;
                let id = "svglib_armourRegen";
                if (appliedRegen > 0) {
                    id = "svglib_armourRegenDamaged";
                    appliedRegen--;
                }
                s += `<use href="#${id}" x="${x}" y="${y}" width="${width}" height="${height}" />`;
            }
        }
    }
    s += `</symbol>`;
    return s;
};
