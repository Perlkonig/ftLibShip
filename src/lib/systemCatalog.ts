import type { FullThrustShip } from "../schemas/ship.js";
import type { FighterType } from "./systems/fighters.js";
import { type2name } from "./systems/fighters.js";
import { type2name as gunboatType2name } from "./systems/gunboats.js";
import { Flawed } from "./systems/flawed.js";
import {
    getSystem,
    ordnanceList,
    sortNames,
    systemList,
    weaponList,
} from "./systems/index.js";
import type { ISystem, System } from "./systems/_base.js";
import { Pulser } from "./systems/pulser.js";
import { Fusion } from "./systems/fusion.js";

export type SystemCatalogCategory =
    | "propulsion"
    | "systems"
    | "ordnance"
    | "weapons"
    | "fighters"
    | "gunboats"
    | "auxiliary";

export interface SystemCatalogEntry {
    category: SystemCatalogCategory;
    /** Short system code (schema `name` value). */
    name: string;
    /** Human-readable base system name without variant qualifiers. */
    baseName: string;
    /** Variant property codes applied to this configuration. */
    variants: Record<string, unknown>;
    /** Full display name including variant qualifiers. */
    fullName: string;
}

const PROPULSION_BASE_NAMES: Record<string, string> = {
    drive: "Main Drive",
    ftl: "Faster-Than-Light Drive",
};

const SYSTEMS_EXCLUDE = new Set(["hangar", "launchTube", "turret"]);

type FighterMod = "heavy" | "fast" | "longRange" | "ftl" | "robot";

const ALL_FIGHTER_MODS: FighterMod[] = [
    "heavy",
    "fast",
    "longRange",
    "ftl",
    "robot",
];

export const catalogStubShip = (): FullThrustShip =>
    ({
        mass: 50,
        hashseed: "system-catalog",
        hull: { points: 15, rows: 4, stealth: "0", streamlining: "none" },
        armour: [],
        systems: [],
        weapons: [],
        ordnance: [],
        points: 100,
        cpv: 80,
        name: "System Catalog Stub",
    }) as FullThrustShip;

export const defaultArcWeapon = (
    name: string,
    extra: Record<string, unknown> = {}
): ISystem => ({
    name,
    id: `catalog_${name}`,
    leftArc: "F",
    numArcs: 6,
    class: 1,
    ...extra,
});

export const systemConfigs = (name: string): ISystem[] => {
    switch (name) {
        case "bay":
            return (
                ["cargo", "passenger", "troop", "boat", "tender"] as const
            ).map((type) => ({
                name: "bay",
                type,
                id: `bay_${type}`,
                capacity: 1,
            }));
        case "decoy":
            return [
                { name: "decoy", type: "cruiser", id: "decoy_c" },
                { name: "decoy", type: "capital", id: "decoy_cap" },
            ];
        case "ecm":
            return [
                { name: "ecm", id: "ecm" },
                { name: "ecm", area: true, id: "ecm_area" },
            ];
        case "fireControl":
            return [
                { name: "fireControl", id: "fc" },
                { name: "fireControl", advanced: true, id: "fc_adv" },
            ];
        case "adfc":
            return [
                { name: "adfc", id: "adfc" },
                { name: "adfc", advanced: true, id: "adfc_adv" },
            ];
        case "sensors":
            return [
                { name: "sensors", id: "sensors" },
                { name: "sensors", advanced: true, id: "sensors_adv" },
            ];
        case "screen": {
            const configs: ISystem[] = [];
            for (const advanced of [false, true]) {
                for (const area of [false, true]) {
                    for (const level of [undefined, 1, 2] as const) {
                        configs.push({
                            name: "screen",
                            advanced,
                            area,
                            ...(level !== undefined ? { level } : {}),
                            id: `screen_${advanced}_${area}_${level ?? "u"}`,
                        });
                    }
                }
            }
            return configs;
        }
        case "magazine":
            return [
                { name: "magazine", capacity: 6, id: "mag" },
                { name: "magazine", capacity: 6, modifier: "er", id: "mag_er" },
                {
                    name: "magazine",
                    capacity: 6,
                    modifier: "twostage",
                    id: "mag_ts",
                },
            ];
        case "boardingTorpedoMagazine":
            return [
                {
                    name: "boardingTorpedoMagazine",
                    capacity: 6,
                    id: "bt_mag",
                },
            ];
        case "mineLayer":
            return [{ name: "mineLayer", capacity: 4, id: "ml" }];
        default:
            return [{ name, id: `sys_${name}` }];
    }
};

