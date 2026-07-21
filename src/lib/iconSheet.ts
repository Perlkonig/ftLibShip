import type { FullThrustShip } from "../schemas/ship.js";
import type { ISystemSVG } from "./svgLib.js";
import { svgLib } from "./svgLib.js";
import { type2name } from "./systems/fighters.js";
import { Hangar } from "./systems/hangar.js";
import { GunboatRack } from "./systems/gunboatRack.js";
import type { GunboatType } from "./systems/gunboats.js";
import { getSystem, ordnanceList, systemList, weaponList } from "./systems/index.js";
import type { ISystem, System } from "./systems/_base.js";
import { Flawed } from "./systems/flawed.js";
import { MineLayer } from "./systems/mineLayer.js";
import { Magazine } from "./systems/magazine.js";
import { BoardingTorpedoMagazine } from "./systems/boardingTorpedoMagazine.js";
import type { ResolvedHangarOccupancy } from "./fighters.js";
import {
    catalogStubShip,
    systemConfigs,
    weaponConfigs,
} from "./systemCatalog.js";

export type IconSheetGroup =
    | "Hull and armour"
    | "Propulsion"
    | "Systems"
    | "Ordnance"
    | "Weapons"
    | "Fighter bays and wings"
    | "Gunboats"
    | "Auxiliary";

export const GROUP_ORDER: IconSheetGroup[] = [
    "Hull and armour",
    "Propulsion",
    "Systems",
    "Ordnance",
    "Weapons",
    "Fighter bays and wings",
    "Gunboats",
    "Auxiliary",
];

const COLUMNS = 8;
const CELL_SIZE = 100;
const HEADER_HEIGHT = 40;
const H_PADDING = 8;
const LABEL_FONT_SIZE = 10;
const LABEL_LINE_HEIGHT = 12;
const LABEL_GAP = 4;
const LABEL_BOTTOM_PAD = 4;
const MAX_LABEL_CHARS_PER_LINE = 12;

const SYSTEMS_EXCLUDE = new Set(["hangar", "launchTube", "turret"]);

interface IconSheetEntry {
    group: IconSheetGroup;
    label: string;
    glyph: ISystemSVG;
    graded: boolean;
}

const escapeXml = (value: string): string =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

/** Word-wrap a label to fit within one icon sheet cell. Exported for tests. */
export const wrapIconSheetLabel = (
    label: string,
    maxChars: number = MAX_LABEL_CHARS_PER_LINE
): string[] => {
    const words = label.split(/\s+/).filter((w) => w.length > 0);
    if (words.length === 0) {
        return [""];
    }

    const lines: string[] = [];
    let current = "";

    const pushLongWord = (word: string) => {
        for (let i = 0; i < word.length; i += maxChars) {
            lines.push(word.slice(i, i + maxChars));
        }
    };

    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length <= maxChars) {
            current = candidate;
            continue;
        }
        if (current) {
            lines.push(current);
            current = "";
        }
        if (word.length <= maxChars) {
            current = word;
        } else {
            pushLongWord(word);
        }
    }
    if (current) {
        lines.push(current);
    }
    return lines;
};

const labelAreaHeight = (lineCount: number): number =>
    LABEL_GAP + lineCount * LABEL_LINE_HEIGHT + LABEL_BOTTOM_PAD;

const rowHeightForLines = (maxLines: number): number =>
    CELL_SIZE + labelAreaHeight(maxLines);

const renderLabel = (
    x: number,
    iconY: number,
    label: string
): { svg: string; lines: string[] } => {
    const lines = wrapIconSheetLabel(label);
    const textX = x + CELL_SIZE / 2;
    const startY = iconY + CELL_SIZE + LABEL_GAP + LABEL_FONT_SIZE;
    let svg = `<text x="${textX}" y="${startY}" text-anchor="middle" font-size="${LABEL_FONT_SIZE}">`;
    for (let i = 0; i < lines.length; i++) {
        const dy = i === 0 ? 0 : LABEL_LINE_HEIGHT;
        svg += `<tspan x="${textX}" dy="${dy}">${escapeXml(lines[i])}</tspan>`;
    }
    svg += `</text>`;
    return { svg, lines };
};

const buffInSquare = (
    glyph: ISystemSVG,
    size: number,
    graded: boolean
): { xOffset: number; yOffset: number; width: number; height: number } => {
    if (graded && glyph.width === 1 && glyph.height === 1) {
        return {
            xOffset: size / 4,
            yOffset: size / 4,
            width: size / 2,
            height: size / 2,
        };
    }
    const factor = 0.9;
    return {
        xOffset: (size * (1 - factor)) / 2,
        yOffset: (size * (1 - factor)) / 2,
        width: size * factor,
        height: size * factor,
    };
};

class CatalogBuilder {
    private readonly ship: FullThrustShip;
    private readonly entries: IconSheetEntry[] = [];
    private readonly labels = new Set<string>();

    constructor(ship: FullThrustShip) {
        this.ship = ship;
    }

