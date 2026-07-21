import type { FullThrustShip } from "../schemas/ship.js";
import type { GunboatSquadronDesign, GunboatType } from "./systems/gunboats.js";

export type { GunboatType };

export interface ResolvedBoat {
    type: GunboatType;
    id?: string;
}

/** Per-rack runtime state. Key = gunboatRack system id. */
export type GunboatRackOccupancy =
    | null
    | {
          squadron?: string;
          boats?: ResolvedBoat[];
          endurance?: number;
      };

export type GunboatRackState = Partial<Record<string, GunboatRackOccupancy>>;

/** Per-boat-bay runtime state. Key = bay system id. */
export type BoatBayOccupancy =
    | null
    | {
          squadron: string;
          boats?: ResolvedBoat[];
          endurance?: number;
      };

export type BoatBayState = Partial<Record<string, BoatBayOccupancy>>;

export interface ResolvedRackOccupancy {
    rackId: string;
    occupied: boolean;
    deployed: boolean;
    squadronKey?: string;
    boats: ResolvedBoat[];
    protection?: "heavy" | "screened";
    ecm: number;
    ftl: boolean;
    endurance: number;
}

export interface ResolvedBoatBayOccupancy {
    bayId: string;
    occupied: boolean;
    squadronKey?: string;
    boats: ResolvedBoat[];
    protection?: "heavy" | "screened";
    ecm: number;
    ftl: boolean;
    endurance: number;
}

export class GunboatRackError extends Error {
    constructor(
        message: string,
        public readonly code:
            | "UNKNOWN_RACK"
            | "RACK_OCCUPIED"
            | "UNKNOWN_SQUADRON"
            | "UNKNOWN_BAY"
            | "BAY_OCCUPIED"
    ) {
        super(message);
        this.name = "GunboatRackError";
    }
}

const listRackIds = (ship: FullThrustShip): string[] => {
    if (ship.systems === undefined) {
        return [];
    }
    return ship.systems
        .filter((s) => s.name === "gunboatRack" && s.id !== undefined)
        .map((s) => s.id as string);
};

const listBoatBayIds = (ship: FullThrustShip): string[] => {
    if (ship.systems === undefined) {
        return [];
    }
    return ship.systems
        .filter(
            (s) =>
                s.name === "bay" &&
                (s.type === "boat" || s.type === "tender") &&
                s.id !== undefined
        )
        .map((s) => s.id as string);
};

const isRackId = (ship: FullThrustShip, rackId: string): boolean =>
    listRackIds(ship).includes(rackId);

const isBoatBayId = (ship: FullThrustShip, bayId: string): boolean =>
    listBoatBayIds(ship).includes(bayId);

export const squadronKey = (squadron: GunboatSquadronDesign): string | undefined =>
    squadron.rack ?? squadron.id;

export const findSquadronByKey = (
    ship: FullThrustShip,
    key: string
): GunboatSquadronDesign | undefined =>
    ship.gunboatSquadrons?.find((s) => squadronKey(s) === key);

const designSquadronForRack = (
    ship: FullThrustShip,
    rackId: string
): GunboatSquadronDesign | undefined =>
    ship.gunboatSquadrons?.find((s) => s.rack === rackId);

const boatsFromDesign = (squadron: GunboatSquadronDesign): ResolvedBoat[] =>
    squadron.boats.map((b) => ({
        type: b.type,
        ...(b.id !== undefined ? { id: b.id } : {}),
    }));

const mergeBoats = (
    design: ResolvedBoat[],
    override?: ResolvedBoat[]
): ResolvedBoat[] => (override !== undefined ? override : design);

const resolveEndurance = (
    squadron: GunboatSquadronDesign,
    override?: number
): number => {
    const raw = override ?? squadron.endurance ?? 6;
    return Math.max(0, Math.min(6, raw));
};

const squadronMeta = (
    squadron: GunboatSquadronDesign,
    enduranceOverride?: number
) => ({
    protection: squadron.protection,
    ecm: squadron.ecm ?? 0,
    ftl: squadron.mods?.includes("ftl") ?? false,
    endurance: resolveEndurance(squadron, enduranceOverride),
});

const emptyRack = (rackId: string): ResolvedRackOccupancy => ({
    rackId,
    occupied: false,
    deployed: true,
    boats: [],
    ecm: 0,
    ftl: false,
    endurance: 0,
});

const occupiedRack = (
    rackId: string,
    squadronKey: string,
    squadron: GunboatSquadronDesign,
    boats: ResolvedBoat[],
    enduranceOverride?: number
): ResolvedRackOccupancy => ({
    rackId,
    occupied: true,
    deployed: false,
    squadronKey,
    boats,
    ...squadronMeta(squadron, enduranceOverride),
});

