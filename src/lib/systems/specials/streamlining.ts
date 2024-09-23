import type { FullThrustShip } from "../../../schemas/ship.js";
import { SpecialSystem } from "../_base.js";

export class Streamlining extends SpecialSystem {
    constructor(ship: FullThrustShip) {
        super(ship);
    }

    mass() {
        if (this.ship.hull !== undefined && this.ship.mass !== undefined) {
            if (this.ship.hull.streamlining === "full") {
                return Math.round(this.ship.mass * 0.1);
            } else if (this.ship.hull.streamlining === "partial") {
                return Math.round(this.ship.mass * 0.05);
            } else {
                return 0;
            }
        }
        return NaN;
    }

    points() {
        return 0;
    }
}