export const weaponConfigs = (name: string): ISystem[] => {
    switch (name) {
        case "beam":
        case "emp":
        case "needle":
        case "phaser":
        case "plasmaCannon":
        case "gravitic":
        case "pbl":
        case "transporter":
            return [1, 2, 3, 4].map((cls) =>
                defaultArcWeapon(name, { class: cls, id: `${name}_${cls}` })
            );
        case "graser": {
            const configs: ISystem[] = [];
            for (let cls = 1; cls <= 4; cls++) {
                for (const heavy of [false, true]) {
                    if (heavy && cls > 3) {
                        continue;
                    }
                    for (const highIntensity of [false, true]) {
                        configs.push(
                            defaultArcWeapon("graser", {
                                class: cls,
                                heavy,
                                highIntensity,
                                id: `graser_${cls}_${heavy}_${highIntensity}`,
                            })
                        );
                    }
                }
            }
            return configs;
        }
        case "kgun": {
            const configs: ISystem[] = [];
            for (const cls of [1, 2, 3, 4, 5, 6]) {
                for (const modifier of ["none", "short", "long"] as const) {
                    configs.push(
                        defaultArcWeapon("kgun", {
                            class: cls,
                            ...(modifier !== "none" ? { modifier } : {}),
                            id: `kgun_${cls}_${modifier}`,
                        })
                    );
                }
            }
            return configs;
        }
        case "torpedoPulse":
            return (["none", "short", "long"] as const).map((modifier) =>
                defaultArcWeapon("torpedoPulse", {
                    ...(modifier !== "none" ? { modifier } : {}),
                    numArcs: 1,
                    id: `tp_${modifier}`,
                })
            );
        case "boardingTorpedoLauncher":
            return (["F", "FS", "FP", "A", "AS", "AP"] as const).map(
                (leftArc) =>
                    defaultArcWeapon("boardingTorpedoLauncher", {
                        leftArc,
                        numArcs: 3,
                        id: `btl_${leftArc}`,
                    })
            );
        case "pulser":
            return (["undefined", "short", "medium", "long"] as const).map(
                (range) =>
                    defaultArcWeapon("pulser", {
                        range,
                        id: `pulser_${range}`,
                    })
            );
        case "fusion":
            return (["undefined", "flare", "torpedo"] as const).map((mode) =>
                defaultArcWeapon("fusion", {
                    mode,
                    id: `fusion_${mode}`,
                })
            );
        case "spinalBeam":
        case "spinalPlasma":
        case "spinalSingularity":
            return (["short", "medium", "long"] as const).map((range) => ({
                name,
                range,
                id: `${name}_${range}`,
            }));
        case "missile":
        case "salvo":
            return [
                { name, id: `${name}_base` },
                { name, modifier: "er", id: `${name}_er` },
                { name, modifier: "twostage", id: `${name}_ts` },
            ];
        default:
            return [defaultArcWeapon(name)];
    }
};

const validFighterMods = (type: FighterType): FighterMod[] => {
    if (type.startsWith("light")) {
        return ["fast", "robot"];
    }
    return ALL_FIGHTER_MODS;
};

const modSubsets = (mods: FighterMod[]): FighterMod[][] => {
    const subsets: FighterMod[][] = [[]];
    for (const mod of mods) {
        const count = subsets.length;
        for (let i = 0; i < count; i++) {
            subsets.push([...subsets[i], mod]);
        }
    }
    return subsets;
};

const fighterConfigs = (): ISystem[] => {
    const configs: ISystem[] = [];
    for (const type of type2name.keys()) {
        for (const mods of modSubsets(validFighterMods(type))) {
            configs.push({
                name: "fighters",
                type,
                id: `fighters_${type}_${mods.join("_") || "base"}`,
                ...(mods.length > 0 ? { mods: [...mods].sort() } : {}),
            });
        }
    }
    return configs;
};

const gunboatBoatCatalogEntries = (): SystemCatalogEntry[] => {
    const entries: SystemCatalogEntry[] = [];
    for (const [type, fullName] of gunboatType2name) {
        entries.push({
            category: "gunboats",
            name: "gunboat",
            baseName: "Gunboats",
            variants: { type },
            fullName,
        });
    }
    return entries;
};

const stripMeta = (data: ISystem): Record<string, unknown> => {
    const { name, id, ...rest } = data;
    return Object.fromEntries(
        Object.entries(rest).filter(([, value]) => value !== undefined)
    );
};

const resolveBaseName = (name: string): string =>
    sortNames.get(name) ?? PROPULSION_BASE_NAMES[name] ?? name;

const catalogKey = (entry: SystemCatalogEntry): string =>
    `${entry.category}\0${entry.name}\0${JSON.stringify(entry.variants)}\0${entry.fullName}`;

