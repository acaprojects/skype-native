import { join } from 'path';
import { isElectron } from './runtime-env';

// Edge needs to be compiled against a different verion of node to support
// electron. This is still a little messy as we need to pull down both, but at
// least it switches in the relevant version silently.
const edge = isElectron() ? require('electron-edge') : require('edge');

/**
 * Event handler for working with asyncronous native calls.
 */
export type BindingCallback = (error: any | null, result: any | null) => void;

/**
 * Binding to an asynchronous native action.
 */
export type AsyncBinding = (input?: any | null, callback?: BindingCallback) => void;

/**
 * Binding to a synchronous native action.
 */
export type SyncBinding = (input: any | null, syncronous: true) => any;

/**
 * Union type of native action bindings.
 */
export type Binding = AsyncBinding | SyncBinding;

/**
 * Creates a CLR binding for use in Node.
 */
export function bindToCLR<T extends Binding>(source: string, references: string[] = []) {
    return edge.func({source, references}) as T;
}

/**
 * Curried methods for creating bindings to a predefined CLR environment.
 */
export function binder(basePath = '', references: string[] = []) {
    return {
        /**
         * Create a binding to an asynchronous native action.
         */
        async: (source: string) =>
            bindToCLR<AsyncBinding>(join(basePath, source), references),

        /**
         * Create a binding to a synchronous native action.
         */
        sync: (source: string) =>
            (input?: any) => bindToCLR<SyncBinding>(join(basePath, source), references)(input, true)
    };
}
