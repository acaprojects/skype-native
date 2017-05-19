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

/**
 * Checks if we're running on a supported platform for the SDK interop.
 */
export function isSupportedPlatform() {
    return process.platform === 'win32';
}

/**
 * Check if the mock client should be used in place of the live bindings.
 */
export function useMock() {
    return !!process.env.MOCK_SKYPE_CLIENT;
}
