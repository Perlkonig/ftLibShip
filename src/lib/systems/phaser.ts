import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem, Arc, ArcNum } from "./_base.js";
import { genArcs } from "../genArcs.js";
import fnv from "fnv-plus";

type Class = 1|2|3|4;

export class Phaser extends System {
    public class: Class = 1;
    public leftArc: Arc = "F";
    public numArcs: ArcNum = 6;

    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
        if (data.hasOwnProperty("class")) {
            this.class = data.class as Class;
        }
        if (this.class < 1) {
            this.class = 1;
        } else if (this.class > 4) {
            this.class = 4;
        }
        if (data.hasOwnProperty("leftArc")) {
            this.leftArc = data.leftArc as Arc;
        }
        if (data.hasOwnProperty("numArcs")) {
            this.numArcs = data.numArcs as ArcNum;
        }

        if (this.class <= 2) {
            if (this.numArcs < 3) {
                this.numArcs = 3;
                data.numArcs = 3;
            } else if ( (this.numArcs > 3) && (this.numArcs < 6) ) {
                this.numArcs = 3;
            } else if (this.numArcs > 6) {
                this.numArcs = 6;
                data.numArcs = 6;
            }
        }
    }

    fullName() {
        return `Class ${this.class} Phaser`;
    }

    mass() {
        switch (this.class) {
            case 1:
                if (this.numArcs === 3) {
                    return 1;
                } else {
                    return 2;
                }
            case 2:
                if (this.numArcs === 3) {
                    return 4;
                } else {
                    return 6;
                }
            case 3:
                return 8 + (2 * (this.numArcs - 1));
            case 4:
                return 16 + (4 * (this.numArcs - 1));
        }
    }

    points() {
        let sys: any;
        if (this.ship.systems !== undefined) {
            sys = this.ship.systems.find(x => x.name === "fireControl");
        }
        if ( (sys !== undefined) && (sys.hasOwnProperty("advanced")) && (sys.advanced) ) {
            return this.mass() * 6;
        } else {
            return (this.mass() * 3) + 2;
        }
    }

    glyph() {
        let id = `phaser${this.class}${this.leftArc}${this.numArcs}`;
        if (this.ship.hashseed !== undefined) {
            fnv.seed(this.ship.hashseed);
            id = fnv.hash(id).hex();
        }
        let insert = `<rect x="162.5" y="162.5" width="275" height="275" fill="black" stroke="black" stroke-width="20" stroke-miterlimit="10" /><text x="300" y="325" stroke="white" fill="white" dominant-baseline="middle" text-anchor="middle" font-size="300">${this.class}</text>`;
        let svg = genArcs(this.ship.orientation, id, this.numArcs, this.leftArc, undefined, insert);
        return {
            id,
            svg,
            height: 2,
            width: 2
        }
    }
}