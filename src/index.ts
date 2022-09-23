export * from "./lib/svgLib.js";
export * from "./lib/hull.js";
export * from "./lib/systems/index.js";
export type { FullThrustShip } from "./schemas/ship.js";

export const validate = (shipJson: string): boolean => {
    return true;
}
