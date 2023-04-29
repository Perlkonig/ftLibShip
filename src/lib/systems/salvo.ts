import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";
import { genArcs } from "../genArcs.js";

// Need to include "A" so it works in beta orientation
type Arc = "F"|"FS"|"FP"|"A"|"AS"|"AP";

export class Salvo extends System {
    public modifier: "none" | "er" | "twostage" = "none";
    public leftArc: Arc = "FP";
    public numArcs = 3;

    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
        if (data.hasOwnProperty("modifier")) {
            this.modifier = data.modifier as "er" | "twostage";
        }
        if (data.hasOwnProperty("leftArc")) {
            this.leftArc = data.leftArc as Arc;
        } else {
            data.leftArc = "FP";
        }
        data.numArcs = 3;
    }

    fullName() {
        const name = "Salvo Missile Rack (single-use)";
        if (this.modifier === "er") {
            return name + " - Long Range";
        } else if (this.modifier === "twostage") {
            return name + " - Multistage";
        }
        return name;
    }

    mass() {
        if (this.modifier === "er") {
            return 5;
        } else if (this.modifier === "twostage") {
            return 6;
        } else {
            return 4;
        }
    }

    points() {
        if (this.modifier === "er") {
            return 15;
        } else if (this.modifier === "twostage") {
            return 18;
        } else {
            return 12;
        }
    }

    glyph() {
        let id: string;
        let defs: string;
        let defid: string;
        switch (this.modifier) {
            case "er":
                id = `salvoER${this.leftArc}${this.numArcs}`;
                defid = "_internalSalvoER";
                defs = `<symbol id="${defid}" viewBox="435.5 153 89 89"><polygon stroke="#000000" fill="black" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol>`;
                break;
            case "twostage":
                id = `salvoMS${this.leftArc}${this.numArcs}`;
                defid = "_internalMultistage";
                defs = `<symbol id="${defid}" viewBox="405 279 150 150"><polygon fill="none" stroke="#000000" stroke-width="5" stroke-miterlimit="10" points="433.7,375.5 480,285.5 526.3,375.5 495.4,361.7 526.3,420.5 480,390.3 433.7,420.5 464,361.7"/></symbol>`
                break;
            default:
                id = `salvo${this.leftArc}${this.numArcs}`;
                defid = "_internalSalvo";
                defs = `<symbol id="${defid}" viewBox="435.5 153 89 89"><polygon stroke="#000000" fill="white" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol>`;
                break;
        }
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