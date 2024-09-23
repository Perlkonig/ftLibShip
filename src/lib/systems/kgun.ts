import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem, Arc, ArcNum } from "./_base.js";
import { genHex } from "../genHex.js";
import fnv from "fnv-plus";

type Class = number;

export class Kgun extends System {
    public class: Class = 1;
    public leftArc: Arc = "F";
    public numArcs: ArcNum = 1;
    public modifier: "none" | "short" | "long" = "none";

    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
        if (data.hasOwnProperty("modifier")) {
            this.modifier = data.modifier as "none" | "short" | "long";
        }

        if (data.hasOwnProperty("class")) {
            this.class = data.class as Class;
        }
        if (this.class < 1) {
            this.class = 1;
            data.class = 1;
        // } else if (this.class > 6) {
        //     this.class = 6;
        //     data.class = 6;
        }

        if (data.hasOwnProperty("leftArc")) {
            this.leftArc = data.leftArc as Arc;
        }
        if (data.hasOwnProperty("numArcs")) {
            this.numArcs = data.numArcs as ArcNum;
        }

        // validate arcs
        switch (this.class) {
            case 1:
                this.numArcs = 6;
                data.numArcs = 6;
                break;
            case 2:
                if (this.numArcs > 2) {
                    this.numArcs = 2;
                    data.numArcs = 2;
                }
                break;
            default:
                this.numArcs = 1;
                data.numArcs = 1;
                break;
        }
    }

    fullName() {
        return `Class ${this.class} ${this.modifier === "short" ? "Short-Range " : ""}${this.modifier === "long" ? "Long-Range " : ""}K-Gun`;
    }

    mass() {
        let base: number;
        switch (this.class) {
            case 1:
                base = 2;
                break;
            case 2:
                base = 3 + (this.numArcs - 1);
                break;
            default:
                base = 5 + (3 * (this.class - 3));
                break;
        }

        if (this.modifier === "short") {
            switch (this.class) {
                case 1:
                    return 1.5;
                default:
                    return Math.ceil(base / 2);
            }
        } else if (this.modifier === "long") {
            return base * 2;
        } else {
            return base;
        }
    }

    points() {
        return this.mass() * 4;
    }

    glyph() {
        let mod = "";
        let insert = `<text x="300" y="325" dominant-baseline="middle" text-anchor="middle" font-size="300" stroke="black" fill="black">${this.class}</text>`;
        if (this.modifier === "long") {
            mod = "L";
            insert = `<text x="300" y="325" dominant-baseline="middle" text-anchor="middle" font-size="300" stroke="white" fill="white">${this.class}</text>`;
        } else if (this.modifier === "short") {
            mod = "S";
            insert = `<line x1="300" y1="478.4878357199728" x2="300" y2="736.6825428220194" stroke-width="20" stroke-miterlimit="10" stroke="black" />` + insert;
        }
        let id = `kgun${this.class}${mod}${this.leftArc}${this.numArcs}`;
        if (this.ship.hashseed !== undefined) {
            fnv.seed(this.ship.hashseed);
            id = fnv.hash(id).hex();
        }
        let svg = genHex(this.ship.orientation, id, this.numArcs, this.leftArc, undefined, insert);
        // If long range, fill the centre hex
        if (this.modifier === "long") {
            svg = svg.replace(`id="inner" fill="white" fill-opacity="0"`, `id="inner" fill="black" fill-opacity="1"`);
        // If short range, change the viewbox
        } else if (this.modifier === "short") {
            svg = svg.replace(`viewBox="-1 -1 602 602"`, `viewBox="-26 24 652 652"`);
        }

        return {
            id,
            svg,
            height: 2,
            width: 2
        }
    }
}