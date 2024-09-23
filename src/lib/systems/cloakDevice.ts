import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";
import fnv from "fnv-plus";

export class CloakDevice extends System {
    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
    }

    fullName() {
        return "Cloaking Device";
    }

    mass() {
        return 1;
    }

    points() {
        if (this.ship.mass !== undefined) {
            return Math.round(this.ship.mass / 2);
        }
        return NaN;
    }

    glyph() {
        let id = "cloakDevice";
        if (this.ship.hashseed !== undefined) {
            fnv.seed(this.ship.hashseed);
            id = fnv.hash(id).hex();
        }
        return {
            id,
            svg: `<symbol id="${id}" viewBox="267 67 425 425"><circle fill="white" stroke="#000000" stroke-width="7" stroke-miterlimit="10" cx="480" cy="280" r="205.5"/><path d="M480,485.5c113.5,0,205.5-92,205.5-205.5S593.5,74.5,480,74.5"/></symbol>`,
            height: 2,
            width: 2
        }
    }
}