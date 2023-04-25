import type { FullThrustShip } from "../../schemas/ship.js";
import { System } from "./_base.js";
import type { ISystem } from "./_base.js";

export class Ftl extends System {
    public advanced = false;
    public transferMass = 0;

    constructor(data: ISystem, ship: FullThrustShip) {
        super(data, ship);
        if (data.hasOwnProperty("advanced")) {
            this.advanced = data.advanced as boolean;
        }
        if (data.hasOwnProperty("transferMass")) {
            let tug = data.transferMass as number;
            if (tug % 5 !== 0) {
                tug = Math.ceil(tug / 5) * 5;
            }
            this.transferMass = tug;
        }
    }

    fullName() {
        if (this.advanced) {
            return "Faster-Than-Light Drive - Advanced";
        }
        return "Faster-Than-Light Drive";
    }

    mass() {
        if (this.ship.mass !== undefined) {
            let tug = 0;
            if (this.transferMass > 0) {
                tug = Math.round(this.transferMass / 5);
            }
            return Math.round(this.ship.mass * 0.1) + tug;
        }
        return NaN;
    }

    points() {
        const mass = this.mass();
        let points = mass * 2;
        if (this.advanced) {
            points = mass * 3;
        }
        return points;
    }

    glyph() {
        if (this.advanced) {
            if (this.transferMass > 0) {
                return {
                    id: "ftlAdv",
                    svg: `<symbol id="svg_ftlAdv" viewBox="352 93 256.67 385"><g><g><rect x="377.6" y="267.1" fill="white" stroke="#000000" stroke-width="5" stroke-miterlimit="10" width="207.7" height="207.7"/><rect x="392.6" y="282.1" fill="none" stroke="#000000" stroke-width="11.9838" stroke-miterlimit="10" width="177.7" height="177.7"/><path fill="none" stroke="#000000" stroke-width="11.7801" stroke-miterlimit="10" d="M393,362.8c0,0,18.1,56.2,43.1,56.2c13.2,0,21.7-22.7,26.4-32c9-18.1,16.8-37.6,29.8-53.3c6.2-7.4,15.4-15.8,26-15.5c11.6,0.2,20,11.4,26.9,19.5c9.5,11.4,18,23.8,25.6,36.6"/></g><polyline fill="none" stroke="#000000" stroke-width="11.9852" stroke-miterlimit="10" points="570.7,365.6 598.7,365.6 598.7,100.2 361.3,100.2 361.3,365.6 392.6,365.6"/></g><g><text x="479.5" y="175" dominant-baseline="middle" text-anchor="middle" font-size="100">${this.transferMass}</text></g></symbol>`,
                    width: 3,
                    height: 2
                }
            } else {
                return {
                    id: "ftlAdv",
                    svg: `<symbol id="svg_ftlAdv" viewBox="-51.5 -247.5 1058 1058"><g><rect x="264.5" y="65.5" fill="white" stroke="#000000" stroke-width="29" stroke-miterlimit="10" width="430" height="430"/><path fill="none" stroke="#000000" stroke-width="28.507" stroke-miterlimit="10" d="M265.4,260.8c0,0,43.9,136,104.2,136 c31.9,0,52.6-54.9,63.8-77.5c21.7-43.8,40.7-91,72.1-129c14.9-18,37.3-38.2,62.9-37.6c28.1,0.6,48.5,27.5,65,47.1 c23.1,27.5,43.5,57.6,61.9,88.5"/></g><rect x="221" y="25" fill="none" stroke="#000000" stroke-width="12" stroke-miterlimit="10" width="514" height="514"/></symbol>`,
                    width: 1,
                    height: 1
                }
            }
        } else {
            if (this.transferMass > 0) {
                return {
                    id: "ftl",
                    svg: `<symbol id="svg_ftl" viewBox="353 93 254 381"><g><g><rect x="392.6" y="282.1" fill="none" stroke="#000000" stroke-width="11.9838" stroke-miterlimit="10" width="177.7" height="177.7"/><path fill="none" stroke="#000000" stroke-width="11.7801" stroke-miterlimit="10" d="M393,362.8c0,0,18.1,56.2,43.1,56.2c13.2,0,21.7-22.7,26.4-32c9-18.1,16.8-37.6,29.8-53.3c6.2-7.4,15.4-15.8,26-15.5c11.6,0.2,20,11.4,26.9,19.5c9.5,11.4,18,23.8,25.6,36.6"/></g><polyline fill="none" stroke="#000000" stroke-width="11.9852" stroke-miterlimit="10" points="570.7,365.6 598.7,365.6 598.7,100.2 361.3,100.2 361.3,365.6 392.6,365.6"/></g><g><text x="479.5" y="175" dominant-baseline="middle" text-anchor="middle" font-size="100">${this.transferMass}</text></g></symbol>`,
                    height: 3,
                    width: 2
                }
            } else {
                return {
                    id: "ftl",
                    svg: `<symbol id="svg_ftl" viewBox="18.5 -180.5 922 922"><g><rect x="264.5" y="65.5" fill="white" stroke="#000000" stroke-width="29" stroke-miterlimit="10" width="430" height="430"/><path fill="none" stroke="#000000" stroke-width="28.507" stroke-miterlimit="10" d="M265.4,260.8c0,0,43.9,136,104.2,136 c31.9,0,52.6-54.9,63.8-77.5c21.7-43.8,40.7-91,72.1-129c14.9-18,37.3-38.2,62.9-37.6c28.1,0.6,48.5,27.5,65,47.1 c23.1,27.5,43.5,57.6,61.9,88.5"/></g></symbol>`,
                    height: 1,
                    width: 1
                }
            }
        }
    }
}