import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";

type FighterType = "standard" | "interceptor" | "attack" | "torpedo" | "graser" | "plasma" | "MKP" | "missile" | "multiRole" | "light" | "lightInterceptor" | "lightAttack" | "assault";
type FighterMod = "heavy" | "fast" | "longRange" | "ftl" | "robot";

export const type2name: Map<FighterType, string> = new Map([
    ["standard", "Standard Fighter"],
    ["interceptor", "Interceptor"],
    ["attack", "Attack Fighter"],
    ["torpedo", "Torpedo Fighter"],
    ["graser", "Graser Fighter"],
    ["plasma", "Plasma Fighter"],
    ["MKP", "MKP Fighter"],
    ["missile", "Missile Fighter"],
    ["multiRole", "Multi-Role Fighter"],
    ["light", "Light Fighter"],
    ["lightInterceptor", "Light Interceptor"],
    ["lightAttack", "Light Attack Fighter"],
    ["assault", "Assault Shuttles"],
]);

export const mod2name: Map<FighterMod, string> = new Map([
    ["heavy", "Heavy"],
    ["fast", "Fast"],
    ["longRange", "Long-Range"],
    ["ftl", "FTL"],
    ["robot", "Robot"],
]);

export class Fighters extends System {
    public type: FighterType = "standard";
    public mods: Set<FighterMod> = new Set();
    public hangar: string | undefined;

    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
        if (data.hasOwnProperty("type")) {
            this.type = data.type as FighterType;
        }
        if (data.hasOwnProperty("mods")) {
            let toDel: FighterMod[] = [];
            for (const m of data.mods as FighterMod[]) {
                if (this.type === "light") {
                    if ( (m === "longRange") || (m === "heavy") || (m === "ftl") ) {
                        toDel.push(m);
                        continue;
                    }
                }
                // if (this.type === "assault") {
                //     if (m === "robot") {
                //         toDel.push(m);
                //         continue;
                //     }
                // }
                this.mods.add(m);
            }
            if (toDel.length > 0) {
                data.mods = (data.mods as FighterMod[]).filter(m => ! toDel.includes(m))
            }
        }
        if (data.hasOwnProperty("hangar")) {
            this.hangar = data.hangar as string;
        }
    }

    fullName() {
        let name: string[] = [];
        for (const m of this.mods) {
            name.push(mod2name.get(m)!);
        }
        name.push(type2name.get(this.type)!)
        return name.join(" ");
    }

    mass() {
        return 0;
    }

    points() {
        let base = 0;
        switch (this.type) {
            case "assault":
                base += 6;
                break;
            case "light":
            case "lightInterceptor":
            case "standard":
            case "interceptor":
                base += 18;
                break;
            case "attack":
            case "missile":
            case "lightAttack":
                base += 24;
                break;
            case "multiRole":
                base += 30;
            case "torpedo":
            case "MKP":
                base += 36;
                break;
            case "graser":
            case "plasma":
                base += 42;
                break;
        }
        for (const m of this.mods) {
            switch (m) {
                case "robot":
                    base -= 6;
                    break;
                case "fast":
                case "longRange":
                case "ftl":
                    base += 6;
                    break;
                case "heavy":
                    base += 18;
                    break;
            }
        }
        return base;
    }

    cpv() {
        let base = 0;
        // +30 across the board
        switch (this.type) {
            case "light":
            case "lightInterceptor":
            case "standard":
            case "interceptor":
                base += 48;
                break;
            case "attack":
            case "missile":
            case "lightAttack":
                base += 54;
                break;
            case "multiRole":
                base += 60;
            case "torpedo":
            case "MKP":
                base += 66;
                break;
            case "graser":
            case "plasma":
                base += 72;
                break;
        }
        // Keeping with Continuum points except for longRange, which is increased from +1 to +3
        for (const m of this.mods) {
            switch (m) {
                case "robot":
                    base -= 6;
                    break;
                case "fast":
                case "ftl":
                    base += 6;
                    break;
                case "longRange":
                case "heavy":
                    base += 18;
                    break;
            }
        }
        return base;
    }


    glyph() {
        return undefined;
   }
}