export const resolveRackOccupancy = (
    rackId: string,
    ship: FullThrustShip,
    gunboatRacks?: GunboatRackState
): ResolvedRackOccupancy => {
    const overlay = gunboatRacks?.[rackId];
    const homeSquadron = designSquadronForRack(ship, rackId);

    if (overlay === null) {
        return emptyRack(rackId);
    }

    if (overlay !== undefined) {
        const key =
            overlay.squadron ??
            homeSquadron?.rack ??
            homeSquadron?.id;
        if (key === undefined) {
            return emptyRack(rackId);
        }
        const squadron = findSquadronByKey(ship, key);
        if (squadron === undefined) {
            return emptyRack(rackId);
        }
        const designBoats = boatsFromDesign(squadron);
        return occupiedRack(
            rackId,
            key,
            squadron,
            mergeBoats(designBoats, overlay.boats),
            overlay.endurance
        );
    }

    if (homeSquadron === undefined) {
        return emptyRack(rackId);
    }

    const key = squadronKey(homeSquadron);
    if (key === undefined) {
        return emptyRack(rackId);
    }
    return occupiedRack(
        rackId,
        key,
        homeSquadron,
        boatsFromDesign(homeSquadron)
    );
};

export const deploySquadronFromRack = (
    gunboatRacks: GunboatRackState,
    rackId: string
): GunboatRackState => ({
    ...gunboatRacks,
    [rackId]: null,
});

export const recoverSquadronOnRack = (
    ship: FullThrustShip,
    gunboatRacks: GunboatRackState,
    rackId: string,
    squadronKey: string,
    boats?: ResolvedBoat[]
): GunboatRackState => {
    if (!isRackId(ship, rackId)) {
        throw new GunboatRackError(`Unknown rack: ${rackId}`, "UNKNOWN_RACK");
    }
    if (findSquadronByKey(ship, squadronKey) === undefined) {
        throw new GunboatRackError(
            `Unknown squadron: ${squadronKey}`,
            "UNKNOWN_SQUADRON"
        );
    }
    const current = resolveRackOccupancy(rackId, ship, gunboatRacks);
    if (current.occupied) {
        throw new GunboatRackError(
            `Rack already occupied: ${rackId}`,
            "RACK_OCCUPIED"
        );
    }
    return {
        ...gunboatRacks,
        [rackId]: {
            squadron: squadronKey,
            ...(boats !== undefined ? { boats } : {}),
        },
    };
};

export const gunboatSquadronsOnRacks = (
    ship: FullThrustShip,
    gunboatRacks?: GunboatRackState
): ResolvedRackOccupancy[] =>
    listRackIds(ship).map((id) =>
        resolveRackOccupancy(id, ship, gunboatRacks)
    );

export const resolveBoatBayOccupancy = (
    bayId: string,
    ship: FullThrustShip,
    boatBays?: BoatBayState
): ResolvedBoatBayOccupancy => {
    const empty: ResolvedBoatBayOccupancy = {
        bayId,
        occupied: false,
        boats: [],
        ecm: 0,
        ftl: false,
        endurance: 0,
    };

    const overlay = boatBays?.[bayId];
    if (overlay === undefined || overlay === null) {
        return empty;
    }

    const squadron = findSquadronByKey(ship, overlay.squadron);
    if (squadron === undefined) {
        return empty;
    }

    const designBoats = boatsFromDesign(squadron);
    return {
        bayId,
        occupied: true,
        squadronKey: overlay.squadron,
        boats: mergeBoats(designBoats, overlay.boats),
        ...squadronMeta(squadron, overlay.endurance),
    };
};

export const recoverSquadronInBoatBay = (
    ship: FullThrustShip,
    boatBays: BoatBayState,
    bayId: string,
    squadronKey: string,
    boats?: ResolvedBoat[]
): BoatBayState => {
    if (!isBoatBayId(ship, bayId)) {
        throw new GunboatRackError(`Unknown boat bay: ${bayId}`, "UNKNOWN_BAY");
    }
    if (findSquadronByKey(ship, squadronKey) === undefined) {
        throw new GunboatRackError(
            `Unknown squadron: ${squadronKey}`,
            "UNKNOWN_SQUADRON"
        );
    }
    const current = resolveBoatBayOccupancy(bayId, ship, boatBays);
    if (current.occupied) {
        throw new GunboatRackError(
            `Boat bay already occupied: ${bayId}`,
            "BAY_OCCUPIED"
        );
    }
    return {
        ...boatBays,
        [bayId]: {
            squadron: squadronKey,
            ...(boats !== undefined ? { boats } : {}),
        },
    };
};

export const clearBoatBay = (
    boatBays: BoatBayState,
    bayId: string
): BoatBayState => ({
    ...boatBays,
    [bayId]: null,
});

export const gunboatsInBoatBays = (
    ship: FullThrustShip,
    boatBays?: BoatBayState
): ResolvedBoatBayOccupancy[] =>
    listBoatBayIds(ship).map((id) =>
        resolveBoatBayOccupancy(id, ship, boatBays)
    );
