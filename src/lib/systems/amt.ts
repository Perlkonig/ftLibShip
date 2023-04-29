import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";
import { genArcs } from "../genArcs.js";

// Need to include "A" so it works in beta orientation
type Arc = "F"|"FS"|"FP"|"A"|"AS"|"AP";

export class Amt extends System {
    public leftArc: Arc = "FP";
    public numArcs = 3;

    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
        if (data.hasOwnProperty("leftArc")) {
            this.leftArc = data.leftArc as Arc;
        } else {
            data.leftArc = "FP";
        }
        data.numArcs = 3;
    }

    fullName() {
        return "Antimatter Missile";
    }

    mass() {
        return 2;
    }

    points() {
        return 10;
    }

    glyph() {
        const id = `amt${this.leftArc}${this.numArcs}`;
        const defid = "_internalAMT";
        const defs = `<symbol id="${defid}" viewBox="61 130 298 298"><g><polygon fill="white" stroke="#000000" stroke-width="8" stroke-miterlimit="10" points="239,169.4 210,137.2 181,169.4 181,423 239,423"/><polygon stroke="#000000" stroke-width="8" stroke-miterlimit="10" points="181,218.4 181,267 138.3,267"/><polygon stroke="#000000" stroke-width="8" stroke-miterlimit="10" points="181,313 181,403 99.1,403"/><polygon stroke="#000000" stroke-width="8" stroke-miterlimit="10" points="239,218.4 239,267 281.7,267"/><polygon stroke="#000000" stroke-width="8" stroke-miterlimit="10" points="239,313 239,403 320.9,403"/></g></symbol>`;
        const insert = `<use href="#${defid}" width="350" height="350" x="125" y="115" />`;
        let svg = genArcs(this.ship.orientation, id, this.numArcs, this.leftArc, defs, insert);
        return {
            id,
            svg,
            height: 2,
            width: 2
        }
    }
}