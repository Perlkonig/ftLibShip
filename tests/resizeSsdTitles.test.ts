import { expect } from "chai";
import "mocha";

import {
    buildEmbeddedResizeScript,
    buildFleetHtmlResizeScript,
    computeFitScale,
    parseSsdViewBox,
    SSD_LAYOUT_CELLSIZE,
} from "../src/lib/resizeSsdTitles.js";
import { renderSvg } from "../src/index.js";
import type { FullThrustShip } from "../src/schemas/ship.js";

const validTacoma = `{"hull":{"points":15,"rows":4,"stealth":"0","streamlining":"none"},"armour":[],"systems":[{"name":"drive","thrust":6,"advanced":false,"id":"CX-A9"},{"name":"ftl","advanced":false,"id":"O_hFB"},{"name":"fireControl","id":"1lIra"},{"name":"fireControl","id":"z8Ahb"},{"name":"screen","id":"xJc7e"}],"weapons":[{"name":"pds","id":"zkCHa"},{"name":"pds","id":"kRzGt"},{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"U66Pl"},{"name":"beam","class":1,"leftArc":"F","numArcs":6,"id":"rnlPA"},{"name":"beam","class":2,"leftArc":"AP","numArcs":3,"id":"pxn5M"},{"name":"beam","class":2,"leftArc":"F","numArcs":3,"id":"Y174V"},{"name":"beam","class":2,"leftArc":"FP","numArcs":3,"id":"eySY3"}],"ordnance":[],"extras":[],"fighters":[],"mass":50,"class":"Tacoma Class Light Cruiser","name":"Aaron","points":167,"cpv":142,"notes":"","orientation":"alpha"}`;

describe("resizeSsdTitles", () => {
    it("computeFitScale shrinks when text overflows width", () => {
        const scale = computeFitScale(
            { x: 10, width: 500, height: 40 },
            200,
            SSD_LAYOUT_CELLSIZE,
            false
        );
        expect(scale).to.be.closeTo((200 * 0.9) / 500, 0.001);
    });

    it("computeFitScale returns null for stats when text fits", () => {
        const scale = computeFitScale(
            { x: 10, width: 100, height: 20 },
            200,
            SSD_LAYOUT_CELLSIZE,
            true
        );
        expect(scale).to.equal(null);
    });

    it("parseSsdViewBox derives pxWidth from viewBox", () => {
        const svg = {
            getAttribute: (name: string) =>
                name === "viewBox" ? "-1 -1 402 502" : null,
        } as SVGSVGElement;
        const parsed = parseSsdViewBox(svg);
        expect(parsed.pxWidth).to.equal(400);
        expect(parsed.cellsize).to.equal(SSD_LAYOUT_CELLSIZE);
    });

    it("renderSvg marks nameplate and stats with data-ft-role", () => {
        const ship = JSON.parse(validTacoma) as FullThrustShip;
        ship.class =
            "Extremely Long Class Name That Should Not Fit On One Line";
        ship.name = "Also An Unreasonably Long Ship Name For Testing";
        const svg = renderSvg(ship);
        expect(svg).to.include('data-ft-role="nameplate"');
        expect(svg).to.include('data-ft-role="stats"');
        expect(svg).to.include('data-ft-orig-x="');
        expect(svg).to.include('data-ft-orig-y="');
    });

    it("buildEmbeddedResizeScript uses data-ft-role and document.fonts.ready", () => {
        const script = buildEmbeddedResizeScript();
        expect(script).to.include('data-ft-role="nameplate"');
        expect(script).to.include('data-ft-role="stats"');
        expect(script).to.include("document.fonts.ready");
        expect(script).to.include("getBBox");
        expect(script).to.include('addEventListener("resize"');
    });

    it("buildFleetHtmlResizeScript resizes all embedded SVGs", () => {
        const script = buildFleetHtmlResizeScript();
        expect(script).to.include('querySelectorAll("svg")');
        expect(script).to.include("resizeSsdTitles");
        expect(script).to.include("document.fonts.ready");
    });
});
