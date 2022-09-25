export * from "./lib/svgLib.js";
export * as hull from "./lib/hull.js";
export * as systems from "./lib/systems/index.js";
export * as hexes from "./lib/genHex.js";
export * as arcs from "./lib/genArcs.js";
export type { FullThrustShip } from "./schemas/ship.js";

import type { FullThrustShip } from "./index.js";
import { specialsList, getSpecial, getSystem, ISystem } from "./lib/systems/index.js";

export enum EvalErrorCode {
    NoMass="NOMASS",
    BadMass="BADMASS",
    LowHull="LOWHULL",
    OverShell="OVERSHELL",
    OverArmour="OVERARMOUR",
    OverMarine="OVERMARINE",
    OverDCP="OVERDCP",
    OverCrew="OVERCREW",
    OverSpinal="OVERSPINAL",
    OverTurret="OVERTURRET",
    OverMass="OVERMASS",
    OverPBL="OVERPBL",
}

export enum ValErrorCode {
    BadJSON="BADJSON",
    BadConstruction="BADCONSTRUCTION",
    PointsMismatch="POINTSMISMATCH",
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
        errors: []
    } as IEvaluation;

    if ( (! ship.hasOwnProperty("mass")) || (ship.mass === undefined) ) {
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
                    if (obj !== undefined) {
                        results.mass += obj.mass();
                        results.points += obj.points();
                        results.cpv += obj.cpv();
                    }
                }
            }
        }

        // Mass out of range
        if ( (ship.mass === undefined) || (ship.mass < 5) || (ship.mass > 300) ) {
            results.errors.push(EvalErrorCode.BadMass);
        }

        // Hull strength out of range
        if ( (ship.hull === undefined) || (ship.hull.points === undefined) || (ship.hull.points < (ship.mass * 0.1)) ) {
            results.errors.push(EvalErrorCode.LowHull);
        }

        // Any armour rows out of range
        if ( (ship.armour !== undefined) && (ship.hull !== undefined) ) {
            const maxArmour = Math.ceil(ship.hull.points / ship.hull.rows);
            if ( (ship.hasOwnProperty("armour")) && (ship.armour.length > 0) ) {
                if (ship.armour.length > 5) {
                    results.errors.push(EvalErrorCode.OverShell);
                }
                for (let i = 0; i < ship.armour.length; i++) {
                    if (ship.armour[i][0] + ship.armour[i][1] > maxArmour) {
                        results.errors.push(EvalErrorCode.OverArmour);
                    }
                }
            }
        }

        // Sufficient room for DCPs and marines?
        if (ship.systems !== undefined) {
            const cf = Math.ceil(ship.mass / 20);
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
                        baysPassengers++;
                    } else if (ship.systems[i].type === "troop") {
                        baysTroops++;
                    }
                }
            }
            const maxBerthedPassengers = baysPassengers * 4;
            const maxBerthedTroops = baysTroops * 3;
            const maxAdds = cf + maxBerthedPassengers + maxBerthedTroops;
            if (addDamage > (cf + maxBerthedPassengers)) {
                results.errors.push(EvalErrorCode.OverDCP);
            } else if (addMarines > (cf + maxBerthedTroops)) {
                results.errors.push(EvalErrorCode.OverMarine);
            } else if ((addMarines + addDamage) > maxAdds) {
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

        if (results.mass > ship.mass) {
            results.errors.push(EvalErrorCode.OverMass);
        }

    }

    return results;
}

import Ajv from "ajv";
import schema from "./schemas/ship.json";

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

    // Test against schema
    const ajv = new Ajv.default({allErrors: true});
    const validate = ajv.compile<FullThrustShip>(schema);
    const shipObj: FullThrustShip = JSON.parse(shipJson);
    if (! validate(shipObj)) {
        results.valid = false;
        results.code = ValErrorCode.BadJSON;
        results.ajvErrors = validate.errors!;
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
            if ( (shipObj.points !== evaluation.points) || (shipObj.cpv !== evaluation.cpv) ) {
                results.valid = false;
                results.code = ValErrorCode.PointsMismatch;
            }
        }
    }

    return results;
}

