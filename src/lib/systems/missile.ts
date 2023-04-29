import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";
import { genArcs } from "../genArcs.js";

// Need to include "A" so it works in beta orientation
type Arc = "F"|"FS"|"FP"|"A"|"AS"|"AP";

export class Missile extends System {
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
        const name = "Heavy Missile";
        if (this.modifier === "er") {
            return name + " - Long Range";
        } else if (this.modifier === "twostage") {
            return name + " - Multistage";
        }
        return name;
    }

    mass() {
        if (this.modifier === "er") {
            return 3;
        } else if (this.modifier === "twostage") {
            return 4;
        } else {
            return 2;
        }
    }

    points() {
        if (this.modifier === "er") {
            return 9;
        } else if (this.modifier === "twostage") {
            return 12;
        } else {
            return 6;
        }
    }

    glyph() {
        let id: string;
        let defs: string;
        let defid: string;
        switch (this.modifier) {
            case "er":
                id = `missileER${this.leftArc}${this.numArcs}`;
                defid = `_internalMissileER`;
                defs = `<symbol id="${defid}" viewBox="286.5 85 386 386"><polygon fill="black" stroke="#000000" stroke-width="12.7306" stroke-miterlimit="10" points="514.6,306.2 514.6,134.7 480,96.3  445.4,134.7 445.4,306.2 347.6,413.6 434.3,413.6 450.1,432.1 450.1,463.7 509.9,463.7 509.9,432.1 525.7,413.6 612.4,413.6"/></symbol>`
                break;
            case "twostage":
                id = `missileMS${this.leftArc}${this.numArcs}`;
                defid = `_internalMissileMS`;
                defs = `<symbol id="${defid}" viewBox="265 134 150 150"><polygon fill="white" stroke="#000000" stroke-width="5" stroke-miterlimit="10" points="386.2,230.5 339.9,140.5 293.6,230.5 324.5,216.7 293.6,275.5 339.9,245.3 386.2,275.5 355.9,216.7"/></symbol>`
                break;
            default:
                id = `missile${this.leftArc}${this.numArcs}`;
                defid = `_internalMissile`;
                defs = `<symbol id="${defid}" viewBox="286.5 85 386 386"><polygon fill="white" stroke="#000000" stroke-width="12.7306" stroke-miterlimit="10" points="514.6,306.2 514.6,134.7 480,96.3  445.4,134.7 445.4,306.2 347.6,413.6 434.3,413.6 450.1,432.1 450.1,463.7 509.9,463.7 509.9,432.1 525.7,413.6 612.4,413.6"/></symbol>`
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