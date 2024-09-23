import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";
import type { ISystemSVG } from "../svgLib.js";
import fnv from "fnv-plus";

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
        if (this.modifier === "er") {
            const id = this.ship.hashseed === undefined ? `individualSalvoER` : fnv.hash(`individualSalvoER`).hex();
            return {
                id,
                svg: `<symbol id="${id}" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="black" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol>`,
                width: 1,
                height: 1
            };
        } else if (this.modifier === "twostage") {
            const id = this.ship.hashseed === undefined ? `individualSalvoMS` : fnv.hash(`individualSalvoMS`).hex();
            return {
                id,
                svg: `<symbol id="${id}" viewBox="405 279 150 150"><polygon fill="none" stroke="#000000" stroke-width="5" stroke-miterlimit="10" points="433.7,375.5 480,285.5 526.3,375.5 495.4,361.7 526.3,420.5 480,390.3 433.7,420.5 464,361.7"/></symbol>`,
                width: 1,
                height: 1
            };
        } else {
            const id = this.ship.hashseed === undefined ? `individualSalvo` : fnv.hash(`individualSalvo`).hex();
            return {
                id,
                svg: `<symbol id="${id}" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="white" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol>`,
                width: 1,
                height: 1
            };
        }
    }

    glyph() {
        let capacity = this.capacity;
        if (capacity > 9) {
            capacity = 9;
        }
        let id: string;
        if (this.modifier === "er") {
            switch (capacity) {
                case 1:
                    id = this.ship.hashseed === undefined ? `magazineER1` : fnv.hash(`magazineER1`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 22 12"><defs><symbol id="_internalSalvoER" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="black" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol></defs><rect x="0" y="0" width="20" height="10" stroke="black" fill="white" /><use href="#_internalSalvoER" x="0" y="0" width="10" height="10" /></symbol>`,
                        width: 2,
                        height: 1
                    };
                case 2:
                    id = this.ship.hashseed === undefined ? `magazineER2` : fnv.hash(`magazineER2`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 22 12"><defs><symbol id="_internalSalvoER" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="black" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol></defs><rect x="0" y="0" width="20" height="10" stroke="black" fill="white" /><use href="#_internalSalvoER" x="0" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="10" y="0" width="10" height="10" /></symbol>`,
                        width: 2,
                        height: 1
                    };
                case 3:
                    id = this.ship.hashseed === undefined ? `magazineER3` : fnv.hash(`magazineER3`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 12"><defs><symbol id="_internalSalvoER" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="black" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol></defs><rect x="0" y="0" width="30" height="10" stroke="black" fill="white" /><use href="#_internalSalvoER" x="0" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="10" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="20" y="0" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 1
                    };
                case 4:
                    id = this.ship.hashseed === undefined ? `magazineER4` : fnv.hash(`magazineER4`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 22"><defs><symbol id="_internalSalvoER" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="black" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol></defs><rect x="0" y="0" width="30" height="20" stroke="black" fill="white" /><use href="#_internalSalvoER" x="0" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="10" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="20" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="0" y="10" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 2
                    };
                case 5:
                    id = this.ship.hashseed === undefined ? `magazineER5` : fnv.hash(`magazineER5`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 22"><defs><symbol id="_internalSalvoER" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="black" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol></defs><rect x="0" y="0" width="30" height="20" stroke="black" fill="white" /><use href="#_internalSalvoER" x="0" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="10" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="20" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="0" y="10" width="10" height="10" /><use href="#_internalSalvoER" x="10" y="10" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 2
                    };
                case 6:
                    id = this.ship.hashseed === undefined ? `magazineER6` : fnv.hash(`magazineER6`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 22"><defs><symbol id="_internalSalvoER" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="black" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol></defs><rect x="0" y="0" width="30" height="20" stroke="black" fill="white" /><use href="#_internalSalvoER" x="0" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="10" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="20" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="0" y="10" width="10" height="10" /><use href="#_internalSalvoER" x="10" y="10" width="10" height="10" /><use href="#_internalSalvoER" x="20" y="10" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 2
                    };
                case 7:
                    id = this.ship.hashseed === undefined ? `magazineER7` : fnv.hash(`magazineER7`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 32"><defs><symbol id="_internalSalvoER" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="black" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol></defs><rect x="0" y="0" width="30" height="30" stroke="black" fill="white" /><use href="#_internalSalvoER" x="0" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="10" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="20" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="0" y="10" width="10" height="10" /><use href="#_internalSalvoER" x="10" y="10" width="10" height="10" /><use href="#_internalSalvoER" x="20" y="10" width="10" height="10" /><use href="#_internalSalvoER" x="0" y="20" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 3
                    };
                case 8:
                    id = this.ship.hashseed === undefined ? `magazineER8` : fnv.hash(`magazineER8`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 32"><defs><symbol id="_internalSalvoER" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="black" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol></defs><rect x="0" y="0" width="30" height="30" stroke="black" fill="white" /><use href="#_internalSalvoER" x="0" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="10" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="20" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="0" y="10" width="10" height="10" /><use href="#_internalSalvoER" x="10" y="10" width="10" height="10" /><use href="#_internalSalvoER" x="20" y="10" width="10" height="10" /><use href="#_internalSalvoER" x="0" y="20" width="10" height="10" /><use href="#_internalSalvoER" x="10" y="20" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 3
                    };
                case 9:
                    id = this.ship.hashseed === undefined ? `magazineER9` : fnv.hash(`magazineER9`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 32"><defs><symbol id="_internalSalvoER" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="black" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol></defs><rect x="0" y="0" width="30" height="30" stroke="black" fill="white" /><use href="#_internalSalvoER" x="0" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="10" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="20" y="0" width="10" height="10" /><use href="#_internalSalvoER" x="0" y="10" width="10" height="10" /><use href="#_internalSalvoER" x="10" y="10" width="10" height="10" /><use href="#_internalSalvoER" x="20" y="10" width="10" height="10" /><use href="#_internalSalvoER" x="0" y="20" width="10" height="10" /><use href="#_internalSalvoER" x="10" y="20" width="10" height="10" /><use href="#_internalSalvoER" x="20" y="20" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 3
                    };
            }
        } else if (this.modifier === "twostage") {
            switch (capacity) {
                case 1:
                    id = this.ship.hashseed === undefined ? `magazineTwoStage1` : fnv.hash(`magazineTwoStage1`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 22 12"><defs><symbol id="_internalSalvoTwoStage" viewBox="405 279 150 150"><polygon fill="none" stroke="#000000" stroke-width="5" stroke-miterlimit="10" points="433.7,375.5 480,285.5 526.3,375.5 495.4,361.7 526.3,420.5 480,390.3 433.7,420.5 464,361.7"/></symbol></defs><rect x="0" y="0" width="20" height="10" stroke="black" fill="white" /><use href="#_internalSalvoTwoStage" x="0" y="0" width="10" height="10" /></symbol>`,
                        width: 2,
                        height: 1
                    };
                case 2:
                    id = this.ship.hashseed === undefined ? `magazineTwoStage2` : fnv.hash(`magazineTwoStage2`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 22 12"><defs><symbol id="_internalSalvoTwoStage" viewBox="405 279 150 150"><polygon fill="none" stroke="#000000" stroke-width="5" stroke-miterlimit="10" points="433.7,375.5 480,285.5 526.3,375.5 495.4,361.7 526.3,420.5 480,390.3 433.7,420.5 464,361.7"/></symbol></defs><rect x="0" y="0" width="20" height="10" stroke="black" fill="white" /><use href="#_internalSalvoTwoStage" x="0" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="10" y="0" width="10" height="10" /></symbol>`,
                        width: 2,
                        height: 1
                    };
                case 3:
                    id = this.ship.hashseed === undefined ? `magazineTwoStage3` : fnv.hash(`magazineTwoStage3`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 12"><defs><symbol id="_internalSalvoTwoStage" viewBox="405 279 150 150"><polygon fill="none" stroke="#000000" stroke-width="5" stroke-miterlimit="10" points="433.7,375.5 480,285.5 526.3,375.5 495.4,361.7 526.3,420.5 480,390.3 433.7,420.5 464,361.7"/></symbol></defs><rect x="0" y="0" width="30" height="10" stroke="black" fill="white" /><use href="#_internalSalvoTwoStage" x="0" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="10" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="20" y="0" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 1
                    };
                case 4:
                    id = this.ship.hashseed === undefined ? `magazineTwoStage4` : fnv.hash(`magazineTwoStage4`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 22"><defs><symbol id="_internalSalvoTwoStage" viewBox="405 279 150 150"><polygon fill="none" stroke="#000000" stroke-width="5" stroke-miterlimit="10" points="433.7,375.5 480,285.5 526.3,375.5 495.4,361.7 526.3,420.5 480,390.3 433.7,420.5 464,361.7"/></symbol></defs><rect x="0" y="0" width="30" height="20" stroke="black" fill="white" /><use href="#_internalSalvoTwoStage" x="0" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="10" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="20" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="0" y="10" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 2
                    };
                case 5:
                    id = this.ship.hashseed === undefined ? `magazineTwoStage5` : fnv.hash(`magazineTwoStage5`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 22"><defs><symbol id="_internalSalvoTwoStage" viewBox="405 279 150 150"><polygon fill="none" stroke="#000000" stroke-width="5" stroke-miterlimit="10" points="433.7,375.5 480,285.5 526.3,375.5 495.4,361.7 526.3,420.5 480,390.3 433.7,420.5 464,361.7"/></symbol></defs><rect x="0" y="0" width="30" height="20" stroke="black" fill="white" /><use href="#_internalSalvoTwoStage" x="0" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="10" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="20" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="0" y="10" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="10" y="10" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 2
                    };
                case 6:
                    id = this.ship.hashseed === undefined ? `magazineTwoStage6` : fnv.hash(`magazineTwoStage6`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 22"><defs><symbol id="_internalSalvoTwoStage" viewBox="405 279 150 150"><polygon fill="none" stroke="#000000" stroke-width="5" stroke-miterlimit="10" points="433.7,375.5 480,285.5 526.3,375.5 495.4,361.7 526.3,420.5 480,390.3 433.7,420.5 464,361.7"/></symbol></defs><rect x="0" y="0" width="30" height="20" stroke="black" fill="white" /><use href="#_internalSalvoTwoStage" x="0" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="10" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="20" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="0" y="10" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="10" y="10" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="20" y="10" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 2
                    };
                case 7:
                    id = this.ship.hashseed === undefined ? `magazineTwoStage7` : fnv.hash(`magazineTwoStage7`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 32"><defs><symbol id="_internalSalvoTwoStage" viewBox="405 279 150 150"><polygon fill="none" stroke="#000000" stroke-width="5" stroke-miterlimit="10" points="433.7,375.5 480,285.5 526.3,375.5 495.4,361.7 526.3,420.5 480,390.3 433.7,420.5 464,361.7"/></symbol></defs><rect x="0" y="0" width="30" height="30" stroke="black" fill="white" /><use href="#_internalSalvoTwoStage" x="0" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="10" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="20" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="0" y="10" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="10" y="10" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="20" y="10" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="0" y="20" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 3
                    };
                case 8:
                    id = this.ship.hashseed === undefined ? `magazineTwoStage8` : fnv.hash(`magazineTwoStage8`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 32"><defs><symbol id="_internalSalvoTwoStage" viewBox="405 279 150 150"><polygon fill="none" stroke="#000000" stroke-width="5" stroke-miterlimit="10" points="433.7,375.5 480,285.5 526.3,375.5 495.4,361.7 526.3,420.5 480,390.3 433.7,420.5 464,361.7"/></symbol></defs><rect x="0" y="0" width="30" height="30" stroke="black" fill="white" /><use href="#_internalSalvoTwoStage" x="0" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="10" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="20" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="0" y="10" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="10" y="10" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="20" y="10" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="0" y="20" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="10" y="20" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 3
                    };
                case 9:
                    id = this.ship.hashseed === undefined ? `magazineTwoStage9` : fnv.hash(`magazineTwoStage9`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 32"><defs><symbol id="_internalSalvoTwoStage" viewBox="405 279 150 150"><polygon fill="none" stroke="#000000" stroke-width="5" stroke-miterlimit="10" points="433.7,375.5 480,285.5 526.3,375.5 495.4,361.7 526.3,420.5 480,390.3 433.7,420.5 464,361.7"/></symbol></defs><rect x="0" y="0" width="30" height="30" stroke="black" fill="white" /><use href="#_internalSalvoTwoStage" x="0" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="10" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="20" y="0" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="0" y="10" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="10" y="10" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="20" y="10" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="0" y="20" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="10" y="20" width="10" height="10" /><use href="#_internalSalvoTwoStage" x="20" y="20" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 3
                    };
            }
        } else {
            switch (capacity) {
                case 1:
                    id = this.ship.hashseed === undefined ? `magazine1` : fnv.hash(`magazine1`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 22 12"><defs><symbol id="_internalSalvo" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="white" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol></defs><rect x="0" y="0" width="20" height="10" stroke="black" fill="white" /><use href="#_internalSalvo" x="0" y="0" width="10" height="10" /></symbol>`,
                        width: 2,
                        height: 1
                    };
                case 2:
                    id = this.ship.hashseed === undefined ? `magazine2` : fnv.hash(`magazine2`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 22 12"><defs><symbol id="_internalSalvo" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="white" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol></defs><rect x="0" y="0" width="20" height="10" stroke="black" fill="white" /><use href="#_internalSalvo" x="0" y="0" width="10" height="10" /><use href="#_internalSalvo" x="10" y="0" width="10" height="10" /></symbol>`,
                        width: 2,
                        height: 1
                    };
                case 3:
                    id = this.ship.hashseed === undefined ? `magazine3` : fnv.hash(`magazine3`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 12"><defs><symbol id="_internalSalvo" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="white" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol></defs><rect x="0" y="0" width="30" height="10" stroke="black" fill="white" /><use href="#_internalSalvo" x="0" y="0" width="10" height="10" /><use href="#_internalSalvo" x="10" y="0" width="10" height="10" /><use href="#_internalSalvo" x="20" y="0" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 1
                    };
                case 4:
                    id = this.ship.hashseed === undefined ? `magazine4` : fnv.hash(`magazine4`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 22"><defs><symbol id="_internalSalvo" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="white" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol></defs><rect x="0" y="0" width="30" height="20" stroke="black" fill="white" /><use href="#_internalSalvo" x="0" y="0" width="10" height="10" /><use href="#_internalSalvo" x="10" y="0" width="10" height="10" /><use href="#_internalSalvo" x="20" y="0" width="10" height="10" /><use href="#_internalSalvo" x="0" y="10" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 2
                    };
                case 5:
                    id = this.ship.hashseed === undefined ? `magazine5` : fnv.hash(`magazine5`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 22"><defs><symbol id="_internalSalvo" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="white" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol></defs><rect x="0" y="0" width="30" height="20" stroke="black" fill="white" /><use href="#_internalSalvo" x="0" y="0" width="10" height="10" /><use href="#_internalSalvo" x="10" y="0" width="10" height="10" /><use href="#_internalSalvo" x="20" y="0" width="10" height="10" /><use href="#_internalSalvo" x="0" y="10" width="10" height="10" /><use href="#_internalSalvo" x="10" y="10" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 2
                    };
                case 6:
                    id = this.ship.hashseed === undefined ? `magazine6` : fnv.hash(`magazine6`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 22"><defs><symbol id="_internalSalvo" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="white" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol></defs><rect x="0" y="0" width="30" height="20" stroke="black" fill="white" /><use href="#_internalSalvo" x="0" y="0" width="10" height="10" /><use href="#_internalSalvo" x="10" y="0" width="10" height="10" /><use href="#_internalSalvo" x="20" y="0" width="10" height="10" /><use href="#_internalSalvo" x="0" y="10" width="10" height="10" /><use href="#_internalSalvo" x="10" y="10" width="10" height="10" /><use href="#_internalSalvo" x="20" y="10" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 2
                    };
                case 7:
                    id = this.ship.hashseed === undefined ? `magazine7` : fnv.hash(`magazine7`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 32"><defs><symbol id="_internalSalvo" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="white" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol></defs><rect x="0" y="0" width="30" height="30" stroke="black" fill="white" /><use href="#_internalSalvo" x="0" y="0" width="10" height="10" /><use href="#_internalSalvo" x="10" y="0" width="10" height="10" /><use href="#_internalSalvo" x="20" y="0" width="10" height="10" /><use href="#_internalSalvo" x="0" y="10" width="10" height="10" /><use href="#_internalSalvo" x="10" y="10" width="10" height="10" /><use href="#_internalSalvo" x="20" y="10" width="10" height="10" /><use href="#_internalSalvo" x="0" y="20" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 3
                    };
                case 8:
                    id = this.ship.hashseed === undefined ? `magazine8` : fnv.hash(`magazine8`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 32"><defs><symbol id="_internalSalvo" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="white" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol></defs><rect x="0" y="0" width="30" height="30" stroke="black" fill="white" /><use href="#_internalSalvo" x="0" y="0" width="10" height="10" /><use href="#_internalSalvo" x="10" y="0" width="10" height="10" /><use href="#_internalSalvo" x="20" y="0" width="10" height="10" /><use href="#_internalSalvo" x="0" y="10" width="10" height="10" /><use href="#_internalSalvo" x="10" y="10" width="10" height="10" /><use href="#_internalSalvo" x="20" y="10" width="10" height="10" /><use href="#_internalSalvo" x="0" y="20" width="10" height="10" /><use href="#_internalSalvo" x="10" y="20" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 3
                    };
                case 9:
                    id = this.ship.hashseed === undefined ? `magazine9` : fnv.hash(`magazine9`).hex();
                    return {
                        id,
                        svg: `<symbol id="${id}" viewBox="-1 -1 32 32"><defs><symbol id="_internalSalvo" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="white" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol></defs><rect x="0" y="0" width="30" height="30" stroke="black" fill="white" /><use href="#_internalSalvo" x="0" y="0" width="10" height="10" /><use href="#_internalSalvo" x="10" y="0" width="10" height="10" /><use href="#_internalSalvo" x="20" y="0" width="10" height="10" /><use href="#_internalSalvo" x="0" y="10" width="10" height="10" /><use href="#_internalSalvo" x="10" y="10" width="10" height="10" /><use href="#_internalSalvo" x="20" y="10" width="10" height="10" /><use href="#_internalSalvo" x="0" y="20" width="10" height="10" /><use href="#_internalSalvo" x="10" y="20" width="10" height="10" /><use href="#_internalSalvo" x="20" y="20" width="10" height="10" /></symbol>`,
                        width: 3,
                        height: 3
                    };
            }
        }
   }
}