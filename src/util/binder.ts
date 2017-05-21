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
export function bindToCLR<T extends Binding>(source: string,
                                             references: string[] = [],
                                             typeName = 'StartUp',
                                             methodName = 'Invoke') {
    return edge.func({source, references, typeName, methodName}) as T;
}

/**
 * Enclose around a CLR environment for simplifying the creation of individual
 * bindings.
 */
export function binder(basePath = '', references: string[] = []) {
    // Resolve the path to the relevent C# source
    const sourcePath = (name: string) => join(basePath, `${name}.cs`);

    return {
        /**
         * Create a binding to an asynchronous native action.
         */
        async: (action: string) =>
            bindToCLR<AsyncBinding>(sourcePath(action), references, action),

        /**
         * Create a binding to a synchronous native action.
         */
        sync: (action: string) =>
            (input?: any) =>
                bindToCLR<SyncBinding>(sourcePath(action), references, action)(input, true)
    };
}
