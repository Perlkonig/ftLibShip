# Full Thrust Ship Library

This is a TypeScript library representing the schema/type for a Full Thrust ship description along with utilities for validating and graphically rendering it. It is made to be reused by other tools, right now just the [Full Thrust Ship Builder](https://github.com/Perlkonig/ftShipBuilder), which is now live.

## Basic Usage

This library is intended for three primary uses:

1.  The schema is the authoritative description of what a "ship" can and should contain.
2.  The `validate` and `evaluate` functions let you ensure a ship meets the minimum criteria.
3.  The `render` function will produce a consistent, readable, high-quality SVG of any given ship.

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
    BadJSON = "BADJSON",
    BadConstruction = "BADCONSTRUCTION",
    PointsMismatch = "POINTSMISMATCH",
}

export enum EvalErrorCode {
    NoMass = "NOMASS",
    BadMass = "BADMASS",
    LowHull = "LOWHULL",
    OverMarine = "OVERMARINE",
    OverDCP = "OVERDCP",
    OverCrew = "OVERCREW",
    OverSpinal = "OVERSPINAL",
    OverTurret = "OVERTURRET",
    OverMass = "OVERMASS",
    OverPBL = "OVERPBL",
    DblUID = "DblUID",
    FlawedUnderMass = "FlawedUnderMass",
    UnknownSystem = "UNKNOWNSYSTEM",
}
```

So a `validate` is considered passed if `valid` is `true`. An `evaluate` is considered passed if `errors` is empty.

### Crew factor and DCP availability

`crewFactor(ship)` returns the ship's crew factor from mass (military: 1 per 20 mass; civilian: 1 per 50 mass). This matches the hull-star placement in rendered SSDs.

`dcpAvailability(ship, state?)` reports how many damage control parties are available on this ship. Pass the same `damage`, `disabled`, `destroyed`, `deployed`, and `deployedBuiltinDcp` fields you use for `renderSvg()`.

```ts
import { crewFactor, dcpAvailability, renderSvg } from "ftlibship";

const opts = {
    damage: 2,
    deployed: ["extraDcp1"],
    deployedBuiltinDcp: 1,
};
const dcp = dcpAvailability(ship, opts);
// dcp.available — present builtin stars plus hired DCP not lost or absent
const svg = renderSvg(ship, opts);
```

`dcpAvailability` returns `{ crewFactor, builtin, builtinDeployed, hired, hiredAvailable, hiredDeployed, available }`.

**Deployed (absent friendly):** `deployed` lists system ids of your marines or hired `damageControl` sent to board other ships. `deployedBuiltinDcp` is how many built-in DCP are absent; hull stars grey from the **end** of the damage track so threshold damage from the start hits present stars first. Both reduce `dcpAvailability`.

**Invaders (enemy aboard):** `invaders` lists enemy marines or DCP on **this** ship (Invaders section on the SSD). Display only — does **not** affect `dcpAvailability`.

**Lost vs absent vs enemy:** Hired `damageControl` and `marines` use `disabled`/`destroyed` when permanently lost (instantly gone, not repairable). Use `deployed` when away on a friendly boarding mission. Use `invaders` for enemy parties aboard. This differs from the main drive, where `disabled` means damaged (half thrust) and `destroyed` means thrust 0.

### Rendering

Two rendering functions are provided:

-   `renderSvg(ship: FullThrustShip, opts: RenderOpts = {}): string | undefined` takes a ship object and returns the raw SVG code, which is designed to render correctly in all modern browsers.
-   `renderUri(ship: FullThrustShip, opts: RenderOpts = {}): string | undefined` does the same thing but returns the SVG as a [data URI](https://en.wikipedia.org/wiki/Data_URI_scheme), suitable for use in `<img>` and `<button>` tags.

The rendering options are as follows:

```ts
export interface RenderOpts {
    // Amount of hull damage done
    damage?: number;
    // The amount of damage done to each layer of armour
    // The first row is the innermost layer
    // First element is regular armour damage; second is [regen damaged, regen lost]
    armour?: [number, [number, number]][];
    // List of uids of disabled systems
    disabled?: SystemID[];
    // List of uids of destroyed systems
    destroyed?: SystemID[];
    // Absent friendly marines or hired damageControl (sent to other ships)
    deployed?: SystemID[];
    // Built-in DCP absent; hull stars greyed from end of track
    deployedBuiltinDcp?: number;
    // Enemy marines or DCP aboard this ship (display only)
    invaders?: { type: "marines" | "damageControl"; owner?: string | number }[];
    // Remaining ammunition per mineLayer or magazine id (omitted = full capacity)
    ammunition?: Partial<Record<string, number>>;
}
```

To disable core systems, add one of the following strings to `disabled`: `_coreBridge`, `_coreLife`, or `_corePower`. Disabled systems are greyed out. Destroyed systems are almost invisible. Absent friendly parties (`deployed`, `deployedBuiltinDcp`) are greyed out. Hull and regular armour damage is indicated by blacking out boxes. Regenerative armour uses black for repairable damage and red for permanently lost boxes (left-to-right within each regen row). Enemy boarding parties use `invaders` (not on the ship object). Pass `ammunition` with remaining mine/missile counts per `mineLayer` or `magazine` system id; omitted ids render at full design capacity.

Run `npm run render-demo` after building to write a showcase SVG (`scratch.svg` by default) covering all render options for visual inspection.
