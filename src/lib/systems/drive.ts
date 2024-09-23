import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";
import fnv from "fnv-plus";

export class Drive extends System {
    public advanced = false;
    public thrust: number = 0;

    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
        if (data.hasOwnProperty("advanced")) {
            this.advanced = data.advanced as boolean;
        }
        if (data.hasOwnProperty("thrust")) {
            this.thrust = data.thrust as number;
        }
    }

    fullName() {
        if (this.advanced) {
            return "Main Drive - Advanced";
        }
        return "Main Drive";
    }

    mass() {
        if (this.ship.mass !== undefined && this.thrust !== undefined) {
            return Math.round(this.ship.mass * 0.05 * (this.thrust as number));
        }
        return NaN;
    }

    points() {
        let mass = this.mass();
        let points = mass * 2;
        if (this.advanced) {
            points = mass * 3;
        }
        return points;
    }

    glyph() {
        if (this.advanced) {
            const id =
                this.ship.hashseed === undefined
                    ? `driveAdv`
                    : fnv.hash(`driveAdv`).hex();
            return {
                id,
                svg: `<symbol id="${id}" viewBox="245 45 470 470"><polygon fill="white" stroke="#000000" stroke-width="14" stroke-miterlimit="10" points="706.8,390.2 480,500.4 253.2,390.2 253.2,169.8 480,59.6 706.8,169.8"/><text x="480" y="320" dominant-baseline="middle" text-anchor="middle" font-size="400">${this.thrust}</text></symbol>`,
                height: 1,
                width: 1,
            };
        } else {
            const id =
                this.ship.hashseed === undefined
                    ? `drive`
                    : fnv.hash(`drive`).hex();
            return {
                id,
                svg: `<symbol id="${id}" viewBox="164 -35.5 629 629"><polygon fill="white" stroke="#000000" stroke-width="26" stroke-miterlimit="10" points="779,526 180,526 180,215.8 479.5,34 779,215.8"/><text x="479.5" y="343.52" dominant-baseline="middle" text-anchor="middle" font-size="400">${this.thrust}</text></symbol>`,
                height: 1,
                width: 1,
            };
        }
    }
}
