import * as path from 'path';
import * as R from 'ramda';
import { isElectron } from './runtime-env';

// Edge needs to be compiled against a different verion of node to support
// electron. This is still a little messy as we need to pull down both, but at
// least it switches in the relevant version silently.
const edge = isElectron() ? require('electron-edge') : require('edge');

/**
 * A callback function for invokation from .NET.
 */
export type CLRCallback = (error?: any | null, result?: any | null) => void;

/**
 * Binding to an asynchronous native action.
 */
export type AsyncBinding = (input?: any | null, callback?: CLRCallback) => void;

/**
 * Binding to a synchronous native action.
 */
export type SyncBinding = (input: any | null, synchronous: true) => any;

/**
 * Possible .NET binding behaviours.
 */
export type Binding = AsyncBinding | SyncBinding;

/**
 * A Node function that can be exposed to CLR for async execution. This will be
 * marshelled into .NET as a Func<object, Task<object>>.
 */
export type CLRProxy = (payload: any, callback: CLRCallback) => void;

/**
 * A path to a pre-compiled CLR assembly (*.dll).
 */
export type CLRAssembly = string;

/**
 * A string containing compilable CLR source code.
 */
export type InlineCLRSource = string;

/**
 * CLR object path for binding to.
 */
export interface BaseBindingTarget {
    /** Typename to link to. If ommitted `StartUp` will be assumed. */
    typeName?: string;

    /** Method to bind to. If ommitted `Invoke` will be assumed. */
    methodName?: string;

    /** External assembly references. */
    references?: CLRAssembly[];
}

export type PartialCompilableBindingTarget = BaseBindingTarget & { source?: InlineCLRSource };

export type CompilableBindingTarget = BaseBindingTarget & { source: InlineCLRSource };

export type PartialPrecompiledBindingTarget = BaseBindingTarget & { assemblyFile?: CLRAssembly };

export type PrecompiledBindingTarget = BaseBindingTarget & { assemblyFile: CLRAssembly };

export type CompilableTarget = PartialCompilableBindingTarget | CompilableBindingTarget;

export type PrecompiledTarget = PartialPrecompiledBindingTarget | PrecompiledBindingTarget;

export type PartialBindingTarget = PartialCompilableBindingTarget | PartialPrecompiledBindingTarget;

export type BindingTarget = CompilableBindingTarget | PrecompiledBindingTarget;

/**
 * Creates a CLR binding for use in Node.
 */
export function bindToCLR<T extends Binding>(target:
          CompilableBindingTarget
        | PrecompiledBindingTarget
        | CLRAssembly
        | InlineCLRSource) {
    return edge.func(target) as T;
}

/**
 * Enclose around a partial binding target to simplify the creation of bindings
 * coming from the same source / with similar requirements.
 */
export function createBinder<T extends PartialBindingTarget>(env: T) {

    const merge = (target: T) => R.merge(env, target) as BindingTarget;

    const bind = <InputType extends Binding>(target: T) => bindToCLR<InputType>(merge(target));

    return {
        /**
         * Create a binding to a synchronous native action.
         */
        sync: <InputType, OutputType>(target: T) => (input?: InputType) =>
            bind<SyncBinding>(target)(input, true) as OutputType,

        /**
         * Create a binding to an asynchronous native action.
         */
        async: <InputType, OutputType>(target: T) => (input?: InputType) =>
            new Promise<OutputType>((resolve, reject) =>
                bind<AsyncBinding>(target)(input, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                })
            ),

        /**
         * Retrieve the partial environment in use.
         */
        bindingEnv: () => env

    };
}

/**
 * Wrap a function into a form that can be marshalled into .NET for execution
 * there.
 *
 * Functions passed to .NET must be of a prescriptive async pattern for edge
 * to marshall them neatly. This simply turns a Node function of arity 1 into
 * the ordaned format.
 */
export function createCLRProxy<T>(action: (payload: T) => void): CLRProxy {
    return (payload, callback) => {
        action(payload);
        callback();
    };
}