const addCatalogEntry = (
    entries: SystemCatalogEntry[],
    seen: Set<string>,
    category: SystemCatalogCategory,
    data: ISystem,
    ship: FullThrustShip,
    prepare?: (sys: System) => void
): void => {
    const sys = getSystem(data, ship);
    if (sys === undefined) {
        return;
    }
    prepare?.(sys);

    let variants = stripMeta(data);
    if (sys.name === "pulser" && variants.range === undefined) {
        variants = { ...variants, range: (sys as Pulser).range };
    }
    if (sys.name === "fusion" && variants.mode === undefined) {
        variants = { ...variants, mode: (sys as Fusion).mode };
    }

    const entry: SystemCatalogEntry = {
        category,
        name: data.name,
        baseName: resolveBaseName(data.name),
        variants,
        fullName: sys.fullName(),
    };

    const key = catalogKey(entry);
    if (seen.has(key)) {
        return;
    }
    seen.add(key);
    entries.push(entry);
};

/** Enumerate every supported system configuration and its display name. */
export const buildSystemCatalog = (
    ship: FullThrustShip = catalogStubShip()
): SystemCatalogEntry[] => {
    const entries: SystemCatalogEntry[] = [];
    const seen = new Set<string>();

    addCatalogEntry(
        entries,
        seen,
        "propulsion",
        { name: "drive", thrust: 6, id: "drive" },
        ship
    );
    addCatalogEntry(
        entries,
        seen,
        "propulsion",
        { name: "drive", thrust: 6, advanced: true, id: "drive_adv" },
        ship
    );
    addCatalogEntry(entries, seen, "propulsion", { name: "ftl", id: "ftl" }, ship);
    addCatalogEntry(
        entries,
        seen,
        "propulsion",
        { name: "ftl", advanced: true, id: "ftl_adv" },
        ship
    );

    for (const name of systemList) {
        if (SYSTEMS_EXCLUDE.has(name)) {
            continue;
        }
        for (const data of systemConfigs(name)) {
            addCatalogEntry(entries, seen, "systems", data, ship);
        }
    }

    for (const name of ordnanceList) {
        for (const data of weaponConfigs(name)) {
            addCatalogEntry(entries, seen, "ordnance", data, ship);
        }
    }

    for (const name of weaponList) {
        for (const data of weaponConfigs(name)) {
            addCatalogEntry(entries, seen, "weapons", data, ship);
        }
    }

    addCatalogEntry(
        entries,
        seen,
        "fighters",
        { name: "hangar", id: "hangar_rack", isRack: true },
        ship
    );
    addCatalogEntry(
        entries,
        seen,
        "fighters",
        { name: "hangar", id: "hangar_bay" },
        ship
    );
    addCatalogEntry(
        entries,
        seen,
        "fighters",
        { name: "launchTube", id: "lt" },
        ship
    );
    addCatalogEntry(
        entries,
        seen,
        "fighters",
        { name: "launchTube", catapult: true, id: "lt_cat" },
        ship
    );
    addCatalogEntry(
        entries,
        seen,
        "fighters",
        { name: "turret", leftArc: "F", numArcs: 1, id: "turret" },
        ship
    );

    for (const data of fighterConfigs()) {
        addCatalogEntry(entries, seen, "fighters", data, ship);
    }

    for (const entry of gunboatBoatCatalogEntries()) {
        const key = catalogKey(entry);
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        entries.push(entry);
    }

    addCatalogEntry(
        entries,
        seen,
        "auxiliary",
        { name: "marines", id: "aux_mar" },
        ship
    );
    addCatalogEntry(
        entries,
        seen,
        "auxiliary",
        { name: "damageControl", id: "aux_dcp" },
        ship
    );

    const flawed = new Flawed({ name: "flawed", id: "flawed" }, ship);
    const flawedEntry: SystemCatalogEntry = {
        category: "auxiliary",
        name: "flawed",
        baseName: "Flawed Design",
        variants: {},
        fullName: flawed.fullName(),
    };
    const flawedKey = catalogKey(flawedEntry);
    if (!seen.has(flawedKey)) {
        seen.add(flawedKey);
        entries.push(flawedEntry);
    }

    const categoryOrder: SystemCatalogCategory[] = [
        "propulsion",
        "systems",
        "ordnance",
        "weapons",
        "fighters",
        "gunboats",
        "auxiliary",
    ];

    return entries.sort((a, b) => {
        const cat =
            categoryOrder.indexOf(a.category) -
            categoryOrder.indexOf(b.category);
        if (cat !== 0) {
            return cat;
        }
        const base = a.baseName.localeCompare(b.baseName);
        if (base !== 0) {
            return base;
        }
        return a.fullName.localeCompare(b.fullName);
    });
};

export const systemCatalogEntryCount = (
    ship?: FullThrustShip
): number => buildSystemCatalog(ship).length;
