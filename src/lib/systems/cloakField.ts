import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";
import fnv from "fnv-plus";

export class CloakField extends System {
    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
    }

    fullName() {
        return "Cloaking Field";
    }

    mass() {
        return 1;
    }

    points() {
        if (this.ship.mass !== undefined) {
            return Math.round(this.ship.mass);
        }
        return NaN;
    }

    glyph() {
        let id = "cloakField";
        if (this.ship.hashseed !== undefined) {
            fnv.seed(this.ship.hashseed);
            id = fnv.hash(id).hex();
        }
        return {
            id,
            svg: `<symbol id="${id}" viewBox="245 45 470 470"><circle fill="white" stroke="#000000" stroke-width="3.8827" stroke-miterlimit="10" cx="480" cy="190" r="114"/><path d="M480,304c62.9,0,114-51,114-114s-51-114-114-114"/><path fill="none" stroke="#000000" stroke-width="10" stroke-miterlimit="10" d="M635.1,69.2c0-9.9-8.1-18-18-18H342.9c-9.9,0-18,8.1-18,18V491c0,9.9,8.1,18,18,18h274.2c9.9,0,18-8.1,18-18V69.2z"/><rect x="362.9" y="358.1" fill="white" stroke="#000000" stroke-width="6" stroke-miterlimit="10" width="94.2" height="94.2"/><rect x="503" y="358.1" fill="white" stroke="#000000" stroke-width="6" stroke-miterlimit="10" width="94.2" height="94.2"/></symbol>`,
            height: 2,
            width: 2
        }
    }
}