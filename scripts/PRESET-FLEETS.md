# Preset fleets (`preset-fleets.json`)

## Source

Ship designs and baseline **`points` / `cpv` / `mass`** were taken from published *Full Thrust* fleet books. Those book totals describe the hull and installed systems **without** priced fighter wing loadouts.

For play-ready presets, each carrier (and similar) was equipped in JSON with **`fighters[]`** entries—typically **standard** wings—linked to hangar ids.

## Totals today

After library **5.0.0**, each ship’s stored `points` and `cpv` are:

**fleet book value + equipped `fighters[]` wing costs** (type and mods),

as computed by `evaluate()` / `fighterWingTotals()`. They will **not** match the printed fleet list if the list omits hangar contents.

Mass is unchanged by fighter wings (wings have 0 mass in this ruleset).

## Maintaining presets

When changing designs or fighter loadouts:

1. Run `npm run refresh-preset-fleet-totals` — it asserts each ship’s new `evaluate()` totals equal **previous JSON `points`/`cpv` + wing delta only** before writing (guards against unrelated evaluate drift).
2. Run `npm test` (includes preset validation and infra+wings checks).
