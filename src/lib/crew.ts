import type { FullThrustShip } from "../schemas/ship.js";
import { formRows } from "./hull.js";

export const crewFactor = (ship: FullThrustShip): number => {
    if (ship.mass === undefined) {
        return 1;
    }
    if (ship.civilian !== undefined && ship.civilian) {
        return Math.ceil(ship.mass / 50);
    }
    return Math.ceil(ship.mass / 20);
};

export const applyHullDamage = (
    hullRows: number[][],
    damage: number | undefined
): void => {
    if (damage === undefined) {
        return;
    }
    let applied = damage;
    for (let row = 0; row < hullRows.length; row++) {
        for (let col = 0; col < hullRows[row].length; col++) {
            if (applied > 0) {
                hullRows[row][col] = 2;
                applied--;
            }
        }
    }
};

/** Mark surviving crew-star cells absent from the end of the hull damage track. */
export const applyDeployedBuiltinDcp = (
    hullRows: number[][],
    count: number | undefined
): void => {
    if (count === undefined || count <= 0) {
        return;
    }
    const positions: [number, number][] = [];
    for (let row = 0; row < hullRows.length; row++) {
        for (let col = 0; col < hullRows[row].length; col++) {
            if (hullRows[row][col] === 1) {
                positions.push([row, col]);
            }
        }
    }
    let remaining = count;
    for (let i = positions.length - 1; i >= 0 && remaining > 0; i--) {
        const [r, c] = positions[i];
        hullRows[r][c] = 3;
        remaining--;
    }
};

/**
 * Hull grid after threshold damage (from track start) and absent built-in DCP
 * (from track end). Cell values: 0 hull, 1 present DCP star, 2 damaged, 3 absent DCP.
 */
export const hullDcpGrid = (
    ship: FullThrustShip,
    state: Pick<IDcpState, "damage" | "deployedBuiltinDcp"> = {}
): number[][] | undefined => {
    const rows = formRows(ship);
    if (rows === undefined) {
        return undefined;
    }
    const grid = rows.map((row) => [...row]);
    applyHullDamage(grid, state.damage);
    applyDeployedBuiltinDcp(grid, state.deployedBuiltinDcp);
    return grid;
};

/**
 * Render/game-time state compatible with
 * `Pick<RenderOpts, "damage" | "disabled" | "destroyed" | "deployed" | "deployedBuiltinDcp">`.
 *
 * `deployed` / `deployedBuiltinDcp`: friendly parties absent (sent to board other ships).
 * `invaders` is not part of this interface — enemy aboard does not affect DCP counts.
 *
 * For hired `damageControl` and `marines`, `disabled` and `destroyed` are equivalent:
 * instantly lost and cannot be repaired.
 */
export interface IDcpState {
    damage?: number;
    disabled?: string[];
    destroyed?: string[];
    /** Absent hired damageControl system ids (marines ids grey on SSD but do not affect DCP count) */
    deployed?: string[];
    /** Absent built-in DCP count */
    deployedBuiltinDcp?: number;
}

export interface IDcpAvailability {
    crewFactor: number;
    builtin: number;
    builtinDeployed: number;
    hired: number;
    hiredAvailable: number;
    hiredDeployed: number;
    available: number;
}

const lostSystemIds = (state: IDcpState | undefined): Set<string> => {
    const lost = new Set<string>();
    if (state?.disabled !== undefined) {
        for (const id of state.disabled) {
            lost.add(id);
        }
    }
    if (state?.destroyed !== undefined) {
        for (const id of state.destroyed) {
            lost.add(id);
        }
    }
    return lost;
};

const deployedSystemIds = (state: IDcpState | undefined): Set<string> => {
    const deployed = new Set<string>();
    if (state?.deployed !== undefined) {
        for (const id of state.deployed) {
            deployed.add(id);
        }
    }
    return deployed;
};

/**
 * Available damage control parties on the ship at render time.
 *
 * Builtin DCP come from crew-factor hull stars surviving hull damage and absence.
 * Hired DCP are `damageControl` systems minus lost or absent (`deployed`) parties.
 * Enemy parties in `invaders` are not modelled here.
 */
export const dcpAvailability = (
    ship: FullThrustShip,
    state: IDcpState = {}
): IDcpAvailability => {
    const cf = crewFactor(ship);
    const grid = hullDcpGrid(ship, state);
    let builtin = cf;
    let builtinDeployed = 0;
    if (grid !== undefined) {
        builtin = 0;
        builtinDeployed = 0;
        for (const row of grid) {
            for (const cell of row) {
                if (cell === 1) {
                    builtin++;
                } else if (cell === 3) {
                    builtinDeployed++;
                }
            }
        }
    }

    const hiredSystems =
        ship.systems?.filter((s) => s.name === "damageControl") ?? [];
    const hired = hiredSystems.length;
    const lost = lostSystemIds(state);
    const absent = deployedSystemIds(state);
    let hiredAvailable = 0;
    let hiredDeployed = 0;
    for (const s of hiredSystems) {
        const id = s.id as string | undefined;
        if (id !== undefined && absent.has(id)) {
            hiredDeployed++;
        } else if (id === undefined || !lost.has(id)) {
            hiredAvailable++;
        }
    }

    return {
        crewFactor: cf,
        builtin,
        builtinDeployed,
        hired,
        hiredAvailable,
        hiredDeployed,
        available: builtin + hiredAvailable,
    };
};
