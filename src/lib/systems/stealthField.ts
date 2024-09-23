import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";
import fnv from "fnv-plus";

export class StealthField extends System {
    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
    }

    fullName() {
        return "Stealth Field Generator";
    }

    mass() {
        if (this.ship.mass !== undefined) {
            return Math.round(this.ship.mass * 0.05);
        } else {
            return NaN;
        }
    }

    points() {
        return this.mass() * 6;
    }

    glyph() {
        const id = this.ship.hashseed === undefined ? `stealthField` : fnv.hash(`stealthField`).hex();
        return {
            id,
            svg: `<symbol id="${id}" viewBox="265 56 430 430"><g><path d="M507.6,228.9c-15.3-15.3-40-15.3-55.2,0l-94.7,94.7c-15.3,15.3-15.3,40,0,55.2l94.7,94.7c15.3,15.3,40,15.3,55.2,0 l94.7-94.7c15.3-15.3,15.3-40,0-55.2L507.6,228.9z"/><path fill="none" stroke="#000000" stroke-width="33.4736" stroke-miterlimit="10" d="M386.1,189.2c0,0,31.6-46.5,93.9-46.5 s93.9,46.5,93.9,46.5"/><path fill="none" stroke="#000000" stroke-width="33.4736" stroke-miterlimit="10" d="M349.8,127.8c0,0,43.7-52.7,130.2-52.7 s130.2,52.7,130.2,52.7"/></g></symbol>`,
            height: 1,
            width: 1
        };
    }
}