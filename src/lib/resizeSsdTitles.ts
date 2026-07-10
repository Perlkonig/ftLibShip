/** Cell size used by renderSvg linear SSD layout. */
export const SSD_LAYOUT_CELLSIZE = 50;

export interface BBox {
    x: number;
    width: number;
    height: number;
}

/** Pure fit-scale helper (testable without a DOM). */
export function computeFitScale(
    bb: BBox,
    pxWidth: number,
    cellsize: number,
    onlyIfOverflow: boolean
): number | null {
    if (onlyIfOverflow && bb.x + bb.width <= pxWidth) {
        return null;
    }
    const widthTransform = (pxWidth * 0.9) / bb.width;
    const heightTransform = (cellsize * 1.5 * 0.9) / bb.height;
    const value =
        widthTransform < heightTransform ? widthTransform : heightTransform;
    if (!isFinite(value)) {
        return null;
    }
    return value;
}

export function parseSsdViewBox(svgRoot: SVGSVGElement): {
    pxWidth: number;
    cellsize: number;
} {
    const viewBox = svgRoot.getAttribute("viewBox");
    if (!viewBox) {
        return { pxWidth: 0, cellsize: SSD_LAYOUT_CELLSIZE };
    }
    const parts = viewBox.split(/\s+/).map(Number);
    return { pxWidth: parts[2] - 2, cellsize: SSD_LAYOUT_CELLSIZE };
}

function resetText(textEl: SVGTextElement): void {
    const origX = parseFloat(
        textEl.getAttribute("data-ft-orig-x") ??
            textEl.getAttribute("x") ??
            "0"
    );
    const origY = parseFloat(
        textEl.getAttribute("data-ft-orig-y") ??
            textEl.getAttribute("y") ??
            "0"
    );
    textEl.removeAttribute("transform");
    textEl.setAttribute("x", String(origX));
    textEl.setAttribute("y", String(origY));
}

function applyFit(
    textEl: SVGTextElement,
    pxWidth: number,
    cellsize: number,
    onlyIfOverflow: boolean
): void {
    resetText(textEl);
    const bb = textEl.getBBox();
    const value = computeFitScale(bb, pxWidth, cellsize, onlyIfOverflow);
    if (value === null) {
        return;
    }
    textEl.setAttribute(
        "transform",
        `matrix(${value}, 0, 0, ${value}, 0, 0)`
    );
    const origX = parseFloat(
        textEl.getAttribute("data-ft-orig-x") ??
            textEl.getAttribute("x") ??
            "0"
    );
    const origY = parseFloat(
        textEl.getAttribute("data-ft-orig-y") ??
            textEl.getAttribute("y") ??
            "0"
    );
    textEl.setAttribute("x", String(origX / value));
    textEl.setAttribute("y", String(origY / value));
}

/** Resize nameplate and stats text within a rendered SSD SVG. */
export function resizeSsdTitles(svgRoot: SVGSVGElement): void {
    const { pxWidth, cellsize } = parseSsdViewBox(svgRoot);
    if (pxWidth <= 0) {
        return;
    }
    const namePlate = svgRoot.querySelector('[data-ft-role="nameplate"]');
    if (namePlate instanceof SVGTextElement) {
        applyFit(namePlate, pxWidth, cellsize, false);
    }
    const stats = svgRoot.querySelector('[data-ft-role="stats"]');
    if (stats instanceof SVGTextElement) {
        applyFit(stats, pxWidth, cellsize, true);
    }
}

/**
 * Shared resize logic as browser JS (embedded in SVG and HTML export).
 * Kept as a string so standalone SVG and fleet HTML use identical behaviour.
 */
const RESIZE_SSD_TITLES_JS = `
function resizeSsdTitles(svgRoot) {
  var viewBox = svgRoot.getAttribute("viewBox");
  if (!viewBox) return;
  var parts = viewBox.split(/\\s+/).map(Number);
  var pxWidth = parts[2] - 2;
  var cellsize = ${SSD_LAYOUT_CELLSIZE};
  if (pxWidth <= 0) return;
  function resetText(textEl) {
    var origX = parseFloat(textEl.getAttribute("data-ft-orig-x") || textEl.getAttribute("x") || "0");
    var origY = parseFloat(textEl.getAttribute("data-ft-orig-y") || textEl.getAttribute("y") || "0");
    textEl.removeAttribute("transform");
    textEl.setAttribute("x", String(origX));
    textEl.setAttribute("y", String(origY));
  }
  function fitText(textEl, onlyIfOverflow) {
    resetText(textEl);
    var bb = textEl.getBBox();
    if (onlyIfOverflow && bb.x + bb.width <= pxWidth) return;
    var widthTransform = (pxWidth * 0.9) / bb.width;
    var heightTransform = (cellsize * 1.5 * 0.9) / bb.height;
    var value = widthTransform < heightTransform ? widthTransform : heightTransform;
    if (!isFinite(value)) return;
    textEl.setAttribute("transform", "matrix(" + value + ", 0, 0, " + value + ", 0, 0)");
    var origX = parseFloat(textEl.getAttribute("data-ft-orig-x") || textEl.getAttribute("x") || "0");
    var origY = parseFloat(textEl.getAttribute("data-ft-orig-y") || textEl.getAttribute("y") || "0");
    textEl.setAttribute("x", String(origX / value));
    textEl.setAttribute("y", String(origY / value));
  }
  var namePlate = svgRoot.querySelector('[data-ft-role="nameplate"]');
  if (namePlate) fitText(namePlate, false);
  var stats = svgRoot.querySelector('[data-ft-role="stats"]');
  if (stats) fitText(stats, true);
}
`.trim();

/** Inline script for standalone .svg files opened directly in a browser. */
export function buildEmbeddedResizeScript(): string {
    return `<script type="text/javascript"><![CDATA[
${RESIZE_SSD_TITLES_JS}
(function() {
  function run() {
    var svg = document.documentElement;
    if (svg && svg.namespaceURI === "http://www.w3.org/2000/svg") {
      resizeSsdTitles(svg);
    }
  }
  if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
    document.fonts.ready.then(run);
  } else {
    run();
  }
  if (typeof window !== "undefined") {
    window.addEventListener("resize", run);
  }
})();
]]></script>`;
}

/** Page-level script for fleet HTML export (multiple embedded SVGs). */
export function buildFleetHtmlResizeScript(): string {
    return `<script>
${RESIZE_SSD_TITLES_JS}
(function() {
  function runAll() {
    document.querySelectorAll("svg").forEach(function(svg) { resizeSsdTitles(svg); });
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(runAll);
  } else {
    runAll();
  }
  window.addEventListener("resize", runAll);
})();
</script>`;
}
