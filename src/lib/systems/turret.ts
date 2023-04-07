import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem, Arc, ArcNum } from "./_base.js";
import { genHex } from "../genHex.js";
import { getSystem } from "./index.js";

export class Turret extends System {
    public leftArc: Arc = "F";
    public numArcs: ArcNum = 1;
    public size: number = 4;
    public weapons: string[] = [];

    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
        if (data.hasOwnProperty("leftArc")) {
            this.leftArc = data.leftArc as Arc;
        }
        if (data.hasOwnProperty("numArcs")) {
            this.numArcs = data.numArcs as ArcNum;
        }
        if (data.hasOwnProperty("size")) {
            this.size = data.size as number;
        }
        if (data.hasOwnProperty("weapons")) {
            this.weapons = data.weapons as string[];
        }

        // Force leftArcs
        switch (this.numArcs) {
            case 1:
            case 2:
                this.leftArc = "F";
                data.leftArc = "F";
                break;
            case 3:
            case 4:
                this.leftArc = "FP";
                data.leftArc = "FP";
                break;
            case 5:
            case 6:
                this.leftArc = "AP";
                data.leftArc = "AP";
                break;
        }
    }

    private getHousedMass = (): number => {
        const housedSystems: System[] = [];
        for (const id of this.weapons) {
            let obj: any = undefined;
            if (this.ship.ordnance !== undefined) {
                let idx = this.ship.ordnance.findIndex(x => x.id === id);
                if (idx !== -1) {
                    obj = this.ship.ordnance[idx];
                } else {
                    if (this.ship.weapons !== undefined) {
                        idx = this.ship.weapons.findIndex(x => x.id === id);
                        if (idx !== -1) {
                            obj = this.ship.weapons[idx];
                        }
                    }
                }
            }
            if (obj !== undefined) {
                const sys = getSystem(obj, this.ship)!;
                housedSystems.push(sys);
            }
        }

        let mass = 0;
        for (const sys of housedSystems) {
            mass += sys.mass();
        }
        return mass;
    }

    fullName() {
        return `Turret`;
    }

    mass() {
        switch (this.numArcs) {
            case 1:
                return Math.ceil(this.getHousedMass() / 7);
            case 2:
                return Math.ceil(this.getHousedMass() / 6);
            case 3:
                return Math.ceil(this.getHousedMass() / 5);
            case 4:
                return Math.ceil(this.getHousedMass() / 4);
            case 5:
                return Math.ceil(this.getHousedMass() / 3);
            case 6:
                return Math.ceil(this.getHousedMass() / 2);
        }
    }

    points() {
        return this.mass() * 3;
    }

    glyph() {
        const id = `turret${this.numArcs}_${this.size}`;
        let svg = genHex(this.ship.orientation, id, this.numArcs, this.leftArc);

        return {
            id,
            svg,
            height: this.size,
            width: this.size
        }
    }
}