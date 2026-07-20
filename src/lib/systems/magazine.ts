import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";
import type { ISystemSVG } from "../svgLib.js";
import {
    individualSalvoGlyph,
    salvoMagazineGridGlyph,
} from "./magazineGrid.js";

export class Magazine extends System {
    public modifier: "none" | "er" | "twostage" = "none";
    public capacity = 2;
    public id!: string;

    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
        if (data.hasOwnProperty("capacity")) {
            this.capacity = data.capacity as number;
        }
        if (data.hasOwnProperty("modifier")) {
            this.modifier = data.modifier as "er" | "twostage";
        }
        if (data.hasOwnProperty("id")) {
            this.id = data.id as string;
        }
    }

    fullName() {
        const name = "Salvo Missile Magazine";
        if (this.modifier === "er") {
            return name + " - Long Range";
        } else if (this.modifier === "twostage") {
            return name + " - Multistage";
        }
        return name;
    }

    mass() {
        if (this.modifier === "er") {
            return 3 * this.capacity;
        } else if (this.modifier === "twostage") {
            return 4 * this.capacity;
        } else {
            return 2 * this.capacity;
        }
    }

    points() {
        if (this.modifier === "er") {
            return 9 * this.capacity;
        } else if (this.modifier === "twostage") {
            return 12 * this.capacity;
        } else {
            return 6 * this.capacity;
        }
    }

    missileGlyph(): ISystemSVG {
        return individualSalvoGlyph(this.ship.hashseed, this.modifier);
    }

    glyph() {
        return salvoMagazineGridGlyph(
            this.capacity,
            this.modifier,
            this.ship.hashseed
        );
    }
}
