import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";

export class Shroud extends System {
    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
    }

    fullName() {
        return "Vapour Shroud";
    }

    mass() {
        if ( (this.ship.hasOwnProperty("mass")) && (this.ship.mass !== undefined) ) {
            return Math.round(this.ship.mass * 0.05);
        }
        return NaN;
    }

    points() {
        return this.mass() * 3;
    }

    glyph() {
        return {
            id: "shroud",
            svg: `<symbol id="svg_shroud" viewBox="230 30 500 500"><g><circle cx="480" cy="280" r="131.8"/><circle cx="480" cy="480.5" r="38.6"/><circle cx="580.2" cy="453.6" r="38.6"/><circle cx="653.6" cy="380.2" r="38.6"/><circle cx="680.5" cy="280" r="38.6"/><circle cx="653.6" cy="179.8" r="38.6"/><circle cx="580.2" cy="106.4" r="38.6"/><circle cx="480" cy="79.5" r="38.6"/><circle cx="379.8" cy="106.4" r="38.6"/><circle cx="306.4" cy="179.8" r="38.6"/><circle cx="279.5" cy="280" r="38.6"/><circle cx="306.4" cy="380.2" r="38.6"/><circle cx="379.8" cy="453.6" r="38.6"/></g></symbol>
            `,
            height: 2,
            width: 2
        }
    }
}