import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";
import type { ISystemSVG } from "../svgLib.js";
import {
    BOARDING_TORPEDO_SYMBOL,
    buildMagazineGridGlyph,
    individualBoardingTorpedoGlyph,
} from "./magazineGrid.js";

export class BoardingTorpedoMagazine extends System {
    public capacity = 2;
    public id!: string;

    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
        if (data.hasOwnProperty("capacity")) {
            this.capacity = data.capacity as number;
        }
        if (data.hasOwnProperty("id")) {
            this.id = data.id as string;
        }
    }

    fullName() {
        return "Boarding Torpedo Magazine";
    }

    mass() {
        return this.capacity;
    }

    points() {
        return 3 * this.capacity;
    }

    missileGlyph(): ISystemSVG {
        return individualBoardingTorpedoGlyph(this.ship.hashseed);
    }

    glyph() {
        return buildMagazineGridGlyph(
            this.capacity,
            "magazineBT",
            this.ship.hashseed,
            "_internalBoardingTorpedo",
            BOARDING_TORPEDO_SYMBOL,
            true
        );
    }
}
