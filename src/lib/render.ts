import type { Arcs, FullThrustShip } from "../schemas/ship.js";
import type { ISystemSVG } from "../index.js";
import { hull, systems as sysLib, svgLib } from "../index.js";
import { Flawed } from "./systems/flawed.js";

interface Invader {
    type: "marines"|"damageControl";
    owner?: number|string;
    obj: sysLib.System;
}

type SystemID = "_coreBridge" | "_coreLife" | "_corePower" | string;

export interface RenderOpts {
    // If true, strips the scripts and introductory lines
    minimal?: boolean;
    // If provided, adds an id element to the rendered SVG
    id?: string;
    // Amount of hull damage done
    damage?: number;
    // The amount of damage done to each layer of armour
    // The first row is the innermost layer
    // First element is regular armour, second is regenerative armour
    armour?: [number,number][]
    // List of uids of disabled systems
    disabled?: SystemID[];
    // List of uids of destroyed systems
    destroyed?: SystemID[];
}

interface IWeaponSystem extends sysLib.System {
    leftArc: Arcs;
}

interface IDriveSystem extends sysLib.System {
    thrust: number;
}

export const renderSvg = (ship: FullThrustShip, opts: RenderOpts = {}): string | undefined => {
    // Helper function to simplify flagging destroyed and disabled systems
    const status = (id: string): "destroyed"|"disabled"|false => {
        if (opts.destroyed !== undefined) {
            if (opts.destroyed.includes(id)) {
                return "destroyed";
            } else {
                if (opts.disabled !== undefined) {
                    if (opts.disabled.includes(id)) {
                        return "disabled";
                    }
                }
            }
        }
        return false;
    }

    let svg: string | undefined;

    if ( (ship.hasOwnProperty("hull")) && (ship.hull !== undefined) ) {
        // Calculate the size of the hull display.
        // Below a certain threshold, the compact display will be used (drives to the side).
        // Otherwise we'll go with the fully flexible display with the drives in the bottom.
        let hullArray = hull.formRows(ship)!;
        let hullCols = hullArray[0].length;
        // If there's armour, look for situations where there's more armour than hull columns
        if ( (ship.hasOwnProperty("armour")) && (ship.armour !== undefined) ) {
            hullCols = Math.max(hullCols, ...ship.armour.map(x => x[0] + x[1]));
        }
        if (ship.hull.stealth === "2") {
            hullCols++;
        } else if ( (ship.hull.stealth === "1") && (hullArray.length > 1) && (hullArray[1].length === hullArray[0].length) ) {
            hullCols++;
        }

        let hullRows = hullArray.length;
        if ( (ship.hasOwnProperty("armour")) && (ship.armour !== undefined) ) {
            hullRows += ship.armour.length;
        }
        if (hullRows < 4) {
            hullRows = 4;
        }

        // Get a list of general systems, watching for turrets and magazines
        const systems: sysLib.System[] = [];
        const turrets: sysLib.Turret[] = [];
        const mines: sysLib.MineLayer[] = [];
        const magazines: sysLib.Magazine[] = [];
        if (ship.flawed !== undefined && ship.flawed) {
            systems.push(new Flawed({name: "_flawed"}, ship));
        }
        if ( (ship.hasOwnProperty("systems")) && (ship.systems !== undefined) ) {
            for (const s of ship.systems) {
                if ( (s.name === "drive") || (s.name === "ftl") ) {
                    continue;
                }
                const obj = sysLib.getSystem(s, ship);
                if (obj !== undefined) {
                    if (obj.name === "turret") {
                        turrets.push(obj as sysLib.Turret);
                    } else if (obj.name === "magazine") {
                        magazines.push(obj as sysLib.Magazine);
                    } else if (obj.name === "mineLayer") {
                        mines.push(obj as sysLib.MineLayer);
                    } else {
                        systems.push(obj);
                    }
                }
            }
        }

        // Get a list of ordnance
        const ordnance: sysLib.System[] = [];
        const launchers: sysLib.SalvoLauncher[] = [];
        if ( (ship.hasOwnProperty("ordnance")) && (ship.ordnance !== undefined) ) {
            for (const s of ship.ordnance) {
                const obj = sysLib.getSystem(s, ship);
                if (obj !== undefined) {
                    if (obj.name === "salvoLauncher") {
                        launchers.push(obj as sysLib.SalvoLauncher)
                    } else {
                        ordnance.push(obj);
                    }
                }
            }
        }

        // Get a list of weapons
        const weapons: sysLib.System[] = [];
        if ( (ship.hasOwnProperty("weapons")) && (ship.weapons !== undefined) ) {
            for (const s of ship.weapons) {
                const obj = sysLib.getSystem(s, ship);
                if (obj !== undefined) {
                    weapons.push(obj);
                }
            }
        }

        // Get a list of invaders
        const invaders: Invader[] = [];
        if ( (ship.hasOwnProperty("invaders")) && (ship.invaders !== undefined) ) {
            for (const i of ship.invaders) {
                let obj: sysLib.System | undefined;
                if (i.type === "damageControl") {
                    obj = sysLib.getSystem({name: "damageControl"}, ship);
                } else if (i.type === "marines") {
                    obj = sysLib.getSystem({name: "marines"}, ship);
                }
                if (obj !== undefined) {
                    invaders.push({...i, obj});
                }
            }
        }

        let compact = false;
        let totalCols = hullCols;
        if (totalCols <= 6) {
            totalCols = 10;
            compact = true;
        }
        if (totalCols % 2 !== 0) {
            totalCols++;
        }

        // We're allocating 2x2 cells for most systems
        // This tells us how many of those cells there are in each row given our width.
        const breakPoint = Math.floor(totalCols / 2);

        let totalRows = 0;
        // name plate
        totalRows += 1.5;
        // general systems
        if (systems.length > 0) {
            // heading
            totalRows++;
            // Allocate 2x2 squares for each system
            const sysRows = Math.ceil(systems.length / breakPoint);
            totalRows += sysRows * 2;
        }
        // mines
        if (mines.length > 0) {
            // heading
            totalRows++;
            let numMines = 0;
            for (const ml of mines) {
                numMines += ml.capacity;
            }
            // These are 1x1 glyphs so...
            const mineRows = Math.ceil(numMines / totalCols);
            totalRows += mineRows;
        }
        // ordnance
        if (ordnance.length > 0) {
            // heading
            totalRows++;
            const ordRows = Math.ceil(ordnance.length / breakPoint);
            totalRows += ordRows * 2;
        }
        // Magazines
        if (magazines.length > 0) {
            for (const m of magazines) {
                // heading
                totalRows++;
                // Find out how many launchers it feeds
                const feeding: sysLib.SalvoLauncher[] = [];
                for (const l of launchers) {
                    if (l.magazine === m.id) {
                        feeding.push(l);
                    }
                }
                // Add the number of launchers and the number of missiles to determine how many rows are needed
                const numEntries = feeding.length + m.capacity;
                const magRows = Math.ceil(numEntries / breakPoint);
                totalRows += magRows * 2;
            }
        }
        // Weapons
        const turretedIds: Set<string> = new Set();
        if (weapons.length > 0) {
            // heading
            totalRows++;
            // Ignore all turreted weapons, so get a list of those IDs
            for (const t of turrets) {
                for (const w of t.weapons) {
                    turretedIds.add(w);
                }
            }
            const freeWeapons: sysLib.System[] = [];
            for (const w of weapons) {
                if (turretedIds.has(w.uid)) {
                    continue;
                }
                freeWeapons.push(w);
            }
            const weaponRows = Math.ceil(freeWeapons.length / breakPoint);
            totalRows += weaponRows * 2;
        }
        // Turrets
        if (turrets.length > 0) {
            for (const t of turrets) {
                // heading
                totalRows++;
                const numEntries = t.weapons.length + 1;
                const tRows = Math.ceil(numEntries / breakPoint);
                totalRows += tRows * 2;
            }
        }

        // invaders
        if (invaders.length > 0) {
            // heading
            totalRows++;
            // Allocate 2x2 squares for each invader
            const sysRows = Math.ceil(invaders.length / breakPoint);
            totalRows += sysRows * 2;
        }

        // Hull
        totalRows += hullRows + 2; // 1 for heading, 1 for buffer

        // Stats
        totalRows++;

        // Core systems
        totalRows += 3;

        // Rotate all weapons contained by turrets
        for (const t of turrets) {
            const rotDist = calcRot(t.leftArc, t.facingArc);
            for (const wid of t.weapons) {
                if (ship.weapons === undefined) {
                    throw new Error("No weapons found.");
                }
                const sys = weapons.find(x => x.uid === wid) as IWeaponSystem;
                if (sys === undefined) {
                    throw new Error(`Weapon id "${wid}" is supposedly housed in turret "${t.uid}", but the weapon could not be found.`);
                }
                sys.leftArc = rotArc(sys.leftArc as Arcs, rotDist);
            }
        }

        const svgCore = svgLib.find(x => x.id === "coreSys")!;
        let sysFtl: sysLib.ISystem | undefined;
        let sysDrive: sysLib.ISystem | undefined;
        if ( (ship.hasOwnProperty("systems")) && (ship.systems !== undefined) ) {
            sysFtl = ship.systems.find(x => x.name === "ftl");
            sysDrive = ship.systems.find(x => x.name === "drive")!;
        }
        let svgFtl: ISystemSVG | undefined;
        if (sysFtl !== undefined) {
            svgFtl = sysLib.getSystem(sysFtl, ship)!.glyph();
        }
        let svgDrive: ISystemSVG | undefined;
        let driveID: string | undefined;
        if (sysDrive !== undefined) {
            const drive = sysLib.getSystem(sysDrive, ship)! as IDriveSystem;
            driveID = drive.uid;
            if (status(drive.uid) === "destroyed") {
                drive.thrust = 0;
            } else if (status(drive.uid) === "disabled") {
                drive.thrust = Math.ceil(drive.thrust / 2);
            }
            svgDrive = drive.glyph();
        }

        const sysDistinct: ISystemSVG[] = [];
        for (const set of [systems, turrets, mines, magazines, ordnance, launchers, weapons, invaders.map(x => x.obj)]) {
            for (const sys of set) {
                const svg = sys.glyph();
                if (svg !== undefined) {
                    const idx = sysDistinct.findIndex(x => x.id === svg.id);
                    if (idx === -1) {
                        sysDistinct.push(svg);
                    }
                }
                if (sys.name === "mineLayer") {
                    const glyph = (sys as sysLib.MineLayer).individualMine();
                    const idx = sysDistinct.findIndex(x => x.id === glyph.id);
                    if (idx === -1) {
                        sysDistinct.push(glyph);
                    }
                } else if (sys.name === "magazine") {
                    const glyph = (sys as sysLib.Magazine).missileGlyph();
                    const idx = sysDistinct.findIndex(x => x.id === glyph.id);
                    if (idx === -1) {
                        sysDistinct.push(glyph);
                    }
                }
            }
        }

        const cellsize = 50;
        const pxWidth = totalCols * cellsize;
        const pxHeight = totalRows * cellsize;

        // Check for disabled core systems and insert styles to target them
        let styleInsert = "";
        if (opts.disabled !== undefined) {
            for (const s of opts.disabled.filter(x => x.startsWith("_core"))) {
                styleInsert += `#_internalCore${s.substring(5)} ._rect{fill:red}`;
            }
        }

        svg = "";
        if (! opts.minimal) {
            svg += `<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">`
        }

        svg += `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 ${pxWidth + 2} ${pxHeight + 2}" width="100%" height="100%"${! opts.minimal ? ` onload="resizePlates()"` : ""}${opts.id ? ` id="${opts.id}"` : ""}>`;
        svg += `<defs>`;
        svg += `<style type="text/css"><![CDATA[ @import url(https://fonts.googleapis.com/css2?family=Zen+Dots&family=Roboto&display=swap);text{font-family:"Roboto"}.futureFont{font-family:"Zen Dots"}.disabled{opacity:0.5}.destroyed{opacity:0.1}${styleInsert} ]]></style>`;
        if (! opts.minimal) {
            svg += `<script type="text/javascript"><![CDATA[ function newSize(bb) { var widthTransform = ${pxWidth} * 0.9 / bb.width; var heightTransform = ((${cellsize} * 1.5) * 0.9) / bb.height; var value = widthTransform < heightTransform ? widthTransform : heightTransform; if (value !== Infinity) { return value; } return undefined; } function resizePlates() { var namePlate = document.getElementById('_resizeNamePlate'); var npValue = newSize(namePlate.getBBox()); if (npValue !== undefined) { namePlate.setAttribute("transform", "matrix("+npValue+", 0, 0, "+npValue+", 0,0)"); const currx = parseFloat(namePlate.getAttribute("x")); const curry = parseFloat(namePlate.getAttribute("y")); namePlate.setAttribute("x", (currx / npValue).toString()); namePlate.setAttribute("y", (curry / npValue).toString()); } var statPlate = document.getElementById('_resizeStats'); var statValue = newSize(statPlate.getBBox()); if (statValue !== undefined) { statPlate.setAttribute("transform", "matrix("+statValue+", 0, 0, "+statValue+", 0,0)"); const currx = parseFloat(statPlate.getAttribute("x")); const curry = parseFloat(statPlate.getAttribute("y")); statPlate.setAttribute("x", (currx / statValue).toString()); statPlate.setAttribute("y", (curry / statValue).toString()); } } ]]></script>`;
        }

        svg += hull.genSvg(ship, {cellsize, hullDamage: opts.damage, armourDamage: opts.armour});
        if (svgFtl !== undefined) {
            svg += svgFtl.svg;
        }
        if (svgDrive !== undefined) {
            svg += svgDrive.svg;
        }
        svg += svgCore.svg;
        for (const symbol of sysDistinct) {
            svg += symbol.svg;
        }
        svg += `</defs>`;

        //SSD background for consistency
        svg += `<rect x="0" y="0" height="${pxHeight}" width="${pxWidth}" stroke="none" fill="white"/>`;

        // Set background for footer
        svg += `<rect x="0" y="${(totalRows - 3) * cellsize}" width="${pxWidth}" height="${cellsize * 3}" stroke="none" fill="white"/>`;

        //Name plate with special ID so it can be autosized.
        svg += `<text id="_resizeNamePlate" x="${cellsize * 0.2}" y="${cellsize * 0.75}" dominant-baseline="middle" font-size="${cellsize}" class="futureFont">${ship.class} "${ship.name}"</text>`;

        let currRow = 1.5;

        // systems
        if (systems.length > 0) {
            // name plate
            svg += `<rect x="0" y="${currRow * cellsize}" width="${pxWidth}" height="${cellsize}" stroke="none" fill="#c0c0c0"/><text x="${cellsize * 0.2}" y="${(currRow * cellsize) + (cellsize / 2)}" dominant-baseline="middle" font-size="${cellsize / 2}" class="futureFont">Systems</text>`;
            currRow++;
            const sorted = [...systems].sort((a, b) => {
                if (a.name === b.name) {
                    return a.fullName().localeCompare(b.fullName());
                } else {
                    return a.name.localeCompare(b.name);
                }
            });
            for (let i = 0; i < sorted.length; i++) {
                const realRow = Math.floor(i / breakPoint);
                const realCol = i % breakPoint;
                const sys = sorted[i];
                const buff = buffInSquare(sys.glyph()!, cellsize * 2, true);
                svg += `<use id="${sys.uid}" href="#svg_${sys.glyph()!.id}" x="${((realCol * 2) * cellsize) + buff.xOffset}" y="${((currRow + (realRow * 2)) * cellsize) + buff.yOffset}" width="${buff.width}" height="${buff.height}"${status(sys.uid)===false ? "" : ` class="${status(sys.uid)}"`} />`;
            }
            currRow += Math.ceil(sorted.length / breakPoint) * 2;
        }

        // Mines
        if (mines.length > 0) {
            // name plate
            svg += `<rect x="0" y="${currRow * cellsize}" width="${pxWidth}" height="${cellsize}" stroke="none" fill="#c0c0c0"/><text x="${cellsize * 0.2}" y="${(currRow * cellsize) + (cellsize / 2)}" dominant-baseline="middle" font-size="${cellsize / 2}" class="futureFont">Mines</text>`;
            currRow++;
            let numMines = 0;
            for (const s of mines) {
                numMines += s.capacity;
            }
            for (let i = 0; i < numMines; i++) {
                const realRow = Math.floor(i / totalCols);
                const realCol = i % totalCols;
                const buff = buffInSquare(mines[0].individualMine(), cellsize, false);
                svg += `<use href="#svg_mineIndividual" x="${(realCol * cellsize) + buff.xOffset}" y="${((currRow + realRow) * cellsize) + buff.yOffset}" width="${buff.width}" height="${buff.height}" />`;
            }
            currRow += Math.ceil(numMines / totalCols);
        }

        // Ordnance
        if (ordnance.length > 0) {
            // name plate
            svg += `<rect x="0" y="${currRow * cellsize}" width="${pxWidth}" height="${cellsize}" stroke="none" fill="#c0c0c0"/><text x="${cellsize * 0.2}" y="${(currRow * cellsize) + (cellsize / 2)}" dominant-baseline="middle" font-size="${cellsize / 2}" class="futureFont">Ordnance</text>`;
            currRow++;
            const sorted = [...ordnance].sort((a, b) => {
                if (a.name === b.name) {
                    return a.fullName().localeCompare(b.fullName());
                } else {
                    return a.name.localeCompare(b.name);
                }
            });
            for (let i = 0; i < sorted.length; i++) {
                const realRow = Math.floor(i / breakPoint);
                const realCol = i % breakPoint;
                const sys = sorted[i];
                const buff = buffInSquare(sys.glyph()!, cellsize * 2, true);
                svg += `<use id="${sys.uid}" href="#svg_${sys.glyph()!.id}" x="${((realCol * 2) * cellsize) + buff.xOffset}" y="${((currRow + (realRow * 2)) * cellsize) + buff.yOffset}" width="${buff.width}" height="${buff.height}"${status(sys.uid)===false ? "" : ` class="${status(sys.uid)}"`} />`;
            }

            currRow += Math.ceil(sorted.length / breakPoint) * 2;
        }

        // Magazines
        if (magazines.length > 0) {
            for (const mag of magazines) {
                // name plate
                svg += `<rect x="0" y="${currRow * cellsize}" width="${pxWidth}" height="${cellsize}" stroke="none" fill="#c0c0c0"/><text x="${cellsize * 0.2}" y="${(currRow * cellsize) + (cellsize / 2)}" dominant-baseline="middle" font-size="${cellsize / 2}" class="futureFont">Magazine</text>`;
                currRow++;
                const feeding: sysLib.SalvoLauncher[] = [];
                for (const l of launchers) {
                    if (l.magazine === mag.id) {
                        feeding.push(l);
                    }
                }
                for (let i = 0; i < feeding.length; i++) {
                    const realRow = Math.floor(i / breakPoint);
                    const realCol = i % breakPoint;
                    const sys = feeding[i];
                    const buff = buffInSquare(sys.glyph(), cellsize * 2, true);
                    svg += `<use id="${sys.uid}" href="#svg_${sys.glyph().id}" x="${((realCol * 2) * cellsize) + buff.xOffset}" y="${((currRow + (realRow * 2)) * cellsize) + buff.yOffset}" width="${buff.width}" height="${buff.height}"${status(sys.uid)===false ? "" : ` class="${status(sys.uid)}"`} />`;
                }
                for (let i = 0; i < mag.capacity; i++) {
                    const realI = i + feeding.length;
                    const realRow = Math.floor(realI / breakPoint);
                    const realCol = realI % breakPoint;
                    const glyph = mag.missileGlyph();
                    const buff = buffInSquare(glyph, cellsize * 2, false);
                    svg += `<use href="#svg_${glyph.id}" x="${((realCol * 2) * cellsize) + buff.xOffset}" y="${((currRow + (realRow * 2)) * cellsize) + buff.yOffset}" width="${buff.width}" height="${buff.height}"${status(mag.uid)===false ? "" : ` class="${status(mag.uid)}"`} />`;
                }

                currRow += Math.ceil((feeding.length + mag.capacity) / breakPoint) * 2;
            }
        }

        // Weapons
        if (weapons.length > 0) {
            const freeWeapons: sysLib.System[] = [];
            for (const w of weapons) {
                if (! turretedIds.has(w.uid)) {
                    freeWeapons.push(w);
                }
            }
            if (freeWeapons.length > 0) {
                // name plate
                svg += `<rect x="0" y="${currRow * cellsize}" width="${pxWidth}" height="${cellsize}" stroke="none" fill="#c0c0c0"/><text x="${cellsize * 0.2}" y="${(currRow * cellsize) + (cellsize / 2)}" dominant-baseline="middle" font-size="${cellsize / 2}" class="futureFont">Weapons</text>`;
                currRow++;

                const sorted = [...freeWeapons].sort((a, b) => {
                    if (a.name === b.name) {
                        return a.fullName().localeCompare(b.fullName());
                    } else {
                        return a.name.localeCompare(b.name);
                    }
                });
                for (let i = 0; i < sorted.length; i++) {
                    const realRow = Math.floor(i / breakPoint);
                    const realCol = i % breakPoint;
                    const sys = sorted[i];
                    const buff = buffInSquare(sys.glyph()!, cellsize * 2, true);
                    svg += `<use id="${sys.uid}" href="#svg_${sys.glyph()!.id}" x="${((realCol * 2) * cellsize) + buff.xOffset}" y="${((currRow + (realRow * 2)) * cellsize) + buff.yOffset}" width="${buff.width}" height="${buff.height}"${status(sys.uid)===false ? "" : ` class="${status(sys.uid)}"`} />`;
                }

                currRow += Math.ceil(sorted.length / breakPoint) * 2;
            }
        }

        // Turrets
        if (turrets.length > 0) {
            for (const turret of turrets) {
                // name plate
                svg += `<rect x="0" y="${currRow * cellsize}" width="${pxWidth}" height="${cellsize}" stroke="none" fill="#c0c0c0"/><text x="${cellsize * 0.2}" y="${(currRow * cellsize) + (cellsize / 2)}" dominant-baseline="middle" font-size="${cellsize / 2}" class="futureFont">Turret</text>`;
                currRow++;
                const hosting: sysLib.System[] = [];
                for (const w of weapons) {
                    if (turret.weapons.includes(w.uid)) {
                        hosting.push(w);
                    }
                }
                // First add the turret glyph
                const buff = buffInSquare(turret.glyph(), cellsize * 2, true);
                svg += `<use id="${turret.uid}" href="#svg_${turret.glyph().id}" x="${buff.xOffset}" y="${(currRow * cellsize) + buff.yOffset}" width="${buff.width}" height="${buff.height}"${status(turret.uid)===false ? "" : ` class="${status(turret.uid)}"`} />`;

                for (let i = 0; i < turret.weapons.length; i++) {
                    const realI = i + 1;
                    const realRow = Math.floor(realI / breakPoint);
                    const realCol = realI % breakPoint;
                    const weapon = weapons.find(x => x.uid === turret.weapons[i])!;
                    const glyph = weapon.glyph()!;
                    const buff = buffInSquare(glyph, cellsize * 2, false);
                    svg += `<use id="${weapon.uid}" href="#svg_${glyph.id}" x="${((realCol * 2) * cellsize) + buff.xOffset}" y="${((currRow + (realRow * 2)) * cellsize) + buff.yOffset}" width="${buff.width}" height="${buff.height}"${status(weapon.uid)===false ? "" : ` class="${status(weapon.uid)}"`} />`;
                }

                currRow += Math.ceil((turret.weapons.length + 1) / breakPoint) * 2;
            }
        }

        // invaders
        if (invaders.length > 0) {
            // name plate
            svg += `<rect x="0" y="${currRow * cellsize}" width="${pxWidth}" height="${cellsize}" stroke="none" fill="#c0c0c0"/><text x="${cellsize * 0.2}" y="${(currRow * cellsize) + (cellsize / 2)}" dominant-baseline="middle" font-size="${cellsize / 2}" class="futureFont">Invaders</text>`;
            currRow++;
            const sorted = [...invaders.map(x => x.obj)].sort((a, b) => {
                if (a.name === b.name) {
                    return a.fullName().localeCompare(b.fullName());
                } else {
                    return a.name.localeCompare(b.name);
                }
            });
            for (let i = 0; i < sorted.length; i++) {
                const realRow = Math.floor(i / breakPoint);
                const realCol = i % breakPoint;
                const sys = sorted[i];
                const buff = buffInSquare(sys.glyph()!, cellsize * 2, true);
                svg += `<use id="${sys.uid}" href="#svg_${sys.glyph()!.id}" x="${((realCol * 2) * cellsize) + buff.xOffset}" y="${((currRow + (realRow * 2)) * cellsize) + buff.yOffset}" width="${buff.width}" height="${buff.height}" />`;
            }
            currRow += Math.ceil(sorted.length / breakPoint) * 2;
        }

        // Hull
        // name plate
        svg += `<rect x="0" y="${currRow * cellsize}" width="${pxWidth}" height="${cellsize}" stroke="none" fill="#c0c0c0"/><text x="${cellsize * 0.2}" y="${(currRow * cellsize) + (cellsize / 2)}" dominant-baseline="middle" font-size="${cellsize / 2}" class="futureFont">Hull</text>`;
        currRow++;

        const hullStart = currRow;
        svg += `<use id="_hull" href="#_ssdHull" x="0" y="${currRow * cellsize}" width="${hullCols * cellsize}" height="${hullRows * cellsize}" />`;
        currRow += hullRows + 1;

        // Stats
        // Give text node special ID for autosizing
        svg += `<rect x="0" y="${currRow * cellsize}" width="${pxWidth}" height="${cellsize}" stroke="none" fill="#c0c0c0"/><text id="_resizeStats" x="${cellsize * 0.2}" y="${(currRow * cellsize) + (cellsize / 2)}" dominant-baseline="middle" font-size="${cellsize / 2}" class="futureFont">Mass: ${ship.mass} NPV: ${ship.points} CPV: ${ship.cpv}</text>`;
        currRow++;

        // Drives & Core
        // Background fill now in the SVG itself so I can change it programmatically.
        if (compact) {
            if (svgFtl !== undefined) {
                svg += `<use id="_ftl" href="#svg_${svgFtl.id}" x="${pxWidth - (cellsize * 3)}" y="${hullStart * cellsize}" width="${cellsize * 2}" height="${cellsize * 2}" />`;
            }
            if (svgDrive !== undefined) {
                svg += `<use id="_drive" href="#svg_${svgDrive.id}" x="${pxWidth - (cellsize * 3)}" y="${(hullStart + 2) * cellsize}" width="${cellsize * 2}" height="${cellsize * 2}"${status(driveID!) === false ? "" : ` class="${status(driveID!)}"`} />`;
            }
            svg += `<use id="_core" href="#svg_${svgCore.id}" x="${pxWidth * 0.05}" y="${(currRow * cellsize) + ((cellsize * 3) * 0.05)}" width="${pxWidth * 0.9}" height="${(cellsize * 3) * 0.9}" />`;
        } else {
            let svgCombined = "";
            let startX = 0;
            let groupWidth = 9;
            if (svgFtl !== undefined) {
                svgCombined += `<use id="_ftl" href="#svg_${svgFtl.id}" x="0" y="0" width="${cellsize * 2}" height="${cellsize * 2}" />`;
                startX = cellsize * 2;
                groupWidth += 2;
            }
            if (svgDrive !== undefined) {
                svgCombined += `<use id="_drive" href="#svg_${svgDrive.id}" x="${startX}" y="0" width="${cellsize * 2}" height="${cellsize * 2}"${status(driveID!) === false ? "" : ` class="${status(driveID!)}"`} />`;
            }
            svgCombined += `<use id="_core" href="#svg_${svgCore.id}" x="${startX + (cellsize * 3)}" y="0" width="${cellsize * 6}" height="${cellsize * 2}" />`;
            svg += `<symbol id="_internalLinearCombined" viewBox="-1 -1 ${(groupWidth * cellsize) + 2} ${(cellsize * 2) + 2}">` + svgCombined + `</symbol>`;
            svg += `<use href="#_internalLinearCombined" x="0" y="${currRow * cellsize}" height="${cellsize * 3}" width="${pxWidth}" />`;
        }

        //SSD outline, done last so it overlaps the heading backgrounds.
        svg += `<rect x="0" y="0" height="${pxHeight}" width="${pxWidth}" stroke="black" fill="none" stroke-width="2"/>`;

        svg += `</svg>`;
    }

    return svg;
};

