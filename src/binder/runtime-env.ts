/**
 * Safe references to some of the Globals that may exist.
 */
const runtime = {
    window: typeof window !== 'undefined' ? window : {} as any,
    process: typeof process !== 'undefined' ? process : {} as any
};

/**
 * Attempt to run a function that may fail due to a ReferenceError.
 */
function attempt<T>(func: () => T, fallback: T): T {
    try {
        return func();
    }
    catch (e) {
        if (e instanceof ReferenceError) {
            return fallback;
        } else {
            throw e;
        }
    }
}

/**
 * Checks to see if the current process is executing within an electron app.
 */
export function isElectron(environment = runtime) {
    const inRenderer = () => environment.window.process === 'renderer';

    const inBackground = () => !!environment.process.versions.electron;

    return attempt(inRenderer, false) || attempt(inBackground, false);
}

/**
 * Checks if we're running on a supported platform for the SDK interop.
 */
export function isSupportedPlatform(environment = runtime) {
    const supported = () => environment.process.platform === 'win32';

    return attempt(supported, false);
}

/**
 * Check if the mock client should be used in place of the live bindings.
 */
export function useMock(environment = runtime) {
    const mock = () => !!environment.process.env.MOCK_SKYPE_CLIENT;

    return attempt(mock, true);
}
