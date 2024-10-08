import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";
import fnv from "fnv-plus";

export class Holofield extends System {
    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
    }

    fullName() {
        return "Holofield Generator";
    }

    mass() {
        if (this.ship.mass !== undefined) {
            return Math.max(1, Math.round(this.ship.mass * 0.1));
        }
        return NaN;
    }

    points() {
        return this.mass() * 5;
    }

    glyph() {
        const id =
            this.ship.hashseed === undefined
                ? `holofield`
                : fnv.hash(`holofield`).hex();
        return {
            id,
            svg: `<symbol id="${id}" viewBox="280 71 400 400"><g><path d="M601.2,302.5c0-16.7,1.2-34-2.3-50.5c-3.4-16-15.6-26.9-26.1-38.7c-9.2-10.5-17-22.3-27.5-31.6 c-5.9-5.3-13.9-7.6-19.4-13.5c-12.7-13.4-8.8-32.5-17.6-47.7c-8.8-15.2-16.8-29.6-27.8-30.3v-0.1c-0.2,0-0.3,0-0.5,0 c-0.2,0-0.3,0-0.5,0v0.1c-11,0.8-19.1,15.1-27.8,30.3c-8.8,15.2-5,34.2-17.6,47.7c-5.5,5.9-13.5,8.2-19.4,13.5 c-10.4,9.4-18.2,21.2-27.5,31.6c-10.4,11.8-22.7,22.8-26.1,38.7c-3.5,16.5-2.3,33.8-2.3,50.5c0,16.8,0,33.7,0,50.5 c0,12.7-1.3,25.5,3.4,37.5c5,12.8,13.7,24.2,23.9,33.2c5.2,4.6,11.1,9.2,17.3,12.2c5,2.4,10,2.3,13.7,7.3 c4.7,6.3,3.2,13.6,2.5,20.8c-0.7,7.8,121.5,7.8,120.7,0c-0.7-7.1-2.2-14.5,2.5-20.8c3.7-5,8.6-4.9,13.7-7.3 c6.3-3,12.2-7.6,17.3-12.2c10.3-9.1,18.9-20.4,23.9-33.2c4.7-12.1,3.4-24.8,3.4-37.5C601.2,336.2,601.2,319.4,601.2,302.5z"/><g><path fill="none" stroke="#000000" stroke-width="29.5924" stroke-miterlimit="10" d="M524.1,90.1c13.4,0.9,21.3,17,26.7,27.3 c8,15.4,14.5,31.7,23.7,46.4c10.4,16.6,24.1,30.8,37.6,44.9c11.8,12.5,19.8,25.8,23.5,43.3c3.4,16.2,2.3,33,2.3,50.5 c0,16.8,0,33.7,0,50.5c0,12.7,1.3,25.5-3.4,37.5c-5,12.8-6.7,24.1-16.9,33.1c-5.2,4.6-11.1,9.2-17.3,12.2c-5,2.4-10,2.3-13.7,7.3 c-4.7,6.3-3.2,13.6-2.5,20.8"/></g><g><path fill="none" stroke="#000000" stroke-width="29.592" stroke-miterlimit="10" d="M435.9,90.1c-13.4,0.9-21.3,17-26.7,27.3 c-8,15.4-14.5,31.7-23.7,46.4c-10.4,16.6-24.1,30.8-37.6,44.9c-11.8,12.5-19.8,25.8-23.5,43.3c-3.4,16.2-2.3,33-2.3,50.5 c0,16.8,0,33.7,0,50.5c0,12.7-1.3,25.5,3.4,37.5c5,12.8,6.7,24.1,16.9,33.1c5.2,4.6,11.1,9.2,17.3,12.2c5,2.4,10,2.3,13.7,7.3 c4.7,6.3,3.2,13.6,2.5,20.8"/></g></g></symbol>`,
            width: 1,
            height: 1,
        };
    }
}