    addGlyph(
        group: IconSheetGroup,
        label: string,
        glyph: ISystemSVG | undefined,
        graded = true
    ): void {
        if (glyph === undefined || this.labels.has(label)) {
            return;
        }
        this.labels.add(label);
        this.entries.push({ group, label, glyph, graded });
    }

    addSystem(
        group: IconSheetGroup,
        data: ISystem,
        options?: {
            label?: string;
            graded?: boolean;
            prepare?: (sys: System) => void;
        }
    ): void {
        const sys = getSystem(data, this.ship);
        if (sys === undefined) {
            return;
        }
        options?.prepare?.(sys);
        const label = options?.label ?? sys.fullName();
        this.addGlyph(group, label, sys.glyph(), options?.graded ?? true);
    }

    build(): IconSheetEntry[] {
        return this.entries;
    }
}

const buildCatalog = (ship: FullThrustShip): IconSheetEntry[] => {
    const builder = new CatalogBuilder(ship);

    const hullGlyphs: { label: string; id: string }[] = [
        { label: "Armour", id: "svglib_armour" },
        { label: "Armour (damaged)", id: "svglib_armourDamaged" },
        { label: "Armour (regenerative)", id: "svglib_armourRegen" },
        {
            label: "Armour (regenerative, damaged)",
            id: "svglib_armourRegenDamaged",
        },
        { label: "Armour (regenerative, lost)", id: "svglib_armourRegenLost" },
        { label: "Hull box", id: "svglib_hull" },
        { label: "Hull box (crew star)", id: "svglib_hullCrew" },
        { label: "Hull box (damaged)", id: "svglib_hullDamaged" },
    ];
    for (const item of hullGlyphs) {
        const glyph = svgLib.find((x) => x.id === item.id);
        builder.addGlyph("Hull and armour", item.label, glyph);
    }

    builder.addSystem("Propulsion", {
        name: "drive",
        thrust: 6,
        id: "drive",
    });
    builder.addSystem("Propulsion", {
        name: "drive",
        thrust: 6,
        advanced: true,
        id: "drive_adv",
    });
    builder.addSystem("Propulsion", { name: "ftl", id: "ftl" });
    builder.addSystem("Propulsion", {
        name: "ftl",
        advanced: true,
        id: "ftl_adv",
    });

    for (const name of systemList) {
        if (SYSTEMS_EXCLUDE.has(name)) {
            continue;
        }
        for (const data of systemConfigs(name)) {
            builder.addSystem("Systems", data);
        }
    }

    for (const name of ordnanceList) {
        for (const data of weaponConfigs(name)) {
            builder.addSystem("Ordnance", data);
        }
    }

    const mineLayer = getSystem(
        { name: "mineLayer", capacity: 4, id: "ord_ml" },
        ship
    ) as MineLayer;
    builder.addGlyph("Ordnance", "Mine", mineLayer.individualMine(), false);

    const magazine = getSystem(
        { name: "magazine", capacity: 6, id: "ord_mag" },
        ship
    ) as Magazine;
    builder.addGlyph(
        "Ordnance",
        "Salvo missile",
        magazine.missileGlyph(),
        false
    );

    const boardingMagazine = getSystem(
        {
            name: "boardingTorpedoMagazine",
            capacity: 6,
            id: "ord_mag_bt",
        },
        ship
    ) as BoardingTorpedoMagazine;
    builder.addGlyph(
        "Ordnance",
        "Boarding torpedo",
        boardingMagazine.missileGlyph(),
        false
    );

    for (const name of weaponList) {
        for (const data of weaponConfigs(name)) {
            builder.addSystem("Weapons", data);
        }
    }

    builder.addSystem("Fighter bays and wings", {
        name: "hangar",
        id: "hangar_rack",
        isRack: true,
    });
    builder.addSystem("Fighter bays and wings", {
        name: "hangar",
        id: "hangar_bay",
    });
    const fighterTypes = [...type2name.keys()].sort((a, b) =>
        type2name.get(a)!.localeCompare(type2name.get(b)!)
    );
    for (const type of fighterTypes) {
        const hangar = getSystem(
            { name: "hangar", id: `hangar_${type}` },
            ship
        ) as Hangar;
        hangar.occupancy = {
            hangarId: hangar.id,
            occupied: true,
            deployed: false,
            type,
            number: 6,
            capacity: 6,
            isPartial: false,
            skill: "standard",
        } satisfies ResolvedHangarOccupancy;
        builder.addGlyph(
            "Fighter bays and wings",
            `Hangar Bay — ${type2name.get(type)}`,
            hangar.glyph(),
            false
        );
    }
    builder.addSystem("Fighter bays and wings", {
        name: "launchTube",
        id: "lt",
    });
    builder.addSystem("Fighter bays and wings", {
        name: "launchTube",
        catapult: true,
        id: "lt_cat",
    });

    builder.addSystem("Gunboats", {
        name: "gunboatRack",
        id: "gb_rack_empty",
    });
    const sampleTypes: GunboatType[] = [
        "beam",
        "graser",
        "plasma",
        "missile",
        "pointDefense",
        "kGun",
    ];
    const occupiedRack = getSystem(
        { name: "gunboatRack", id: "gb_rack_occupied" },
        ship
    ) as GunboatRack;
    occupiedRack.occupancy = {
        rackId: occupiedRack.id,
        occupied: true,
        deployed: false,
        squadronKey: "gb_rack_occupied",
        boats: sampleTypes.map((type) => ({ type })),
        ecm: 0,
        ftl: false,
        endurance: 6,
    };
    builder.addGlyph(
        "Gunboats",
        "Gunboat Rack (occupied sample)",
        occupiedRack.glyph(),
        false
    );

    const core = svgLib.find((x) => x.id === "svglib_coreSys");
    builder.addGlyph("Auxiliary", "Core systems", core);

    builder.addSystem("Auxiliary", { name: "marines", id: "aux_mar" });
    builder.addSystem("Auxiliary", {
        name: "damageControl",
        id: "aux_dcp",
    });
    const flawed = new Flawed({ name: "_flawed" }, ship);
    builder.addGlyph("Auxiliary", flawed.fullName(), flawed.glyph());

    return builder.build();
};

