export * from "./lib/svgLib.js";
export * as hull from "./lib/hull.js";
export * as systems from "./lib/systems/index.js";
export * as hexes from "./lib/genHex.js";
export * as arcs from "./lib/genArcs.js";
export type { FullThrustShip } from "./schemas/ship.js";

export const validate = (shipJson: string): boolean => {
    return true;
}
