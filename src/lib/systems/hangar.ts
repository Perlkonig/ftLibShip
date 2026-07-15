import type { FullThrustShip } from "../../schemas/ship.js";
import type { ResolvedHangarOccupancy } from "../fighters.js";
import { resolveHangarOccupancy } from "../fighters.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";
import { fighterInsertSvg } from "./fighters.js";
import fnv from "fnv-plus";

export class Hangar extends System {
    public id!: string;
    public isRack = false;
    public critRules = false;
    public occupancy?: ResolvedHangarOccupancy;

    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
        if (data.hasOwnProperty("id")) {
            this.id = data.id as string;
        }
        if (data.hasOwnProperty("isRack")) {
            this.isRack = data.isRack as boolean;
        }
        if (data.hasOwnProperty("critRules")) {
            this.critRules = data.critRules as boolean;
        }
    }

    fullName() {
        if (this.isRack) {
            return "Fighter Rack";
        } else {
            return "Hangar Bay";
        }
    }

    mass() {
        if (this.isRack) {
            return 6;
        } else {
            if (this.ship.systems !== undefined) {
                const idx = this.ship.systems.findIndex(
                    (x) => x.name === "launchTube"
                );
                if (idx !== -1) {
                    return 6;
                } else {
                    return 9;
                }
            }
            return NaN;
        }
    }

    points() {
        if (this.isRack) {
            return this.mass() * 3;
        } else {
            if (this.critRules) {
                return this.mass() * 2;
            } else {
                return this.mass() * 3;
            }
        }
    }

    cpv() {
        return this.mass();
    }

    glyph() {
        const occ =
            this.occupancy ??
            resolveHangarOccupancy(this.id, this.ship);

        let insert = "";
        let mod = "";
        let rack = "";
        if (this.isRack) {
            mod = "Rack";
            rack = `<rect x="328.8" y="47" fill="white" stroke="#000000" stroke-width="12.7331" stroke-miterlimit="10" width="302.4" height="456"/>`;
        }

        let id = `hangar${mod}`;
        if (occ.occupied && occ.type !== undefined) {
            id += `_${occ.type}`;
            if (occ.isPartial) {
                id += `_partial${occ.number}`;
            }
            if (occ.skill !== "standard") {
                id += `_${occ.skill}`;
            }

            insert = fighterInsertSvg(occ.type);
            if (occ.isPartial) {
                insert = `<g opacity="0.45">${insert}</g><text x="400" y="490" dominant-baseline="auto" text-anchor="middle" font-size="18">${occ.number}</text>`;
            }
            if (occ.skill === "ace") {
                insert += `<text x="360" y="120" dominant-baseline="middle" text-anchor="middle" font-size="22" font-family="Roboto">A</text>`;
            } else if (occ.skill === "turkey") {
                insert += `<text x="360" y="120" dominant-baseline="middle" text-anchor="middle" font-size="22" font-family="Roboto">T</text>`;
            }
        } else {
            id += "_empty";
        }

        if (this.ship.hashseed !== undefined) {
            fnv.seed(this.ship.hashseed);
            id = fnv.hash(id).hex();
        }

        const svg = `<symbol id="${id}" viewBox="320 35.75 319 478.5">${rack}<polygon fill="white" stroke="#000000" stroke-width="12.221" stroke-miterlimit="10" points="480,63.6 553.4,280 626.8,496.4 480,496.4 333.2,496.4 406.6,280"/>${insert}</symbol>`;
        return {
            id,
            svg,
            height: 3,
            width: 2,
        };
    }
}
