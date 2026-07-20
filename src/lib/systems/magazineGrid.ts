import type { ISystemSVG } from "../svgLib.js";
import fnv from "fnv-plus";

export const SALVO_MISSILE_SYMBOL = `<symbol id="_internalSalvo" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="white" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol>`;

export const SALVO_ER_SYMBOL = `<symbol id="_internalSalvoER" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="black" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol>`;

export const SALVO_TWOSTAGE_SYMBOL = `<symbol id="_internalSalvoTwoStage" viewBox="405 279 150 150"><polygon fill="none" stroke="#000000" stroke-width="5" stroke-miterlimit="10" points="433.7,375.5 480,285.5 526.3,375.5 495.4,361.7 526.3,420.5 480,390.3 433.7,420.5 464,361.7"/></symbol>`;

const BOARDING_TORPEDO_PATHS = `<polygon fill="black" points="5,0 6.8,5.5 3.2,5.5"/><rect x="3.2" y="5.5" width="3.6" height="5.5" fill="black"/><polygon fill="black" points="3.2,11 1,14 3.2,11"/><polygon fill="black" points="6.8,11 9,14 6.8,11"/>`;

export const BOARDING_TORPEDO_SYMBOL = `<symbol id="_internalBoardingTorpedo" viewBox="0 0 10 14">${BOARDING_TORPEDO_PATHS}</symbol>`;

export function buildMagazineGridGlyph(
    capacity: number,
    idPrefix: string,
    hashseed: string | undefined,
    internalSymbolId: string,
    internalSymbolSvg: string,
    rounded = false
): ISystemSVG {
    let cap = capacity;
    if (cap > 9) {
        cap = 9;
    }
    if (cap < 1) {
        cap = 1;
    }

    let cols: number;
    let gridW: number;
    let gridH: number;
    let width: number;
    let height: number;

    if (cap <= 2) {
        cols = cap;
        gridW = 20;
        gridH = 10;
        width = 2;
        height = 1;
    } else if (cap === 3) {
        cols = 3;
        gridW = 30;
        gridH = 10;
        width = 3;
        height = 1;
    } else if (cap <= 6) {
        cols = 3;
        gridW = 30;
        gridH = 20;
        width = 3;
        height = 2;
    } else {
        cols = 3;
        gridW = 30;
        gridH = 30;
        width = 3;
        height = 3;
    }

    const rectAttrs = rounded ? ` rx="2" ry="2"` : "";
    let uses = "";
    for (let i = 0; i < cap; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        uses += `<use href="#${internalSymbolId}" x="${col * 10}" y="${row * 10}" width="10" height="10" />`;
    }

    const id =
        hashseed === undefined
            ? `${idPrefix}${cap}`
            : fnv.hash(`${idPrefix}${cap}`).hex();
    const viewW = gridW + 2;
    const viewH = gridH + 2;

    return {
        id,
        svg: `<symbol id="${id}" viewBox="-1 -1 ${viewW} ${viewH}"><defs>${internalSymbolSvg}</defs><rect x="0" y="0" width="${gridW}" height="${gridH}" stroke="black" fill="white"${rectAttrs} />${uses}</symbol>`,
        width,
        height,
    };
}

export function individualSalvoGlyph(
    hashseed: string | undefined,
    modifier: "none" | "er" | "twostage"
): ISystemSVG {
    if (modifier === "er") {
        const id =
            hashseed === undefined
                ? `individualSalvoER`
                : fnv.hash(`individualSalvoER`).hex();
        return {
            id,
            svg: `<symbol id="${id}" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="black" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol>`,
            width: 1,
            height: 1,
        };
    }
    if (modifier === "twostage") {
        const id =
            hashseed === undefined
                ? `individualSalvoMS`
                : fnv.hash(`individualSalvoMS`).hex();
        return {
            id,
            svg: `<symbol id="${id}" viewBox="405 279 150 150"><polygon fill="none" stroke="#000000" stroke-width="5" stroke-miterlimit="10" points="433.7,375.5 480,285.5 526.3,375.5 495.4,361.7 526.3,420.5 480,390.3 433.7,420.5 464,361.7"/></symbol>`,
            width: 1,
            height: 1,
        };
    }
    const id =
        hashseed === undefined
            ? `individualSalvo`
            : fnv.hash(`individualSalvo`).hex();
    return {
        id,
        svg: `<symbol id="${id}" viewBox="430.5 148 99 99"><polygon stroke="#000000" fill="white" stroke-width="4.1006" stroke-miterlimit="10" points="480,161.2 501.3,237 480,223.7 458.6,237"/></symbol>`,
        width: 1,
        height: 1,
    };
}

export function individualBoardingTorpedoGlyph(
    hashseed: string | undefined
): ISystemSVG {
    const id =
        hashseed === undefined
            ? `individualBoardingTorpedo`
            : fnv.hash(`individualBoardingTorpedo`).hex();
    return {
        id,
        svg: `<symbol id="${id}" viewBox="0 0 10 14">${BOARDING_TORPEDO_PATHS}</symbol>`,
        width: 1,
        height: 1,
    };
}

export function salvoMagazineGridGlyph(
    capacity: number,
    modifier: "none" | "er" | "twostage",
    hashseed: string | undefined
): ISystemSVG {
    if (modifier === "er") {
        return buildMagazineGridGlyph(
            capacity,
            "magazineER",
            hashseed,
            "_internalSalvoER",
            SALVO_ER_SYMBOL
        );
    }
    if (modifier === "twostage") {
        return buildMagazineGridGlyph(
            capacity,
            "magazineTwoStage",
            hashseed,
            "_internalSalvoTwoStage",
            SALVO_TWOSTAGE_SYMBOL
        );
    }
    return buildMagazineGridGlyph(
        capacity,
        "magazine",
        hashseed,
        "_internalSalvo",
        SALVO_MISSILE_SYMBOL
    );
}
