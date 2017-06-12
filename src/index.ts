import { MockClient } from './mock-client';
import { LiveClient } from './live-client';
import { SkypeClient } from './skype-client';
import { attempt } from './util';

/**
 * Safe references to some of the Globals that may exist.
 */
const runtime = {
    window: typeof window !== 'undefined' ? window : {} as any,
    process: typeof process !== 'undefined' ? process : {} as any
};

/**
 * Safely check an element of the runtime env that may result in a reference
 * error.
 */
function attemptLookup<T>(envCheck: () => T, fallback: T) {
    const refError = (e: Error) => e instanceof ReferenceError;
    return attempt(envCheck, () => fallback, refError);
}

/**
 * Checks if we're running on a supported platform for the SDK interop.
 */
export function isSupportedPlatform(environment = runtime) {
    const supported = () => environment.process.platform === 'win32';
    return attemptLookup(supported, false);
}

/**
 * Check if the mock client should be used in place of the live bindings.
 */
export function useMock(environment = runtime) {
    const mock = () => !!environment.process.env.MOCK_SKYPE_CLIENT;
    return attemptLookup(mock, true);
}

const client = useMock() || !isSupportedPlatform() ? MockClient : LiveClient;

export const skype: SkypeClient = client.bind();