export const renderUri = (ship: FullThrustShip, opts: RenderOpts = {}): string | undefined => {
    const svg = renderSvg(ship, opts);
    if (svg !== undefined) {
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    }
    return undefined;
};

interface IBuffer {
    xOffset: number;
    yOffset: number;
    width: number;
    height: number;
}

const buffInSquare = (glyph: ISystemSVG, size: number, graded: boolean = true): IBuffer => {
    if ( (graded) && (glyph.width === 1) && (glyph.height === 1) ) {
        return {
            xOffset: size / 4,
            yOffset: size / 4,
            width: size / 2,
            height: size / 2
        };
    } else {
        const factor = 0.9;
        return {
            xOffset: (size * (1 - factor)) / 2,
            yOffset: (size * (1 - factor)) / 2,
            width: size * factor,
            height: size * factor
        };
    }
}

// Calculates the clockwise distance between two arcs in number of arcs
export const calcRot = (arc1: Arcs, arc2: Arcs): number => {
    const dists = new Map<Arcs,number>([
        ["F", 6],
        ["FS", 5],
        ["AS", 4],
        ["A", 3],
        ["AP", 2],
        ["FP", 1],
    ]);
    const n1 = dists.get(arc1);
    const n2 = dists.get(arc2);
    if ( (n1 === undefined) || (n2 === undefined) ) {
        throw new Error(`Invalid arc passed: Arc 1: ${arc1}, Arc 2: ${arc2}.`);
    }
    let delta = n1 - n2;
    if (delta < 0) { delta += 6; }
    return delta;
}

// Given an arc and a distance, return the new arc
export const rotArc = (arc: Arcs, dist: number): Arcs => {
    const nextArcCW = new Map<Arcs,Arcs>([
        ["F", "FS"],
        ["FS", "AS"],
        ["AS", "A"],
        ["A", "AP"],
        ["AP", "FP"],
        ["FP", "F"],
    ]);
    if (! nextArcCW.has(arc)) {
        throw new Error(`Invalid arc passed: ${arc}.`);
    }
    let newArc = arc;
    for (let i = 0; i < dist; i++) {
        newArc = nextArcCW.get(newArc)!;
    }
    return newArc;
}
