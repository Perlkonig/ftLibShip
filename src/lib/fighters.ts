import type { FullThrustShip } from "../schemas/ship.js";

export type FighterType = NonNullable<
    FullThrustShip["fighters"]
>[number]["type"];
export type FighterSkill = "standard" | "ace" | "turkey";

const CAPACITY = 6;

/** Per-bay runtime state. Key = hangar system id. */
export type HangarOccupancy =
    | null
    | {
          type: FighterType;
          number?: number;
          skill?: FighterSkill;
      };

export type HangarState = Partial<Record<string, HangarOccupancy>>;

export interface ResolvedHangarOccupancy {
    hangarId: string;
    occupied: boolean;
    deployed: boolean;
    type?: FighterType;
    number: number;
    capacity: number;
    isPartial: boolean;
    skill: FighterSkill;
}

export class HangarDockError extends Error {
    constructor(
        message: string,
        public readonly code: "UNKNOWN_HANGAR" | "HANGAR_OCCUPIED"
    ) {
        super(message);
        this.name = "HangarDockError";
    }
}

const listHangarIds = (ship: FullThrustShip): string[] => {
    if (ship.systems === undefined) {
        return [];
    }
    return ship.systems
        .filter((s) => s.name === "hangar" && s.id !== undefined)
        .map((s) => s.id as string);
};

const isHangarId = (ship: FullThrustShip, hangarId: string): boolean =>
    listHangarIds(ship).includes(hangarId);

const designFighterForHangar = (
    ship: FullThrustShip,
    hangarId: string
): NonNullable<FullThrustShip["fighters"]>[number] | undefined =>
    ship.fighters?.find((f) => f.hangar === hangarId);

const emptyOccupancy = (
    hangarId: string
): ResolvedHangarOccupancy => ({
    hangarId,
    occupied: false,
    deployed: true,
    number: 0,
    capacity: CAPACITY,
    isPartial: false,
    skill: "standard",
});

const occupiedOccupancy = (
    hangarId: string,
    type: FighterType,
    number: number,
    skill: FighterSkill
): ResolvedHangarOccupancy => {
    const clampedNumber = Math.max(0, Math.min(CAPACITY, number));
    return {
        hangarId,
        occupied: true,
        deployed: false,
        type,
        number: clampedNumber,
        capacity: CAPACITY,
        isPartial: clampedNumber < CAPACITY,
        skill,
    };
};

export const resolveHangarOccupancy = (
    hangarId: string,
    ship: FullThrustShip,
    hangars?: HangarState
): ResolvedHangarOccupancy => {
    const overlay = hangars?.[hangarId];

    if (overlay === null) {
        return emptyOccupancy(hangarId);
    }

    if (overlay !== undefined) {
        const design = designFighterForHangar(ship, hangarId);
        const number = overlay.number ?? design?.number ?? CAPACITY;
        const skill =
            overlay.skill ??
            (design?.skill as FighterSkill | undefined) ??
            "standard";
        return occupiedOccupancy(hangarId, overlay.type, number, skill);
    }

    const design = designFighterForHangar(ship, hangarId);
    if (design === undefined || design.hangar === undefined) {
        return emptyOccupancy(hangarId);
    }

    const number = design.number ?? CAPACITY;
    const skill = (design.skill as FighterSkill | undefined) ?? "standard";
    return occupiedOccupancy(hangarId, design.type, number, skill);
};

export const dockFighterInHangar = (
    ship: FullThrustShip,
    hangars: HangarState,
    hangarId: string,
    wing: { type: FighterType; number?: number; skill?: FighterSkill }
): HangarState => {
    if (!isHangarId(ship, hangarId)) {
        throw new HangarDockError(
            `Unknown hangar: ${hangarId}`,
            "UNKNOWN_HANGAR"
        );
    }
    const current = resolveHangarOccupancy(hangarId, ship, hangars);
    if (current.occupied) {
        throw new HangarDockError(
            `Hangar already occupied: ${hangarId}`,
            "HANGAR_OCCUPIED"
        );
    }
    return {
        ...hangars,
        [hangarId]: {
            type: wing.type,
            ...(wing.number !== undefined ? { number: wing.number } : {}),
            ...(wing.skill !== undefined ? { skill: wing.skill } : {}),
        },
    };
};

export const deployFighterFromHangar = (
    hangars: HangarState,
    hangarId: string
): HangarState => ({
    ...hangars,
    [hangarId]: null,
});

export const fighterSquadrons = (
    ship: FullThrustShip,
    hangars?: HangarState
): ResolvedHangarOccupancy[] =>
    listHangarIds(ship).map((id) =>
        resolveHangarOccupancy(id, ship, hangars)
    );
