import { join } from 'path';
import { EventEmitter } from 'events';
import { merge } from 'ramda';
import { SkypeClient, SkypeClientEvent } from './skype-client';
import { sync, async, proxy, Callback } from './binder';
import { resolveJoinUrl } from './meeting';

/**
 * Resolves a set of paths relative to the curent directory.
 */
const relative = (...path: string[]) => join(__dirname, ...path);

/**
 * Binding environmnt for our native libs.
 */
const bindingTarget = {
    assemblyFile: relative('../lib/native/win32', 'SkypeClient.dll'),
    references: [relative('../lib/native/win32', 'Microsoft.Lync.Model.dll')],
    typeName: 'SkypeClient.Bindings'
};

const method = (name: string) => merge(bindingTarget, {methodName: name});

const bindSync = <I, O>(methodName: string) => sync<I, O>(method(methodName));

const bindAsync = <I, O>(methodName: string) => async<I, O>(method(methodName));

interface CallArgs {
    uri: string;
    fullscreen: boolean;
    display: number;
}

interface JoinArgs {
    url: string;
    fullscreen: boolean;
    display: number;
}

interface MuteArgs {
    state: boolean;
}

interface FullscreenArgs {
    display: number;
}

interface EventSubscription<T> {
    callback: (input: T, callback: Callback<void>) => void;
}

interface EventIncomingArgs {
    inviter: string;
    accept: (kwargs: {fullscreen: boolean, display: number}) => void;
    reject: () => void;
}

interface EventConnectedArgs {
    participants: string[];
}

interface UserDetails {
    uri: string;
}

const bindings = {
    startCall: bindSync<CallArgs, void>('Call'),
    joinMeeting: bindSync<JoinArgs, void>('Join'),
    hangupAll: bindSync<null, void>('HangupAll'),
    mute: bindSync<MuteArgs, void>('Mute'),
    fullscreen: bindSync<FullscreenArgs, void>('Fullscreen'),

    onIncoming: bindSync<EventSubscription<EventIncomingArgs>, void>('OnIncoming'),
    onConnect: bindSync<EventSubscription<EventConnectedArgs>, void>('OnConnect'),
    onDisconnect: bindSync<EventSubscription<null>, void>('OnDisconnect'),
    onMuteChange: bindSync<EventSubscription<boolean>, void>('OnMuteChange'),

    getActiveUser: bindSync<null, UserDetails>('GetActiveUser')
};

/**
 * Live bindings into the native Skype SDK.
 */
export class LiveClient extends EventEmitter implements SkypeClient {

    public readonly user: {uri: string};

    constructor() {
        super();

        // TODO: attempt to connect with / launch client on init

        this.bindEvents();

        this.user = bindings.getActiveUser(null);
    }

    public call(uri: string, fullscreen = true, display = 0) {
        return bindings.startCall({uri, fullscreen, display});
    }

    public join(meetingUrl: string, fullscreen = true, display = 0) {
        resolveJoinUrl(meetingUrl, (url) =>
            bindings.joinMeeting({url, fullscreen, display})
        );
    }

    public endCall() {
        return bindings.hangupAll(null);
    }

    public mute(state = true) {
        return bindings.mute({state});
    }

    public fullscreen(display = 0) {
        return bindings.fullscreen({display});
    }

    private bindEvents() {
        // Wrap an event handler up into the structure expected by the native
        // bindings.
        const callback = <T>(handler: (input: T) => void): EventSubscription<T> => {
            return {
                callback: proxy(handler)
            };
        };

        // Utility to emit an event with whatever payload we recieve.
        const emit = <T>(event: SkypeClientEvent) =>
            callback<T>((payload) => this.emit(event, payload));

        bindings.onIncoming(callback((call: EventIncomingArgs) => {
            this.emit(
                'incoming',
                call.inviter,
                // TODO create a neat abstraction to turn args into kwargs
                (fullscreen = true, display = 0) => call.accept({fullscreen, display}),
                call.reject
            );
        }));

        bindings.onConnect(emit<EventConnectedArgs>('connected'));

        bindings.onDisconnect(emit<null>('disconnected'));

        bindings.onMuteChange(emit<boolean>('mute'));
        bindings.onMuteChange(callback<boolean>((state) => this.emit(state ? 'muted' : 'unmuted')));
    }

}
