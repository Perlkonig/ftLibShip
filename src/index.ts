export * from "./lib/svgLib.js";
export * as hull from "./lib/hull.js";
export * as systems from "./lib/systems/index.js";
export * as hexes from "./lib/genHex.js";
export * as arcs from "./lib/genArcs.js";
export * from "./lib/render.js";
export {
    crewFactor,
    dcpAvailability,
    applyDeployedBuiltinDcp,
    hullDcpGrid,
    type IDcpAvailability,
    type IDcpState,
} from "./lib/crew.js";
export {
    resolveHangarOccupancy,
    dockFighterInHangar,
    deployFighterFromHangar,
    fighterSquadrons,
    HangarDockError,
    type HangarState,
    type HangarOccupancy,
    type ResolvedHangarOccupancy,
    type FighterSkill,
    type FighterType,
} from "./lib/fighters.js";
export {
    resolveRackOccupancy,
    deploySquadronFromRack,
    recoverSquadronOnRack,
    gunboatSquadronsOnRacks,
    resolveBoatBayOccupancy,
    recoverSquadronInBoatBay,
    clearBoatBay,
    gunboatsInBoatBays,
    findSquadronByKey,
    squadronKey,
    GunboatRackError,
    type GunboatRackState,
    type GunboatRackOccupancy,
    type BoatBayState,
    type BoatBayOccupancy,
    type ResolvedRackOccupancy,
    type ResolvedBoatBayOccupancy,
    type ResolvedBoat,
    type GunboatType,
} from "./lib/gunboats.js";
export {
    gunboatTypePoints,
    squadronPoints,
    type2name as gunboatType2Name,
    type2abbrev as gunboatType2Abbrev,
} from "./lib/systems/gunboats.js";
export { fighterWingTotals, type FighterWingTotals } from "./lib/fighterWings.js";
export type { FullThrustShip } from "./schemas/ship.js";

import type { FullThrustShip } from "./index.js";
import {
    specialsList,
    getSpecial,
    getSystem,
    ISystem,
} from "./lib/systems/index.js";
import { crewFactor } from "./lib/crew.js";
import { squadronPoints } from "./lib/systems/gunboats.js";
import { fighterWingTotals, wingToSystem } from "./lib/fighterWings.js";

export enum EvalErrorCode {
    NoMass = "NOMASS",
    BadMass = "BADMASS",
    LowHull = "LOWHULL",
    OverMarine = "OVERMARINE",
    OverDCP = "OVERDCP",
    OverCrew = "OVERCREW",
    OverSpinal = "OVERSPINAL",
    OverTurret = "OVERTURRET",
    OverMass = "OVERMASS",
    OverPBL = "OVERPBL",
    DblUID = "DblUID",
    FlawedUnderMass = "FlawedUnderMass",
    UnknownSystem = "UNKNOWNSYSTEM",
    BadMagazinePairing = "BADMAGAZINEPAIRING",
    UnknownGunboatRack = "UNKNOWNGUNBOATRACK",
    OrphanGunboatRack = "ORPHANGUNBOATRACK",
    FtlOnRack = "FTLONRACK",
    OverGunboats = "OVERGUNBOATS",
    GunboatSquadronNoRack = "GUNBOATSQUADRONNORACK",
    DuplicateGunboatRack = "DUPLICATEGUNBOATRACK",
    UnknownFighterHangar = "UNKNOWNFIGHTERHANGAR",
    DuplicateFighterHangar = "DUPLICATEFIGHTERHANGAR",
    OverFighters = "OVERFIGHTERS",
}

export enum ValErrorCode {
    BadJSON = "BADJSON",
    BadConstruction = "BADCONSTRUCTION",
    PointsMismatch = "POINTSMISMATCH",
}

export interface IEvaluation {
    mass: number;
    points: number;
    cpv: number;
    errors: EvalErrorCode[];
}

