import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";
import { genArcs } from "../genArcs.js";
import fnv from "fnv-plus";

// Need to include "A" so it works in beta orientation
type Arc = "F"|"FS"|"FP"|"A"|"AS"|"AP";

export class RocketPod extends System {
    public leftArc: Arc = "FP";
    public numArcs = 3;

    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
        if (data.hasOwnProperty("leftArc")) {
            this.leftArc = data.leftArc as Arc;
        }
    }

    fullName() {
        return "Rocket Pod";
    }

    mass() {
        return 1;
    }

    points() {
        return 3;
    }

    glyph() {
        let id = `rocketPod${this.leftArc}${this.numArcs}`;
        if (this.ship.hashseed !== undefined) {
            fnv.seed(this.ship.hashseed);
            id = fnv.hash(id).hex();
        }
        const insert = `<use href="#_internalRocket" width="350" height="350" x="125" y="115" />`;
        const defs = `<symbol id="_internalRocket" viewBox="260 39.5 440 440"><polygon stroke="#000000" stroke-width="4.6996" stroke-miterlimit="10" points="398,364.9 348.9,311 348.9,224.9 331.6,205.6  314.2,224.9 314.2,311 265.1,364.9 320.2,364.9 320.2,397.5 342.9,397.5 342.9,364.9"/><polygon stroke="#000000" stroke-width="4.6996" stroke-miterlimit="10" points="562,364.9 611.1,311 611.1,224.9 628.4,205.6  645.8,224.9 645.8,311 694.9,364.9 639.8,364.9 639.8,397.5 617.1,397.5 617.1,364.9"/><polygon stroke="#000000" stroke-width="4.6996" stroke-miterlimit="10" points="546.4,282.2 497.4,228.3 497.4,142.3 480,123 462.6,142.3 462.6,228.3 413.6,282.2 468.6,282.2 468.6,314.8 491.4,314.8 491.4,282.2"/></symbol>`;
        let svg = genArcs(this.ship.orientation, id, this.numArcs, this.leftArc, defs, insert);
        return {
            id,
            svg,
            height: 2,
            width: 2
        }
    }
}