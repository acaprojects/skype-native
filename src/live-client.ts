import { EventEmitter } from 'events';
import * as client from './skype-client';
import * as bindings from './bindings';
import { resolveJoinUrl } from './meeting';

/**
 * Live bindings into the native Skype SDK.
 */
export class LiveClient extends EventEmitter implements client.SkypeClient {

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

    private bindEvents() {
        // Event subscriptions that are passed to CLR components provide
        // a single object payload when they are activated. The below creates
        // a bit of middlewhere that ingests this, optionally applying a
        // transform so we can emit a Node event with a common signature.
        type CallbackTransform<T, U, V> = (payload: T) => [U, V];

        type Predicate<T> = (input: T) => boolean;

        const emit = <T, U, V>(event: client.SkypeClientEvent,
                               transform?: CallbackTransform<T, U, V>,
                               condition: Predicate<T> = (p) => true) =>
            bindings.callback<T>((payload) => {
                if (condition(payload)) {
                    const t = transform || ((p) => [p, undefined]);
                    this.emit(event, ...t(payload));
                }
            });

        bindings.onIncoming(emit<bindings.EventIncomingArgs, client.InviterInfo, client.IncomingCallActions>(
            'incoming',
            (call) => [
                call.inviter,
                {
                    accept: (fullscreen = true, display = 0) => call.actions.accept({fullscreen, display}),
                    reject: call.actions.reject
                }
             ]
        ));

        bindings.onConnect(emit<bindings.EventConnectedArgs, client.ConnectedCallInfo, client.ConnectedCallActions>(
            'connected',
            (conversation) => [
                conversation.participants,
                {
                    fullscreen: (display = 0) => conversation.actions.fullscreen({display}),
                    show: conversation.actions.show,
                    hide: conversation.actions.hide,
                    mute: (state) => conversation.actions.mute({state}),
                    startVideo: conversation.actions.startVideo,
                    stopVideo: conversation.actions.stopVideo,
                    end: conversation.actions.end
                }
            ]
        ));

        bindings.onDisconnect(emit<undefined, undefined, undefined>('disconnected'));

        bindings.onMuteChange(emit<boolean, client.MuteInfo, undefined>('mute'));

        bindings.onMuteChange(emit<boolean, undefined, undefined>(
            'muted',
            (isMuted) => [undefined, undefined],
            (isMuted) => isMuted
        ));

        bindings.onMuteChange(emit<boolean, undefined, undefined>(
            'unmuted',
            (isMuted) => [undefined, undefined],
            (isMuted) => !isMuted
        ));
    }

}