export const evaluate = (ship: FullThrustShip): IEvaluation => {
    let results = {
        mass: 0,
        points: 0,
        cpv: 0,
        errors: [],
    } as IEvaluation;

    const seenUids: Set<string> = new Set<string>();

    if (!ship.hasOwnProperty("mass") || ship.mass === undefined) {
        results.errors.push(EvalErrorCode.NoMass);
    } else {
        for (const id of specialsList) {
            const obj = getSpecial(id, ship);
            if (obj !== undefined) {
                results.mass += obj.mass();
                results.points += obj.points();
                results.cpv += obj.cpv();
            }
        }

        for (const group of ["systems", "ordnance", "weapons"]) {
            if (ship.hasOwnProperty(group)) {
                for (const sys of ship[group] as ISystem[]) {
                    const obj = getSystem(sys, ship);
                    if (obj === undefined) {
                        results.errors.push(EvalErrorCode.UnknownSystem);
                    } else {
                        results.mass += obj.mass();
                        results.points += obj.points();
                        results.cpv += obj.cpv();
                        if (seenUids.has(obj.uid)) {
                            results.errors.push(EvalErrorCode.DblUID);
                        } else {
                            seenUids.add(obj.uid);
                        }
                    }
                }
            }
        }

        // Mass out of range
        if (ship.mass === undefined || ship.mass < 5 || ship.mass > 300) {
            results.errors.push(EvalErrorCode.BadMass);
        }

        // Hull strength out of range
        if (
            ship.hull === undefined ||
            ship.hull.points === undefined ||
            ship.hull.points < ship.mass * 0.1
        ) {
            results.errors.push(EvalErrorCode.LowHull);
        }

        // Sufficient room for DCPs and marines?
        if (ship.systems !== undefined) {
            const cf = crewFactor(ship);
            let baysPassengers = 0;
            let baysTroops = 0;
            let addMarines = 0;
            let addDamage = 0;
            for (let i = 0; i < ship.systems.length; i++) {
                if (ship.systems[i].name === "damageControl") {
                    addDamage++;
                } else if (ship.systems[i].name === "marines") {
                    addMarines++;
                } else if (ship.systems[i].name === "bay") {
                    if (ship.systems[i].type === "passenger") {
                        if (ship.systems[i].capacity !== undefined) {
                            baysPassengers += ship.systems[i]
                                .capacity as number;
                        }
                    } else if (ship.systems[i].type === "troop") {
                        if (ship.systems[i].capacity !== undefined) {
                            baysTroops += ship.systems[i].capacity as number;
                        }
                    }
                }
            }
            const maxBerthedPassengers = baysPassengers;
            const maxBerthedTroops = baysTroops;
            const maxAdds = cf + maxBerthedPassengers + maxBerthedTroops;
            if (addDamage > cf + maxBerthedPassengers) {
                results.errors.push(EvalErrorCode.OverDCP);
            } else if (addMarines > cf + maxBerthedTroops) {
                results.errors.push(EvalErrorCode.OverMarine);
            } else if (addMarines + addDamage > maxAdds) {
                results.errors.push(EvalErrorCode.OverCrew);
            }
        }

        // Sufficient room for spinal mounts
        if (ship.weapons !== undefined) {
            const maxSpinalMass = 16 * Math.ceil(ship.mass / 50);
            let spinalMass = 0;
            for (const sys of ship.weapons) {
                if (sys.name.startsWith("spinal")) {
                    const obj = getSystem(sys, ship);
                    if (obj !== undefined) {
                        spinalMass += obj.mass();
                    }
                }
            }
            if (spinalMass > maxSpinalMass) {
                results.errors.push(EvalErrorCode.OverSpinal);
            }
        }

        // Sufficient room for turrets
        if (ship.systems !== undefined) {
            const maxTurrets = Math.ceil(ship.mass / 50);
            let turrets = 0;
            for (const sys of ship.systems) {
                if (sys.name === "turret") {
                    turrets++;
                }
            }
            if (turrets > maxTurrets) {
                results.errors.push(EvalErrorCode.OverTurret);
            }
        }
        if (results.mass > ship.mass) {
            results.errors.push(EvalErrorCode.OverMass);
        }

        // Sufficient room for plasma bolt launchers
        if (ship.systems !== undefined) {
            const maxPbls = Math.ceil(ship.mass / 50);
            let pbls = 0;
            if (ship.weapons !== undefined) {
                for (const sys of ship.weapons) {
                    if (sys.name === "pbl") {
                        pbls++;
                    }
                }
            }
            if (pbls > maxPbls) {
                results.errors.push(EvalErrorCode.OverPBL);
            }
        }

        const salvoMagazineIds = new Set<string>();
        const btMagazineIds = new Set<string>();
        if (ship.systems !== undefined) {
            for (const sys of ship.systems) {
                if (sys.id === undefined) {
                    continue;
                }
                if (sys.name === "magazine") {
                    salvoMagazineIds.add(sys.id as string);
                } else if (sys.name === "boardingTorpedoMagazine") {
                    btMagazineIds.add(sys.id as string);
                }
            }
        }
        if (ship.ordnance !== undefined) {
            for (const sys of ship.ordnance) {
                if (
                    sys.name === "salvoLauncher" &&
                    sys.magazine !== undefined
                ) {
                    if (!salvoMagazineIds.has(sys.magazine as string)) {
                        results.errors.push(EvalErrorCode.BadMagazinePairing);
                    }
                }
            }
        }
        if (ship.weapons !== undefined) {
            for (const sys of ship.weapons) {
                if (
                    sys.name === "boardingTorpedoLauncher" &&
                    sys.magazine !== undefined
                ) {
                    if (!btMagazineIds.has(sys.magazine as string)) {
                        results.errors.push(EvalErrorCode.BadMagazinePairing);
                    }
                }
            }
        }

        const hangarIds = new Set<string>();
        let hangarCount = 0;
        if (ship.systems !== undefined) {
            for (const sys of ship.systems) {
                if (sys.name === "hangar" && sys.id !== undefined) {
                    hangarIds.add(sys.id as string);
                    hangarCount++;
                }
            }
        }
        if (ship.fighters !== undefined) {
            if (ship.fighters.length > hangarCount) {
                results.errors.push(EvalErrorCode.OverFighters);
            }
            const usedHangars = new Set<string>();
            for (const wing of ship.fighters) {
                if (wing.hangar !== undefined) {
                    if (!hangarIds.has(wing.hangar)) {
                        results.errors.push(EvalErrorCode.UnknownFighterHangar);
                    } else if (usedHangars.has(wing.hangar)) {
                        results.errors.push(
                            EvalErrorCode.DuplicateFighterHangar
                        );
                    } else {
                        usedHangars.add(wing.hangar);
                    }
                }
                const obj = getSystem(wingToSystem(wing), ship);
                if (obj !== undefined) {
                    results.points += obj.points();
                    results.cpv += obj.cpv();
                }
            }
        }

        const gunboatRackIds = new Set<string>();
        if (ship.systems !== undefined) {
            for (const sys of ship.systems) {
                if (sys.name === "gunboatRack" && sys.id !== undefined) {
                    gunboatRackIds.add(sys.id as string);
                }
            }
        }

        const squadronsLinkedToRack = new Set<string>();
        if (ship.gunboatSquadrons !== undefined) {
            for (const squadron of ship.gunboatSquadrons) {
                results.points += squadronPoints(squadron);
                if (squadron.boats.length > 6) {
                    results.errors.push(EvalErrorCode.OverGunboats);
                }
                const isFtl = squadron.mods?.includes("ftl") ?? false;
                if (isFtl && squadron.rack !== undefined) {
                    results.errors.push(EvalErrorCode.FtlOnRack);
                }
                if (!isFtl && squadron.rack === undefined) {
                    results.errors.push(EvalErrorCode.GunboatSquadronNoRack);
                }
                if (squadron.rack !== undefined) {
                    if (!gunboatRackIds.has(squadron.rack)) {
                        results.errors.push(EvalErrorCode.UnknownGunboatRack);
                    } else if (squadronsLinkedToRack.has(squadron.rack)) {
                        results.errors.push(EvalErrorCode.DuplicateGunboatRack);
                    } else {
                        squadronsLinkedToRack.add(squadron.rack);
                    }
                }
            }
        }

        for (const rackId of gunboatRackIds) {
            if (!squadronsLinkedToRack.has(rackId)) {
                results.errors.push(EvalErrorCode.OrphanGunboatRack);
            }
        }

        // Handle "flawed" design
        if (ship.flawed !== undefined && ship.flawed) {
            if (ship.mass < 60) {
                results.errors.push(EvalErrorCode.FlawedUnderMass);
            } else {
                results.points = Math.ceil(results.points * 0.8);
                results.cpv = Math.ceil(results.cpv * 0.8);
            }
        }
    }

    return results;
};

