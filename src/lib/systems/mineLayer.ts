import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";
import type { ISystemSVG } from "../svgLib.js";
import fnv from "fnv-plus";

export class MineLayer extends System {
    public capacity = 2;
    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
        if (data.hasOwnProperty("capacity")) {
            this.capacity = data.capacity as number;
        }
    }

    fullName() {
        return "Mine Layer";
    }

    mass() {
        return 2 + this.capacity;
    }

    points() {
        return 6 + 2 * this.capacity;
    }

    individualMine(): ISystemSVG {
        const id =
            this.ship.hashseed === undefined
                ? `mineIndividual`
                : fnv.hash(`mineIndividual`).hex();
        return {
            id,
            svg: `<symbol id="${id}" width="79" height="79" viewBox="440.5 244 79 79"><polygon fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" points="480,315.8 466.7,293.6 453.5,271.5 480,271.5 506.5,271.5 493.3,293.6"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="480" y1="269.3" x2="480" y2="244.3"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="466.6" y1="292.4" x2="445" y2="304.9"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="493.4" y1="292.4" x2="515" y2="304.9"/></symbol>`,
            width: 1,
            height: 1,
        };
    }

    glyph() {
        const individualID = this.individualMine().id;
        let capacity = this.capacity;
        if (capacity > 9) {
            capacity = 9;
        }
        let id: string;
        switch (capacity) {
            case 2:
                id =
                    this.ship.hashseed === undefined
                        ? `mineLayer2`
                        : fnv.hash(`mineLayer2`).hex();
                return {
                    id,
                    svg: `<symbol id="${id}" viewBox="-7 -12 179 537"><symbol id="_mineIndividual" width="79" height="79" viewBox="440.5 244 79 79"><polygon fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" points="480,315.8 466.7,293.6 453.5,271.5 480,271.5 506.5,271.5 493.3,293.6"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="480" y1="269.3" x2="480" y2="244.3"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="466.6" y1="292.4" x2="445" y2="304.9"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="493.4" y1="292.4" x2="515" y2="304.9"/></symbol><rect x="0" y="0" fill="white" stroke="#000000" stroke-width="10" stroke-miterlimit="10" width="165" height="515"/><use href="#${individualID}" x="17.5" y="24.75" width="130" height="130"/><use href="#${individualID}" x="17.5" y="191.5" width="130" height="130"/></symbol>`,
                    height: 3,
                    width: 1,
                };
            case 3:
                id =
                    this.ship.hashseed === undefined
                        ? `mineLayer3`
                        : fnv.hash(`mineLayer3`).hex();
                return {
                    id,
                    svg: `<symbol id="${id}" viewBox="-7 -12 179 537"><symbol id="_mineIndividual" width="79" height="79" viewBox="440.5 244 79 79"><polygon fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" points="480,315.8 466.7,293.6 453.5,271.5 480,271.5 506.5,271.5 493.3,293.6"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="480" y1="269.3" x2="480" y2="244.3"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="466.6" y1="292.4" x2="445" y2="304.9"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="493.4" y1="292.4" x2="515" y2="304.9"/></symbol><rect x="0" y="0" fill="white" stroke="#000000" stroke-width="10" stroke-miterlimit="10" width="165" height="515"/><use href="#${individualID}" x="17.5" y="24.75" width="130" height="130"/><use href="#${individualID}" x="17.5" y="191.5" width="130" height="130"/><use href="#${individualID}" x="17.5" y="358.25" width="130" height="130"/></symbol>`,
                    height: 3,
                    width: 1,
                };
            case 4:
                id =
                    this.ship.hashseed === undefined
                        ? `mineLayer4`
                        : fnv.hash(`mineLayer4`).hex();
                return {
                    id,
                    svg: `<symbol id="${id}" viewBox="-19 -12 358 537"><symbol id="_mineIndividual" width="79" height="79" viewBox="440.5 244 79 79"><polygon fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" points="480,315.8 466.7,293.6 453.5,271.5 480,271.5 506.5,271.5 493.3,293.6"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="480" y1="269.3" x2="480" y2="244.3"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="466.6" y1="292.4" x2="445" y2="304.9"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="493.4" y1="292.4" x2="515" y2="304.9"/></symbol><rect x="0" y="0" fill="white" stroke="#000000" stroke-width="10" stroke-miterlimit="10" width="320" height="515"/><use href="#${individualID}" x="17.5" y="24.75" width="130" height="130"/><use href="#${individualID}" x="17.5" y="191.5" width="130" height="130"/><use href="#${individualID}" x="17.5" y="358.25" width="130" height="130"/><use href="#${individualID}" x="169.5" y="24.75" width="130" height="130"/></symbol>`,
                    height: 3,
                    width: 2,
                };
            case 5:
                id =
                    this.ship.hashseed === undefined
                        ? `mineLayer5`
                        : fnv.hash(`mineLayer5`).hex();
                return {
                    id,
                    svg: `<symbol id="${id}" viewBox="-19 -12 358 537"><symbol id="_mineIndividual" width="79" height="79" viewBox="440.5 244 79 79"><polygon fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" points="480,315.8 466.7,293.6 453.5,271.5 480,271.5 506.5,271.5 493.3,293.6"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="480" y1="269.3" x2="480" y2="244.3"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="466.6" y1="292.4" x2="445" y2="304.9"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="493.4" y1="292.4" x2="515" y2="304.9"/></symbol><rect x="0" y="0" fill="white" stroke="#000000" stroke-width="10" stroke-miterlimit="10" width="320" height="515"/><use href="#${individualID}" x="17.5" y="24.75" width="130" height="130"/><use href="#${individualID}" x="17.5" y="191.5" width="130" height="130"/><use href="#${individualID}" x="17.5" y="358.25" width="130" height="130"/><use href="#${individualID}" x="169.5" y="24.75" width="130" height="130"/><use href="#${individualID}" x="169.5" y="191.5" width="130" height="130"/></symbol>`,
                    height: 3,
                    width: 2,
                };
            case 6:
                id =
                    this.ship.hashseed === undefined
                        ? `mineLayer6`
                        : fnv.hash(`mineLayer6`).hex();
                return {
                    id,
                    svg: `<symbol id="${id}" viewBox="-19 -12 358 537"><symbol id="_mineIndividual" width="79" height="79" viewBox="440.5 244 79 79"><polygon fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" points="480,315.8 466.7,293.6 453.5,271.5 480,271.5 506.5,271.5 493.3,293.6"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="480" y1="269.3" x2="480" y2="244.3"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="466.6" y1="292.4" x2="445" y2="304.9"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="493.4" y1="292.4" x2="515" y2="304.9"/></symbol><rect x="0" y="0" fill="white" stroke="#000000" stroke-width="10" stroke-miterlimit="10" width="320" height="515"/><use href="#${individualID}" x="17.5" y="24.75" width="130" height="130"/><use href="#${individualID}" x="17.5" y="191.5" width="130" height="130"/><use href="#${individualID}" x="17.5" y="358.25" width="130" height="130"/><use href="#${individualID}" x="169.5" y="24.75" width="130" height="130"/><use href="#${individualID}" x="169.5" y="191.5" width="130" height="130"/><use href="#${individualID}" x="169.5" y="358.25" width="130" height="130"/></symbol>`,
                    height: 3,
                    width: 2,
                };
            case 7:
                id =
                    this.ship.hashseed === undefined
                        ? `mineLayer7`
                        : fnv.hash(`mineLayer7`).hex();
                return {
                    id,
                    svg: `<symbol id="${id}" viewBox="-33 -12 537 537"><symbol id="_mineIndividual" width="79" height="79" viewBox="440.5 244 79 79"><polygon fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" points="480,315.8 466.7,293.6 453.5,271.5 480,271.5 506.5,271.5 493.3,293.6"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="480" y1="269.3" x2="480" y2="244.3"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="466.6" y1="292.4" x2="445" y2="304.9"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="493.4" y1="292.4" x2="515" y2="304.9"/></symbol><rect x="0" y="0" fill="white" stroke="#000000" stroke-width="10" stroke-miterlimit="10" width="470" height="515"/><use href="#${individualID}" x="17.5" y="24.75" width="130" height="130"/><use href="#${individualID}" x="17.5" y="191.5" width="130" height="130"/><use href="#${individualID}" x="17.5" y="358.25" width="130" height="130"/><use href="#${individualID}" x="169.5" y="24.75" width="130" height="130"/><use href="#${individualID}" x="169.5" y="191.5" width="130" height="130"/><use href="#${individualID}" x="169.5" y="358.25" width="130" height="130"/><use href="#${individualID}" x="321.5" y="24.75" width="130" height="130"/></symbol>`,
                    height: 3,
                    width: 3,
                };
            case 8:
                id =
                    this.ship.hashseed === undefined
                        ? `mineLayer8`
                        : fnv.hash(`mineLayer8`).hex();
                return {
                    id,
                    svg: `<symbol id="${id}" viewBox="-33 -12 537 537"><symbol id="_mineIndividual" width="79" height="79" viewBox="440.5 244 79 79"><polygon fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" points="480,315.8 466.7,293.6 453.5,271.5 480,271.5 506.5,271.5 493.3,293.6"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="480" y1="269.3" x2="480" y2="244.3"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="466.6" y1="292.4" x2="445" y2="304.9"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="493.4" y1="292.4" x2="515" y2="304.9"/></symbol><rect x="0" y="0" fill="white" stroke="#000000" stroke-width="10" stroke-miterlimit="10" width="470" height="515"/><use href="#${individualID}" x="17.5" y="24.75" width="130" height="130"/><use href="#${individualID}" x="17.5" y="191.5" width="130" height="130"/><use href="#${individualID}" x="17.5" y="358.25" width="130" height="130"/><use href="#${individualID}" x="169.5" y="24.75" width="130" height="130"/><use href="#${individualID}" x="169.5" y="191.5" width="130" height="130"/><use href="#${individualID}" x="169.5" y="358.25" width="130" height="130"/><use href="#${individualID}" x="321.5" y="24.75" width="130" height="130"/><use href="#${individualID}" x="321.5" y="191.5" width="130" height="130"/></symbol>`,
                    height: 3,
                    width: 3,
                };
            case 9:
                id =
                    this.ship.hashseed === undefined
                        ? `mineLayer9`
                        : fnv.hash(`mineLayer9`).hex();
                return {
                    id,
                    svg: `<symbol id="${id}" viewBox="-33 -12 537 537"><symbol id="_mineIndividual" width="79" height="79" viewBox="440.5 244 79 79"><polygon fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" points="480,315.8 466.7,293.6 453.5,271.5 480,271.5 506.5,271.5 493.3,293.6"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="480" y1="269.3" x2="480" y2="244.3"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="466.6" y1="292.4" x2="445" y2="304.9"/><line fill="none" stroke="#000000" stroke-width="7" stroke-miterlimit="10" x1="493.4" y1="292.4" x2="515" y2="304.9"/></symbol><rect x="0" y="0" fill="white" stroke="#000000" stroke-width="10" stroke-miterlimit="10" width="470" height="515"/><use href="#${individualID}" x="17.5" y="24.75" width="130" height="130"/><use href="#${individualID}" x="17.5" y="191.5" width="130" height="130"/><use href="#${individualID}" x="17.5" y="358.25" width="130" height="130"/><use href="#${individualID}" x="169.5" y="24.75" width="130" height="130"/><use href="#${individualID}" x="169.5" y="191.5" width="130" height="130"/><use href="#${individualID}" x="169.5" y="358.25" width="130" height="130"/><use href="#${individualID}" x="321.5" y="24.75" width="130" height="130"/><use href="#${individualID}" x="321.5" y="191.5" width="130" height="130"/><use href="#${individualID}" x="321.5" y="358.25" width="130" height="130"/></symbol>`,
                    height: 3,
                    width: 3,
                };
        }
    }
}
