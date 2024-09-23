# Change log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.4.0] - 2024-09-29

### Changed

* Fundamentally changed the way SVGs are structured (primarily the ID fields) to ensure uniqueness when presenting multiple SSDs on the same page.

## [2.3.0] - 2024-06-14

### Added

* Added `flawed` property. Can only be applied to ships of mass 60+. Discounts points by 20% (see *Continuum* rules, page 113).

### Fixed

* Fixed a math problem that sometimes caused the bottom of an SSD to get cut off.

### Changed

* Moved the plate resizing into the `onload` event of the tag so hopefully it will trigger in more scenarios.
* Expanded K-guns to support arbitrarily high classes.

## [2.2.0] - 2023-05-11

### Added

* Implemented the additional render options. You can now render ships with armour, hull, and system damage (including core systems).
* Added a `facingArc` property to the turret system. When rendered, the turret's left-most arc is rotated to the `facingArc` position, and all contained weapon arcs are rotated the difference between `leftArc` and `facingArc`.

## [v2.1.0] - 2023-04-29

### Changed

* Normalized all the ordnance systems so you can select which three arcs the launcher targets. This change should be backwards compatible.

### Fixed

* Fixed a schema bug that would have caused ships using antimatter missiles to fail to validate. Obviously it's not a popular system! :)
* The rules have some special "discounts" for some weapons (i.e., beams, Gatling batteries, and twin particle arrays) if they select one of the pairs of "broadside" arcs. While not explicit, it is logical that this only applies in alpha orientation. So the discount and arc auto-selection for those particular weapons have been disabled for ships in beta orientation.

## [v2.0.4] - 2023-04-25

### Added

* Added a fourth "Hold or Berth" option called "Tender Bay" (see page 89 of the *Continuum* rules). It looks and works exactly the same as a "Boat Bay" but costs points.
* Added the option to add FTL tug capacity to any ship.

## [v2.0.3] - 2023-04-16

### Added

* Added the vapour shroud just for the sake of completion. It was the only thing keeping me from building Phalon ships.

### Changed

* Changed the base SVG font to Roboto as it's smaller and works better when embedded.

## [v2.0.2] - 2023-04-14

### Fixed

* I had simply assumed that the maximum amount of armour you could have in any given row was the width of the top row of hull boxes; however, the *Fleet Book 1* rules mention no such restriction, and there are ships in the book that break this rule. The builder will now let you add unlimited armour to any given row.
* The minimum mass limitation of defensive screens, outlined in *Fleet Book 1*, is finally applied.

## [v2.0.1] - 2023-04-08

### Fixed

* Area defense systems now render properly in Beta orientation.

## [2.0.0] - 2023-04-07

### BREAKING CHANGE

Bays have been reworked so the `capacity` property is indeed as described. The mass is calculated by using the ratios given in the rules. But a `ratio` property has also been added so you can customize the mass-to-capacity ratio in a given scenario. The number displayed on the SSD is the capacity of the bay, and the mass is calculated by multiplying the capacity by the ratio.

If you have any saved ships that include bays, load them, correct the capacity, and resave.

### Added

* New `orientation` property lets you now choose "beta" orientation, where all firing arcs are rotated 30 degrees clockwise. All three forward arcs fire starboard and all three aft arcs fire port.

### Fixed

* CPV now correctly incorporates hull integrity. (Thanks, @mandalon!)

## [v1.3.1] - 2023-01-16

### Fixed

* Fixed the NPV calculation to include the ship's base mass.

## [v1.3.0] - 2022-12-31

### Added

* Added the "boat bay," intended to carry light non-combat vehicles like shuttles, dropships, and survey craft (see *Continuum*, p. 110). I'm sorry, but gunboats themselves are still unsupported.
* Added "assault shuttle" to the list of available fighters (see *Continuum*, pp. 75–76). The builder will allow robot assault shuttles, but they are really only legal if your universe allows purely robotic boarding parties. Human boarders cannot access a robotic fighter rack.

### Fixed

* There are some fighter combinations that are not valid (e.g., light fighters can't have the "heavy" modification). Checking invalid boxes will now automatically uncheck the box.

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
