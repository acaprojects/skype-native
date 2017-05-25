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
export type CLRCallback<Result> = (error?: Error, result?: Result) => void;

/**
 * Binding to an asynchronous native action.
 */
export type AsyncBinding<Input, Result> = (input?: Input, callback?: CLRCallback<Result>) => void;

/**
 * Binding to a synchronous native action.
 */
export type SyncBinding<Input, Result> = (input: Input | undefined, synchronous: true) => Result;

/**
 * Possible .NET binding behaviours.
 */
export type Binding<Input, Result> = AsyncBinding<Input, Result> | SyncBinding<Input, Result>;

/**
 * A Node function that can be exposed to CLR for async execution. This will be
 * marshelled into .NET as a Func<object, Task<object>>.
 */
export type CLRProxy<Payload, Result> = (payload: Payload, callback: CLRCallback<Result>) => void;

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

export type CompilableTarget = BaseBindingTarget & { source?: InlineCLRSource };

export type PrecompiledTarget = BaseBindingTarget & { assemblyFile?: CLRAssembly };

export type BindingTarget = CompilableTarget | PrecompiledTarget;

/**
 * Creates a CLR binding for use in Node.
 */
export function bindToCLR<T>(target:
          BindingTarget
        | CLRAssembly
        | InlineCLRSource) {
    return edge.func(target) as T;
}

/**
 * Enclose around a partial binding target to simplify the creation of bindings
 * coming from the same source / with similar requirements.
 */
export function createBinder<T extends BindingTarget>(env: T) {

    const merge = (target: T) => R.merge(env, target) as BindingTarget;

    const bind = <BindingType>(target: T) => bindToCLR<BindingType>(merge(target));

    return {
        /**
         * Create a binding to a synchronous native action.
         */
        sync: <InputType, ResultType>(target: T) => (input?: InputType) =>
            bind<SyncBinding<InputType, ResultType>>(target)(input, true),

        /**
         * Create a binding to an asynchronous native action.
         */
        async: <InputType, ResultType>(target: T) => (input?: InputType) =>
            new Promise<ResultType>((resolve, reject) =>
                bind<AsyncBinding<InputType, ResultType>>(target)(input, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                })
            )
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
export function createCLRProxy<Input, Result>(action: (payload: Input) => void): CLRProxy<Input, Result> {
    return (payload, callback) => {
        action(payload);
        callback();
    };
}
