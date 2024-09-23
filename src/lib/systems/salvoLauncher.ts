import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";
import { genArcs } from "../genArcs.js";
import fnv from "fnv-plus";

export class SalvoLauncher extends System {
    public leftArc: "F" | "FP" | "AP" = "FP";
    public numArcs = 3;
    public magazine: string | undefined;

    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
        if (data.hasOwnProperty("leftArc")) {
            this.leftArc = data.leftArc as "F" | "FP" | "AP";
        }
        if (data.hasOwnProperty("magazine")) {
            this.magazine = data.magazine as string;
        }
    }

    fullName() {
        return "Salvo Missile Launcher";
    }

    mass() {
        return 3;
    }

    points() {
        return 9;
    }

    glyph() {
        let id = `sml${this.leftArc}${this.numArcs}`;
        if (this.ship.hashseed !== undefined) {
            fnv.seed(this.ship.hashseed);
            id = fnv.hash(id).hex();
        }
        const insert = `<use href="#_internalBlackChevron" width="350" height="350" x="125" y="115" />`;
        const defs = `<symbol id="_internalBlackChevron" viewBox="102 88.5 88.5 88.5"><polygon stroke="#000000" stroke-width="4.1006" stroke-miterlimit="10" points="146.2,96.4 167.5,172.2 146.2,158.9 124.9,172.2"/></symbol>`;
        let svg = genArcs(
            this.ship.orientation,
            id,
            this.numArcs,
            this.leftArc,
            defs,
            insert
        );
        return {
            id,
            svg,
            height: 2,
            width: 2,
        };
    }
}
