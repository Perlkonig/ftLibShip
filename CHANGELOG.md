# Change log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.2.1] - 2022-12-30

### Fixed

* Fixed long-range kgun glyphs to have black backgrounds instead of white. (Thank you, @shadowmouse!)

## [v1.2.0] - 2022-12-30

### Added

* Added a boolean `civilian` flag that changes the number of built-in DCPs (1/50 mass as opposed to 1/20).

### Changed

* Added a base font to the rendered SSD (Fira Sans).
* The `evaluate` function now flags duplicate IDs.

### Fixed

* Fixed a display bug where bays of different masses all showed the same capacity.

## [v1.1.0] - 2022-11-12

### Added

* Added `invaders` property to track boarding parties.
* Added `renderSvg` and `renderUri` functions to produce on-demand linear SSDs, including embedded styles and text resizing (in-browser use only).

## [v1.0.2] - 2022-10-06

### Fixed

* Fixed a display bug I introduced when you have screens of different explicit levels.

## [v1.0.1] - 2022-10-05

### Added

* Somehow "pulsers" never made it into the schema! Added them.
* You can now explicitly assert the level of a specific defensive screen system. I read the rules as saying the number of individual systems determined your screen level (maxing out at 2), but there are other compatible interpretations. Setting the level as `undefined` uses the level 2 glyphs but the level 1 points. Explicitly setting the level will adjust both the glyph and the points.
* Added gameplay-only fields to fighters so their form is codified (`number` and `skill`).
* Added a `uuid` field to the schema for the use of other tools. It's not needed at the building phase, just at the gameplay phase.
* Added a `silhouette` field to the schema.

### Fixed

* Plasma bolt launchers are now correctly restricted to one per fifty mass.

## [v1.0.0] - 2022-09-24

* Initial release of the standalone code. Verified working with the ship builder.
* Some minor mechanical corrections were made to the schema.
* Validation and evaluation code added to the root module.
* Unit test scaffolding in place, but coverage is minimal.
