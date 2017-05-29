import { join } from 'path';
import { EventEmitter } from 'events';
import * as R from 'ramda';
import { SkypeClient, SkypeClientEvent } from './skype-client';
import { sync, async, proxy, Callback } from './binder';

/**
 * Resolves a set of paths relative to the curent directory.
 */
const relative = (...path: string[]) => join(__dirname, ...path);

/**
 * Binding environmnt for our native libs.
 */
const bindings = {
    assemblyFile: relative('../lib/native/win32', 'SkypeClient.dll'),
    references: [relative('../lib/native/win32', 'Microsoft.Lync.Model.dll')],
    typeName: 'SkypeClient.Bindings'
};

const method = (name: string) => R.merge(bindings, {methodName: name});

const bindSync = <I, O>(methodName: string) => sync<I, O>(method(methodName));

/**
 * Live bindings into the native Skype SDK.
 */
export class LiveClient extends EventEmitter implements SkypeClient {

    public readonly user: {uri: string};

    constructor() {
        super();

        // TODO: attempt to connect with / launch client on init

        this.bindEvents();

        // Super hacky quick test
        interface UserDetails {
            uri: string;
        }
        const getUser = bindSync<undefined, UserDetails>('GetActiveUser');
        this.user = getUser();
    }

    public call(uri: string, fullscreen = true, display = 0) {
        const kwargs = { uri, fullscreen, display };
        const startCall = bindSync<typeof kwargs, void>('Call');
        return startCall(kwargs);
    }

    public join(url: string, fullscreen = true, display = 0) {
        const args = { url, fullscreen, display };
        const joinMeeting = bindSync<typeof args, void>('Join');
        return joinMeeting(args);
    }

    public endCall() {
        const hangupAll = bindSync<undefined, void>('HangupAll');
        return hangupAll();
    }

    public mute(state = true) {
        const mute = bindSync<boolean, void>('Mute');
        return mute(state);
    }

    private bindEvents() {
        interface EventSubscription<I> {
            callback: (input: I, callback: Callback<void>) => void;
        }

        // Wrap an event handler up into the structure expected by the native
        // bindings.
        const callback = <T>(handler: (input: T) => void) => {
            return {
                callback: proxy(handler)
            };
        };

        // Utility to emit an event with whatever payload we recieve.
        const emit = <T>(event: SkypeClientEvent) =>
            callback<T>((payload) => this.emit(event, payload));

        interface IncomingArgs {
            inviter: string;
            accept: (kwargs: {fullscreen?: boolean, display?: number}) => void;
            reject: () => void;
        }
        const onIncoming = bindSync<EventSubscription<IncomingArgs>, void>('OnIncoming');
        onIncoming(callback((call: IncomingArgs) => {
            this.emit(
                'incoming',
                call.inviter,
                // TODO create a neat abstraction to turn args into kwargs
                (fullscreen = true, display = 0) => call.accept({fullscreen, display}),
                call.reject
            );
        }));

        const onConnect = bindSync('OnConnect');
        onConnect(emit('connected'));

        const onDisconnect = bindSync('OnDisconnect');
        onDisconnect(emit('disconnected'));

        const onMuteChanged = bindSync('OnMuteChange');
        onMuteChanged(emit('mute'));
        onMuteChanged(callback((state: boolean) => this.emit(state ? 'muted' : 'unmuted')));
    }

}
