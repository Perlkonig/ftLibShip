# Change log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

* Added gameplay-only fields to fighters so their form is codified (`number` and `skill`).
* Somehow "pulsers" never made it into the schema! Added them.
* Added a `uuid` field to the schema for the use of other tools. It's not needed at the building phase, just at the gameplay phase.
* Added a `silhouette` field to the schema.

### Fixed

* Plasma bolt launchers are now correctly restricted to one per fifty mass.

## [v1.0.0] - 2022-09-24

* Initial release of the standalone code. Verified working with the ship builder.
* Some minor mechanical corrections were made to the schema.
* Validation and evaluation code added to the root module.
* Unit test scaffolding in place, but coverage is minimal.
