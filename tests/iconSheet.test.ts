import { expect } from "chai";
import "mocha";

import {
    GROUP_ORDER,
    iconSheetEntries,
    iconSheetEntryCount,
    renderIconSheet,
    wrapIconSheetLabel,
} from "../src/lib/iconSheet.js";

describe("renderIconSheet", () => {
    it("returns valid SVG", () => {
        const svg = renderIconSheet();
        expect(svg).to.include("<svg");
        expect(svg).to.include("</svg>");
    });

    it("contains expected group headers", () => {
        const svg = renderIconSheet();
        for (const group of GROUP_ORDER) {
            expect(svg).to.include(group);
        }
    });

    it("sorts fighter type labels alphabetically within the fighter group", () => {
        const entries = iconSheetEntries().filter(
            (e) => e.group === "Fighter bays and wings" && e.label.startsWith("Hangar Bay —")
        );
        expect(entries.length).to.be.greaterThan(1);
        const labels = entries.map((e) => e.label);
        const sorted = [...labels].sort((a, b) => a.localeCompare(b));
        expect(labels).to.deep.equal(sorted);
    });

    it("has a stable minimum entry count", () => {
        expect(iconSheetEntryCount()).to.be.greaterThan(120);
    });

    it("assigns unique top-level symbol ids in defs", () => {
        const svg = renderIconSheet();
        const ids = [...svg.matchAll(/<symbol id="(icon_\d+)"/g)].map(
            (m) => m[1]
        );
        expect(ids.length).to.equal(iconSheetEntryCount());
        expect(ids.length).to.equal(new Set(ids).size);
    });

    it("wraps long labels onto multiple lines", () => {
        const lines = wrapIconSheetLabel(
            "Advanced Area Defensive Screen - Level 1"
        );
        expect(lines.length).to.be.greaterThan(1);
        expect(lines.every((line) => line.length <= 12)).to.equal(true);
    });

    it("renders multi-line labels with tspans", () => {
        const svg = renderIconSheet();
        expect(svg).to.include("<tspan");
        expect(svg).to.match(/viewBox="0 0 \d+ (\d+)"/);
        const height = Number(svg.match(/viewBox="0 0 \d+ (\d+)"/)![1]);
        expect(height).to.be.greaterThan(3000);
    });
});
