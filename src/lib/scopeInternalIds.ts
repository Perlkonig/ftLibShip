const escapeRegex = (value: string): string =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const scopeInternalIds = (outerId: string, svg: string): string => {
    const internalIds = new Set<string>();
    for (const m of svg.matchAll(/id="(_internal[^"]+)"/g)) {
        internalIds.add(m[1]);
    }
    let result = svg;
    for (const internalId of [...internalIds].sort(
        (a, b) => b.length - a.length
    )) {
        const scoped = `${outerId}${internalId}`;
        const idPattern = new RegExp(`id="${escapeRegex(internalId)}"`, "g");
        const hrefPattern = new RegExp(
            `href="#${escapeRegex(internalId)}"`,
            "g"
        );
        result = result.replace(idPattern, `id="${scoped}"`);
        result = result.replace(hrefPattern, `href="#${scoped}"`);
    }
    return result;
};
