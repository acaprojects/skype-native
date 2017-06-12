import { join } from 'path';

/**
 * Resolves a set of paths relative to the curent directory.
 */
export function relative(...path: string[]) {
    return join(__dirname, ...path);
}

/**
 * Safely attempt an function execution that may fail with a runtime error.
 */
export function attempt<T>(func: () => T,
                           fallback: () => T,
                           runFallback: (e: Error) => boolean) {
    try {
        return func();
    } catch (e) {
        const rethrow = () => { throw e; };
        return runFallback(e)
            ? fallback()
            : rethrow();
    }
}
