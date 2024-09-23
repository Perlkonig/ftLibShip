/**
 * This isn't a real system, but making a class file for it makes it
 * easier to render, so here we are.
 */

import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";
import fnv from "fnv-plus";

export class Flawed extends System {
    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
    }

    fullName() {
        return `Flawed Design`;
    }

    mass() {
        return 0;
    }

    points() {
        return 0;
    }

    glyph() {
        let id = `flawed`;
        if (this.ship.hashseed !== undefined) {
            fnv.seed(this.ship.hashseed);
            id = fnv.hash(id).hex();
        }
        let svg = `<symbol id="${id}" viewBox="8 -28 82 82"><defs><linearGradient id="a" x1="-23.456" x2="-16.881" y1="126.86" y2="126.86" gradientTransform="matrix(.00912 2.4 2.4 -.00912 -262.2 73.199)" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:#202326"/><stop offset=".2" style="stop-color:#232629"/><stop offset=".369" style="stop-color:#2d3132"/><stop offset=".522" style="stop-color:#3e4241"/><stop offset=".671" style="stop-color:#565a56"/><stop offset=".812" style="stop-color:#747a72"/><stop offset=".949" style="stop-color:#99a093"/><stop offset=".996" style="stop-color:#a7aea0"/><stop offset="1" style="stop-color:#a7aea0"/></linearGradient></defs><g transform="rotate(-45 52.575 19.2)"><path d="M55.801 24c1.121-.48 5.918-.558 14.398-.238 9.039.317 13.68.477 13.922.477l-18.723-6.84 4.563-6.961L65.398 0l.481 8.879-5.52 8.161-19.797 6-12.964.597L0 18.961l18.598 6.84L38.16 29.04 45.961 27c5.437-1.519 8.719-2.519 9.84-3z" style="fill-rule:evenodd;fill:url(#a)" transform="matrix(1.25 0 0 -1.25 0 38.399)"/><path d="m62.52 26.879 14.281-1.199c-9.363-.64-14.723-.961-16.082-.961-1.598-.078-2.918-.078-3.957 0-1.922.078-3.641.442-5.16 1.082l-13.563 4.918 10.199-1.437c.403-.082 2.602-.524 6.602-1.325 4.078-.796 6.64-1.16 7.68-1.078z" style="fill-rule:evenodd;fill:#c0c5bc" transform="matrix(1.25 0 0 -1.25 0 38.399)"/></g></symbol>`;
        return {
            id,
            svg,
            height: 2,
            width: 2,
        };
    }
}