export const iconSheetEntries = (ship?: FullThrustShip): IconSheetEntry[] => {
    const entries = buildCatalog(ship ?? catalogStubShip());
    const sorted: IconSheetEntry[] = [];
    for (const group of GROUP_ORDER) {
        const groupEntries = entries
            .filter((e) => e.group === group)
            .sort((a, b) => a.label.localeCompare(b.label));
        sorted.push(...groupEntries);
    }
    return sorted;
};

const namespaceGlyph = (glyph: ISystemSVG, index: number): ISystemSVG => {
    const newId = `icon_${index}`;
    const escapedId = glyph.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const svg = glyph.svg
        .replace(
            new RegExp(`(<symbol id=")${escapedId}(")`),
            `$1${newId}$2`
        )
        .replace(
            new RegExp(`(href="#)${escapedId}(")`, "g"),
            `$1${newId}$2`
        );
    return { ...glyph, id: newId, svg };
};

export const renderIconSheet = (ship?: FullThrustShip): string => {
    const entries = iconSheetEntries(ship);
    let body = "";
    let y = 0;
    let entryIndex = 0;

    const sheetWidth = COLUMNS * CELL_SIZE + H_PADDING * 2;
    const defs: string[] = [];

    for (const group of GROUP_ORDER) {
        const items = entries.filter((e) => e.group === group);
        if (items.length === 0) {
            continue;
        }

        body += `<rect x="0" y="${y}" width="${sheetWidth}" height="${HEADER_HEIGHT}" fill="#c0c0c0"/>`;
        body += `<text x="${H_PADDING}" y="${y + HEADER_HEIGHT / 2}" dominant-baseline="middle" font-size="18" class="futureFont">${escapeXml(group)}</text>`;
        y += HEADER_HEIGHT;

        const rowCount = Math.ceil(items.length / COLUMNS);
        for (let row = 0; row < rowCount; row++) {
            let maxLines = 1;
            const rowItems: {
                item: IconSheetEntry;
                col: number;
                lines: string[];
            }[] = [];

            for (let col = 0; col < COLUMNS; col++) {
                const i = row * COLUMNS + col;
                if (i >= items.length) {
                    break;
                }
                const lines = wrapIconSheetLabel(items[i].label);
                maxLines = Math.max(maxLines, lines.length);
                rowItems.push({ item: items[i], col, lines });
            }

            const rowHeight = rowHeightForLines(maxLines);
            const iconY = y;

            for (const { item, col } of rowItems) {
                const glyph = namespaceGlyph(item.glyph, entryIndex++);
                defs.push(glyph.svg);

                const x = H_PADDING + col * CELL_SIZE;
                const buff = buffInSquare(glyph, CELL_SIZE, item.graded);
                body += `<use href="#${glyph.id}" x="${x + buff.xOffset}" y="${iconY + buff.yOffset}" width="${buff.width}" height="${buff.height}"/>`;
                body += renderLabel(x, iconY, item.label).svg;
            }

            y += rowHeight;
        }
    }

    const width = COLUMNS * CELL_SIZE + H_PADDING * 2;
    let svg = `<?xml version="1.0" encoding="UTF-8"?>`;
    svg += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${y}" width="${width}" height="${y}">`;
    svg += `<style type="text/css"><![CDATA[text{font-family:"Roboto",sans-serif}.futureFont{font-family:"Zen Dots","Roboto",sans-serif}]]></style>`;
    svg += `<defs>${defs.join("")}</defs>`;
    svg += body;
    svg += `</svg>`;
    return svg;
};

export const iconSheetEntryCount = (ship?: FullThrustShip): number =>
    iconSheetEntries(ship).length;
