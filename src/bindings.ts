import * as R from 'ramda';
import * as edge from 'edge-ts';
import { relative, attempt } from './util';

// Base function signatures used within the client bindings.
export type Action = () => void;
export type ActionWithArgs<T> = (x: T) => void;
export type Func<T> = () => T;
export type FuncWithArgs<T, U> = (x: T) => U;
export type Predicate<T> = FuncWithArgs<T, boolean>;

export interface EventSubscription<T> {
    callback: (input: T, callback: edge.Callback<void>) => void;
}

/**
 * Binding environmnt for our native libs.
 */
const skypeLib: edge.BindingTarget = {
    assemblyFile: relative('../lib/native/win32', 'SkypeClient.dll'),
    references: [
        relative('../lib/native/win32', 'Microsoft.Lync.Model.dll'),
        'System.Management.dll'
    ],
    typeName: 'SkypeClient.Bindings'
};

/**
 * Create a bindable target from a base binding target (lib or source
 * reference) and method name.
 */
function target(method: string, base: edge.BindingTarget) {
    type Bindable = edge.PrecompiledTarget | edge.CompilableTarget;
    return R.merge(base, {methodName: method}) as Bindable;
}

/**
 * Create a synchronous function binding to a method in the skype client lib.
 */
export function sync<I, O>(method: string) {
    return edge.sync<I, O>(target(method, skypeLib));
}

/**
 * Create an asynchronous funcion binding to a method in the skype client lib.
 */
export function async<I, O>(method: string) {
    return edge.async<I, O>(target(method, skypeLib));
}

/**
 * Create an EventSubscription for parsing into our CLR event bindings.
 */
export function callback<T>(handler: ActionWithArgs<T>,
                            when?: Predicate<T>): EventSubscription<T> {
    const action: ActionWithArgs<T> = when
        ? (x) => when(x) ? handler(x) : undefined
        : handler;
    return { callback: edge.proxy<T, void>(action) };
}

/**
 * Safely attempt an interaction with the native client that may fail (i.e. due
 * to the process not running or user not being authed)
 */
export function attemptInteraction<T>(interaction: Func<T>,
                                      fallback: Func<T>) {
    const invalidState = (e: Error) => e.name === 'SkypeClient.InvalidStateException';
    return attempt(interaction, fallback, invalidState);
}

export interface CallArgs {
    uri: string;
    fullscreen: boolean;
    display: number;
}

export interface JoinArgs {
    url: string;
    fullscreen: boolean;
    display: number;
}

export interface MuteArgs {
    state: boolean;
}

export interface UserDetails {
    uri: string;
    name: string;
}

export interface EventIncomingArgs {
    inviter: UserDetails;
    actions: {
        accept: ActionWithArgs<{fullscreen: boolean, display: number}>,
        reject: Action
    };
}

export interface EventConnectedArgs {
    participants: UserDetails[];
    actions: {
        fullscreen: ActionWithArgs<{display: number}>,
        show: Action,
        hide: Action,
        mute: ActionWithArgs<{state: boolean}>,
        startVideo: Action,
        stopVideo: Action,
        end: Action,
    };
}

/**
 * Skype lib methods that have been bound to Node functions.
 */
export const method = {

    startClient: sync<null, void>('StartClient'),

    startCall: sync<CallArgs, void>('Call'),

    joinMeeting: sync<JoinArgs, void>('Join'),

    hangupAll: sync<null, void>('HangupAll'),

    mute: sync<MuteArgs, void>('Mute'),

    getActiveUser: sync<null, UserDetails>('GetActiveUser'),

    onClientStart: sync<EventSubscription<any>, void>('OnClientStart'),

    onClientExit: sync<EventSubscription<any>, void>('OnClientExit'),

    onIncoming: sync<EventSubscription<EventIncomingArgs>, void>('OnIncoming'),

    onConnect: sync<EventSubscription<EventConnectedArgs>, void>('OnConnect'),

    onDisconnect: sync<EventSubscription<any>, void>('OnDisconnect'),

    onMuteChange: sync<EventSubscription<boolean>, void>('OnMuteChange'),

    onClientStateChange: sync<EventSubscription<string>, void>('OnClientStateChange')

};
