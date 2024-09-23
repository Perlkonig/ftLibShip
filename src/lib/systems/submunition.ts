import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem, Arc, ArcNum } from "./_base.js";
import { genArcs } from "../genArcs.js";
import fnv from "fnv-plus";

export class Submunition extends System {
    public leftArc: Arc = "F";
    public numArcs: ArcNum = 6;

    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
        if (data.hasOwnProperty("leftArc")) {
            this.leftArc = data.leftArc as Arc;
        }
        if (data.hasOwnProperty("numArcs")) {
            this.numArcs = data.numArcs as ArcNum;
        }
    }

    fullName() {
        return `Turreted Submunitions Pack`;
    }

    mass() {
        return 1;
    }

    points() {
        return 3;
    }

    glyph() {
        let id = `submunition${this.leftArc}${this.numArcs}`;
        if (this.ship.hashseed !== undefined) {
            fnv.seed(this.ship.hashseed);
            id = fnv.hash(id).hex();
        }
        const insert = `<use href="#_internalSubmunition" x="150" y="150" width="300" height="300"/>`;
        const defs = `<symbol id="_internalSubmunition" viewBox="279.5 92.5 400 400"><polygon stroke="#000000" stroke-miterlimit="10" points="480,329.3 636.8,94.5 323.2,94.5 480,329.3 636.8,94.5 323.2,94.5"/><circle fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" cx="480" cy="329.3" r="159"/></symbol>`;
        let svg = genArcs(this.ship.orientation, id, this.numArcs, this.leftArc, defs, insert);
        return {
            id,
            svg,
            height: 2,
            width: 2
        }
    }
}
