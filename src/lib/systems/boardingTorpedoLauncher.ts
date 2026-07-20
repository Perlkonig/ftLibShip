import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem, Arc, ArcNum } from "./_base.js";
import { genArcs } from "../genArcs.js";
import fnv from "fnv-plus";

export class BoardingTorpedoLauncher extends System {
    public leftArc: Arc = "F";
    public numArcs: ArcNum = 3;
    public magazine: string | undefined;

    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
        if (data.hasOwnProperty("leftArc")) {
            this.leftArc = data.leftArc as Arc;
        }
        if (data.hasOwnProperty("numArcs")) {
            this.numArcs = data.numArcs as ArcNum;
        }
        if (data.hasOwnProperty("magazine")) {
            this.magazine = data.magazine as string;
        }

        if (this.numArcs !== 3) {
            this.numArcs = 3;
            data.numArcs = 3;
        }
    }

    fullName() {
        return "Boarding Torpedo Launcher";
    }

    mass() {
        return 2;
    }

    points() {
        return 6;
    }

    glyph() {
        let id = `btl${this.leftArc}${this.numArcs}`;
        if (this.ship.hashseed !== undefined) {
            fnv.seed(this.ship.hashseed);
            id = fnv.hash(id).hex();
        }
        const insert = `<text x="300" y="325" dominant-baseline="middle" text-anchor="middle" font-size="200" stroke="black" fill="black">BT</text>`;
        const svg = genArcs(
            this.ship.orientation,
            id,
            this.numArcs,
            this.leftArc,
            "",
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
