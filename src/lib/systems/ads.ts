import type { FullThrustShip } from "../../schemas/ship.js";
import { genArcs } from "../genArcs.js";
import { System } from "./_base.js";
import type { ISystem, Arc } from "./_base.js";

export class Ads extends System {
    public leftArc: Arc = "FP";
    public numArcs = 3;

    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
        if (data.hasOwnProperty("leftArc")) {
            this.leftArc = data.leftArc as Arc;
        }
        if (data.hasOwnProperty("numArcs")) {
            this.numArcs = data.numArcs as number;
        }
        if (this.numArcs < 3) {
            this.numArcs = 3;
        } else if (this.numArcs > 3) {
            this.numArcs = 6;
        }
    }

    fullName() {
        return "Area Defense System";
    }

    mass() {
        if (this.numArcs > 3) {
            return 3;
        }
        return 2;
    }

    points() {
        return this.mass() * 3;
    }

    glyph() {
        const id = `ads${this.leftArc}${this.numArcs}`;
        const defs = `<symbol id="_internalPDS" viewBox="378 178 204 204"><path d="M480,193.3c-27.8,0-52.6,13.1-68.4,33.5L480,280l68.4-53.3C532.6,206.4,507.8,193.3,480,193.3z"/><path d="M480,280l-68.4,53.3c15.9,20.4,40.6,33.5,68.4,33.5s52.6-13.1,68.4-33.5L480,280z"/></symbol>`;
        const insert = `<use href="#_internalPDS" x="50" y="50" width="500" height="500" />`;
        let svg = genArcs(this.ship.orientation, id, this.numArcs, this.leftArc, defs, insert);
        return {
            id,
            svg,
            height: 1,
            width: 1
        }
    }
}