import type { FullThrustShip } from "../../schemas/ship.js";
import type { ResolvedRackOccupancy } from "../gunboats.js";
import { resolveRackOccupancy } from "../gunboats.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";
import { gunboatSquadronInsertSvg } from "./gunboats.js";
import fnv from "fnv-plus";

const BAY_FRAME = `<rect x="329.4" y="21" fill="white" stroke="#000000" stroke-width="6.282" stroke-miterlimit="10" width="301.2" height="518.1"/>`;
const GUN_LABEL = `<text x="480" y="88" dominant-baseline="middle" text-anchor="middle" font-size="112" font-family="Roboto" font-weight="bold">Gun</text>`;

export class GunboatRack extends System {
    public id!: string;
    public occupancy?: ResolvedRackOccupancy;

    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
        if (data.hasOwnProperty("id")) {
            this.id = data.id as string;
        }
    }

    fullName() {
        return "Gunboat Rack";
    }

    mass() {
        return 18;
    }

    points() {
        return 0;
    }

    cpv() {
        return 0;
    }

    glyph() {
        const occ =
            this.occupancy ??
            resolveRackOccupancy(this.id, this.ship);

        let insert = "";
        let id = "gunboatRack";
        if (occ.occupied && occ.boats.length > 0) {
            id += "_occupied";
            const types = occ.boats.map((b) => b.type);
            id += `_${types.join("_")}`;
            insert = gunboatSquadronInsertSvg(types);
        } else {
            id += "_empty";
        }

        if (this.ship.hashseed !== undefined) {
            fnv.seed(this.ship.hashseed);
            id = fnv.hash(id).hex();
        }

        const svg = `<symbol id="${id}" viewBox="305 17 350 525">${BAY_FRAME}${GUN_LABEL}${insert}</symbol>`;
        return {
            id,
            svg,
            height: 3,
            width: 2,
        };
    }
}
