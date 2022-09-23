import type { FullThrustShip } from "../../../schemas/ship.js";
import { SpecialSystem } from "../_base.js";

export class Stealth extends SpecialSystem {
    constructor(ship: FullThrustShip) {
        super(ship);
    }

    mass() {
        return 0;
    }

    points() {
        if ( (this.ship.armour !== undefined) && (this.ship.hull !== undefined) ) {
            const armourBoxes = this.ship.armour.reduce((acc, curr) => {return acc + curr[0] + curr[1]}, 0);
            const allBoxes = armourBoxes + this.ship.hull.points;
            if (this.ship.hull.stealth === "1") {
                return allBoxes * 2;
            } else if (this.ship.hull.stealth === "2") {
                return allBoxes * 4;
            }
            return 0;
        }
        return NaN;
    }
}