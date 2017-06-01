import { EventEmitter } from 'events';
import { SkypeClient, SkypeClientEvent, IncomingCallActions, ConnectedCallActions } from './skype-client';
import * as bindings from './bindings';
import { resolveJoinUrl } from './meeting';

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
        const callback = bindings.callback;

        /**
         * Type safe container around the vanilla emit function.
         */
        const emit = <T, U>(event: SkypeClientEvent, eventInfo?: T, actions?: U) =>
            this.emit(event, eventInfo, actions);

        type EventPayload<T, U> = [T, U];

        type IdentityTransform<T> = (payload: T) => EventPayload<T, undefined>;
        type InfoTransform<T, U> = (payload: T) => EventPayload<U, undefined>;
        type ActionTransform<T, U, V> = (payload: T) => EventPayload<U, V>;

        type CallbackTransform<T, U, V> = IdentityTransform<T> | InfoTransform<T, U> | ActionTransform<T, U, V>;

        const emitter = <T, U, V>(event: SkypeClientEvent, transform: CallbackTransform<T, U, V>) =>
            callback<T>((payload) => {
                const [eventInfo, actions] = transform(payload);
                emit(event, eventInfo, actions);
            });

        const simpleEmitter = (event: SkypeClientEvent) =>
            emitter<undefined, undefined, undefined>(event, (payload) => [payload, undefined]);

        const identityEmitter = <T>(event: SkypeClientEvent) =>
            emitter<T, undefined, undefined>(event, (payload) => [payload, undefined]);

        bindings.onIncoming(emitter<bindings.EventIncomingArgs, string, IncomingCallActions>(
            'incoming',
            (call) => [
                call.inviter,
                {
                    // TODO create a neat abstraction to turn args into kwargs
                    accept: (fullscreen = true, display = 0) => call.actions.accept({fullscreen, display}),
                    reject: call.actions.reject
                }
            ]
        ));

        bindings.onConnect(emitter<bindings.EventConnectedArgs, string[], ConnectedCallActions>(
            'connected',
            (conversation) => [
                conversation.participants,
                {
                    fullscreen: (display = 0) => conversation.actions.fullscreen({display}),
                    show: conversation.actions.show,
                    hide: conversation.actions.hide,
                    mute: (state: boolean) => conversation.actions.mute({state}),
                    end: conversation.actions.end
                }
            ]
        ));

        bindings.onDisconnect(simpleEmitter('disconnected'));

        bindings.onMuteChange(identityEmitter<boolean>('mute'));

        // TODO add ability to include a predicate in the emitter
        bindings.onMuteChange(callback((state: boolean) => this.emit(state ? 'muted' : 'unmuted')));
    }

}
