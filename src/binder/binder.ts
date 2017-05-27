import { isElectron } from './runtime-env';

// edge needs to be compiled against a different verion of node to support
// electron. This is still a little messy as we need to pull down both, but at
// least it switches in the relevant version silently.
const edge = isElectron() ? require('electron-edge') : require('edge');

export type Binding<I, O> = AsyncBinding<I, O> & SyncBinding<I, O>;
export type AsyncBinding<I, O> = (input?: I, callback?: Callback<O>) => void;
export type SyncBinding<I, O> = (input: I | undefined, synchronous: true) => O;

export type Callback<T> = (error: Error | null, result?: T) => void;

/**
 * A path to a pre-compiled CLR assembly (*.dll).
 */
export type CLRAssembly = string;

/**
 * A string containing compilable CLR source code or the path to an uncompiled
 * file.
 */
export type CLRSource = string;

/**
 * Base CLR target reference.
 */
export interface BaseBindingTarget {
    /** Typename to link to. If ommitted `StartUp` will be assumed. */
    typeName?: string;

    /** Method to bind to. If ommitted `Invoke` will be assumed. */
    methodName?: string;

    /** External assembly references. */
    references?: CLRAssembly[];
}

/**
 * Reference to a CLR method for compilation at runtime.
 */
export interface CompilableTarget extends BaseBindingTarget { source: CLRSource; }

/**
 * Reference to a precompiled CLR method for binding.
 */
export interface PrecompiledTarget extends BaseBindingTarget { assemblyFile: CLRAssembly; }
export interface PartialPrecompiledTarget extends BaseBindingTarget { assemblyFile?: CLRAssembly; }

/**
 * Valid target that can be used to instantiate a binding for CLR interop.
 */
export type BindingTarget = CompilableTarget | PrecompiledTarget | CLRAssembly | CLRSource;

function bindToCLR<I, O>(target: BindingTarget) {
    return edge.func(target) as Binding<I, O>;
}

/**
 * Create a binding to an asynchronous CLR task.
 *
 * The returned binding allows for invokation and response handling with either
 * the Node callback pattern, or the returned promise.
 */
export function async<I, O>(target: BindingTarget) {
    const binding = bindToCLR<I, O>(target) as AsyncBinding<I, O>;

    // wrap the async binding in a promise if no callback is supplied.
    return (input: I, callback?: Callback<O>) =>
        callback
            ? binding(input, callback)
            : new Promise<O>((y, n) => binding(input, (e, r) => e ? n(e) : y(r)));
}

/**
 * Create a binding to a synchronous CLR task.
 *
 * If the taks cannot be run synchonously an Error will be raised.
 */
export function sync<I, O>(target: BindingTarget) {
    return (input?: I) => bindToCLR<I, O>(target)(input, true);
}
