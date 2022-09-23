import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";

export class Reflex extends System {
    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
    }

    fullName() {
        return "Reflex Field (deprecated)";
    }

    mass() {
        if (this.ship.mass !== undefined) {
            return Math.round(this.ship.mass * 0.1);
        }
        return NaN;
    }

    points() {
        return this.mass() * 6;
    }

    glyph() {
        return {
            id: "reflex",
            svg: `<symbol id="svg_reflex" viewBox="265 65 430 430"><circle fill="white" stroke="#000000" stroke-width="17.4803" stroke-miterlimit="10" cx="480" cy="280" r="201.4"/><circle fill="white" stroke="#000000" stroke-width="17.4803" stroke-miterlimit="10" cx="480" cy="280" r="150.7"/><circle stroke="#000000" stroke-width="17.4803" stroke-miterlimit="10" cx="480" cy="280" r="104.3"/></symbol>`,
            height: 1,
            width: 1
        }
    }
}