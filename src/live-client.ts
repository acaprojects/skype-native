import { EventEmitter } from 'events';
import { SkypeClient, SkypeClientEvent } from './skype-client';
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

        // Utility to emit an event with whatever payload we recieve.
        const emit = <T>(event: SkypeClientEvent) =>
            bindings.callback<T>((payload) => this.emit(event, payload));

        bindings.onIncoming(callback((call: bindings.EventIncomingArgs) => {
            this.emit(
                'incoming',
                call.inviter,
                // TODO create a neat abstraction to turn args into kwargs
                (fullscreen = true, display = 0) => call.accept({fullscreen, display}),
                call.reject
            );
        }));

        bindings.onConnect(emit('connected'));

        bindings.onDisconnect(emit('disconnected'));

        bindings.onMuteChange(emit<boolean>('mute'));
        bindings.onMuteChange(callback((state: boolean) => this.emit(state ? 'muted' : 'unmuted')));
    }

}
