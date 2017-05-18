/**
 * Checks to see if the current process is executing within an electron app.
 */
export function isElectron() {
    const isDefined = (x: any) => typeof x !== 'undefined';

    const inRenderer = (w: any) =>
        isDefined(w) && w.process && w.process === 'renderer';

    const inBackground = (p: any) =>
        isDefined(p) && p.versions && !!p.versions.electron;

    return inRenderer(window) || inBackground(process);
}
