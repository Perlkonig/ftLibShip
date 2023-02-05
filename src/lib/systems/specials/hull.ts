import { SpecialSystem } from "../_base.js";
import type { FullThrustShip } from "../../../schemas/ship.js";
import { getSystem } from "../index.js";

export class Hull extends SpecialSystem {
    constructor(ship: FullThrustShip) {
        super(ship);
    }

    mass() {
        if (this.ship.hull !== undefined) {
            return this.ship.hull.points;
        }
        return NaN;
    }

    points() {
        if ( (this.ship.hull === undefined) || (this.ship.mass === undefined) ) {
            return NaN;
        }
        return (this.ship.mass + this.hull_points());
    }

    cpv() {
        let ncmass = 0;
        const ncs: string[] = ["bay", "hangar", "launchTube"];
        if (this.ship.systems !== undefined) {
            for (const s of this.ship.systems) {
                if (ncs.includes(s.name)) {
                    const obj = getSystem(s, this.ship)!;
                    ncmass += obj.mass();
                }
            }
        }
        if (this.ship.mass !== undefined) {
            const realMass = this.ship.mass - ncmass;
            let cpv = Math.round((realMass * realMass) / 100);
            if (cpv < 1) { cpv = 1; }
            cpv += this.hull_points();
            return cpv;
        }
        return NaN;
    }
    
    hull_points() {
        if (this.ship.hull.rows === 3) {
            return  this.ship.hull.points * 3;
        } else if (this.ship.hull.rows === 4) {
            return this.ship.hull.points * 2;
        } else if (this.ship.hull.rows === 5) {
            return Math.round(this.ship.hull.points * 1.5);
        } else if (this.ship.hull.rows === 6) {
            return this.ship.hull.points;
        }
        return NaN;
    }
}
