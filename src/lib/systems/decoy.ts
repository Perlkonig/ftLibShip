import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";
import fnv from "fnv-plus";

export class Decoy extends System {
    public type: "cruiser" | "capital" = "cruiser";

    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
        if (data.hasOwnProperty("type")) {
            this.type = data.type as "cruiser" | "capital";
        }
    }

    fullName() {
        if (this.type === "cruiser") {
            return "Cruiser Decoy";
        } else {
            return "Capital Decoy";
        }
    }

    mass() {
        if (this.type === "cruiser") {
            return 2;
        } else {
            return 4;
        }
    }

    points() {
        return this.mass() * 4;
    }

    glyph() {
        let id: string;
        switch (this.type) {
            case "cruiser":
                id = this.ship.hashseed === undefined ? `decoyCruiser` : fnv.hash(`decoyCruiser`).hex();
                return {
                    id,
                    svg: `<symbol id="${id}" viewBox="190 -9 580 580"><path fill="white" stroke="#000000" stroke-width="18.4819" stroke-miterlimit="10" d="M208.8,200.6C278.2,131.2,374.1,88.3,480,88.3c105.9,0,201.8,42.9,271.2,112.3L480,471.8L208.8,200.6z"/><circle fill="white" stroke="#000000" stroke-width="17" stroke-miterlimit="10" cx="480" cy="252.3" r="57.4"/></symbol>`,
                    height: 1,
                    width: 1
                };
            case "capital":
                id = this.ship.hashseed === undefined ? `decoyCapital` : fnv.hash(`decoyCapital`).hex();
                return {
                    id,
                    svg: `<symbol id="${id}" viewBox="190 -9 580 580"><path fill="none" stroke="#000000" stroke-width="18.4819" stroke-miterlimit="10" d="M208.8,200.6C278.2,131.2,374.1,88.3,480,88.3c105.9,0,201.8,42.9,271.2,112.3L480,471.8L208.8,200.6z"/><circle cx="480" cy="252.3" r="88.9" fill="black"/></symbol>`,
                    height: 1,
                    width: 1
                };
        }
    }
}