import Ajv from "ajv";
import schema from "./schemas/shipSchema.js";
const ajv = new Ajv.default({ allErrors: true });
const ajvValidate = ajv.compile<FullThrustShip>(schema);

export interface IValidation {
    valid: boolean;
    code?: ValErrorCode;
    ajvErrors?: Ajv.ErrorObject[];
    evalErrors?: EvalErrorCode[];
}

export const validate = (shipJson: string): IValidation => {
    const results = {
        valid: true,
    } as IValidation;

    let shipObj: FullThrustShip;
    try {
        shipObj = JSON.parse(shipJson);
    } catch {
        return {
            valid: false,
            code: ValErrorCode.BadJSON,
        };
    }

    if (!ajvValidate(shipObj)) {
        results.valid = false;
        results.code = ValErrorCode.BadJSON;
        results.ajvErrors = ajvValidate.errors!;
    }

    if (results.valid) {
        // Evaluate and look for construction errors
        const evaluation = evaluate(shipObj);
        if (evaluation.errors.length > 0) {
            results.valid = false;
            results.code = ValErrorCode.BadConstruction;
            results.evalErrors = evaluation.errors;
        }

        if (results.valid) {
            // Make sure stated points match evaluated points
            if (
                shipObj.points !== evaluation.points ||
                shipObj.cpv !== evaluation.cpv
            ) {
                results.valid = false;
                results.code = ValErrorCode.PointsMismatch;
            }
        }
    }

    return results;
};
