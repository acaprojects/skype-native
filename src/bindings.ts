import { join } from 'path';
import * as R from 'ramda';
import { sync, async, proxy, Callback } from 'edge-ts';

/**
 * Resolves a set of paths relative to the curent directory.
 */
const relative = (...path: string[]) => join(__dirname, ...path);

/**
 * Binding environmnt for our native libs.
 */
const bindingTarget = {
    assemblyFile: relative('../lib/native/win32', 'SkypeClient.dll'),
    references: [
        relative('../lib/native/win32', 'Microsoft.Lync.Model.dll'),
        'System.Management.dll'
    ],
    typeName: 'SkypeClient.Bindings'
};

const method = (name: string) => R.merge(bindingTarget, {methodName: name});

const bindSync = <I, O>(methodName: string) => sync<I, O>(method(methodName));

const bindAsync = <I, O>(methodName: string) => async<I, O>(method(methodName));

export type Action = () => void;
export type ActionWithArgs<T> = (x: T) => void;
export type Predicate<T> = (x: T) => boolean;

export function callback<T>(handler: ActionWithArgs<T>,
                            when?: Predicate<T>): EventSubscription<T> {
    const action: ActionWithArgs<T> = when
        ? (x) => when(x) ? handler(x) : undefined
        : handler;
    return { callback: proxy<T, void>(action) };
}

export const startCall = bindSync<CallArgs, void>('Call');
export interface CallArgs {
    uri: string;
    fullscreen: boolean;
    display: number;
}

export const joinMeeting = bindSync<JoinArgs, void>('Join');
export interface JoinArgs {
    url: string;
    fullscreen: boolean;
    display: number;
}

export const hangupAll = bindSync<null, void>('HangupAll');

export const mute = bindSync<MuteArgs, void>('Mute');
export interface MuteArgs {
    state: boolean;
}

export const getActiveUser = bindSync<null, UserDetails>('GetActiveUser');
export interface UserDetails {
    uri: string;
}

export interface EventSubscription<T> {
    callback: (input: T, callback: Callback<void>) => void;
}

export const onClientStart = bindSync<EventSubscription<any>, void>('OnClientStart');

export const onIncoming = bindSync<EventSubscription<EventIncomingArgs>, void>('OnIncoming');
export interface IncomingCallInfo {
    name: string;
    uri: string;
}
export interface IncomingCallActions {
    accept: ActionWithArgs<{fullscreen: boolean, display: number}>;
    reject: Action;
}
export interface EventIncomingArgs {
    inviter: IncomingCallInfo;
    actions: IncomingCallActions;
}

export const onConnect = bindSync<EventSubscription<EventConnectedArgs>, void>('OnConnect');
export interface ConnectedCallActions {
    fullscreen: ActionWithArgs<{display: number}>;
    show: Action;
    hide: Action;
    mute: ActionWithArgs<{state: boolean}>;
    startVideo: Action;
    stopVideo: Action;
    end: Action;
}
export interface EventConnectedArgs {
    participants: string[];
    actions: ConnectedCallActions;
}

export const onDisconnect = bindSync<EventSubscription<any>, void>('OnDisconnect');

export const onMuteChange = bindSync<EventSubscription<boolean>, void>('OnMuteChange');
