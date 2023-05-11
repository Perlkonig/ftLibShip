# Full Thrust Ship Library

This is a TypeScript library representing the schema/type for a Full Thrust ship description along with utilities for validating and graphically rendering it. It is made to be reused by other tools, right now just the [Full Thrust Ship Builder](https://github.com/Perlkonig/ftShipBuilder), which is now live.

## Basic Usage

This library is intended for three primary uses:

1)  The schema is the authoritative description of what a "ship" can and should contain.
2)  The `validate` and `evaluate` functions let you ensure a ship meets the minimum criteria.
3)  The `render` function will produce a consistent, readable, high-quality SVG of any given ship.

### Schema

In TypeScript, one can simply import the `.d.ts` file:

```ts
import type { FullThrustShip } from "ftlibship";
const shipList: FullThrustShip[] = [];
```

If working in any other language, look for tools that let you work with JSON Schema directly.

### Validation

There are two related validation functions. You only need one of them.

`validate(json: string)` takes the JSON as a string, validates it against the schema, and then runs the `evaluate(ship: FullThrustShip)` function on the parsed JSON. But if you've already parsed your JSON, you can run the `evaluate(ship: FullThrustShip)` function independently.

These functions return objects matching the following interfaces:

```ts
export interface IEvaluation {
    mass: number;
    points: number;
    cpv: number;
    errors: EvalErrorCode[];
}

export interface IValidation {
    valid: boolean;
    code?: ValErrorCode;
    ajvErrors?: Ajv.ErrorObject[];
    evalErrors?: EvalErrorCode[];
}

export enum ValErrorCode {
    BadJSON="BADJSON",
    BadConstruction="BADCONSTRUCTION",
    PointsMismatch="POINTSMISMATCH",
}

export enum EvalErrorCode {
    NoMass="NOMASS",
    BadMass="BADMASS",
    LowHull="LOWHULL",
    OverMarine="OVERMARINE",
    OverDCP="OVERDCP",
    OverCrew="OVERCREW",
    OverSpinal="OVERSPINAL",
    OverTurret="OVERTURRET",
    OverMass="OVERMASS",
    OverPBL="OVERPBL",
    DblUID="DblUID",
}
```

So a `validate` is considered passed if `valid` is `true`. An `evaluate` is considered passed if `errors` is empty.

### Rendering

Two rendering functions are provided:

* `renderSvg(ship: FullThrustShip, opts: RenderOpts = {}): string | undefined` takes a ship object and returns the raw SVG code, which is designed to render correctly in all modern browsers.
* `renderUri(ship: FullThrustShip, opts: RenderOpts = {}): string | undefined` does the same thing but returns the SVG as a [data URI](https://en.wikipedia.org/wiki/Data_URI_scheme), suitable for use in `<img>` and `<button>` tags.

The rendering options are as follows:

```ts
export interface RenderOpts {
    // Amount of hull damage done
    damage?: number;
    // The amount of damage done to each layer of armour
    // The first row is the innermost layer
    // First element is regular armour, second is regenerative armour
    armour?: [number,number][]
    // List of uids of disabled systems
    disabled?: SystemID[];
    // List of uids of destroyed systems
    destroyed?: SystemID[];
}
```

To disable core systems, add one of the following strings to `disabled`: `_coreBridge`, `_coreLife`, or `_corePower`. Disabled systems are greyed out. Destroyed systems are almost invisible. Damage is indicated by simply blacking out the hull or armour boxes.

For now, invaders are tracked in the ship JSON itself. I realize this is an inconsistency. I'm considering my options.
