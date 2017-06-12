import { EventEmitter } from 'events';
import * as client from './skype-client';
import * as bindings from './bindings';
import { resolveJoinUrl } from './meeting';

/**
 * Live bindings into the native Skype SDK.
 */
export class LiveClient extends EventEmitter implements client.SkypeClient {

    public static bind() {
        const client = new LiveClient();

        client.attachLifeCycleEvents();

        bindings.attemptInteraction(() => client.attachClientEvents(), client.start);

        return client;
    }

    private constructor() {
        super();
    }

    public get user() {
        const getUser = () => bindings.method.getActiveUser(null);
        const none = () => undefined;

        return bindings.attemptInteraction(getUser, none);
    }

    public start() {
        bindings.method.startClient(null);
    }

    public call(uri: string, fullscreen = true, display = 0) {
        return bindings.method.startCall({uri, fullscreen, display});
    }

    public join(meetingUrl: string, fullscreen = true, display = 0) {
        const join = (url: string) =>
            bindings.method.joinMeeting({url, fullscreen, display});

        resolveJoinUrl(meetingUrl, join);
    }

    public end() {
        return bindings.method.hangupAll(null);
    }

    public mute(state = true) {
        return bindings.method.mute({state});
    }

    private attachLifeCycleEvents() {
        type Action = () => void;

        const execIfDefined = (a?: Action) => a ? a() : undefined;

        const emit = <T>(event: client.SkypeLifecycleEvent, pre?: Action) =>
            bindings.callback<T>((p) => {
                execIfDefined(pre);
                this.emit(event);
            });

        // Proxy private function for external exec
        const bindClient = () => this.attachClientEvents();
        bindings.method.onClientStart(emit('clientStarted', bindClient));

        bindings.method.onClientExit(emit('clientExited'));
    }

    private attachClientEvents() {
        // Event subscriptions that are passed to CLR components provide
        // a single object payload when they are activated. The below creates
        // a bit of middleware that ingests this, optionally applying a
        // transform so we can emit a Node event with a common signature.
        type EventPayload<InfoType, ActionsType> = [InfoType, ActionsType];

        type Transform<T, U, V> = (payload: T) => EventPayload<U, V>;

        type Predicate<T> = (payload: T) => boolean;

        const emit = <T, U, V>(event: client.SkypeClientEvent,
                               transform?: Transform<T, U, V>,
                               when?: Predicate<T>) => {
            const t = transform || ((p) => [p]);
            const c = when || ((p) => true);
            return bindings.callback<T>((p) => this.emit(event, ...t(p)), c);
        };

        bindings.method.onIncoming(emit<bindings.EventIncomingArgs,
                                         client.Inviter,
                                         client.IncomingCallActions>(
            'incoming',
            (call) => [
                call.inviter,
                {
                    accept: (fullscreen = true, display = 0) =>
                        call.actions.accept({fullscreen, display}),
                    reject: call.actions.reject
                }
             ]
        ));

        bindings.method.onConnect(emit<bindings.EventConnectedArgs,
                                        client.Participants,
                                        client.ConnectedCallActions>(
            'connected',
            (conversation) => [
                conversation.participants,
                {
                    fullscreen: (display = 0) =>
                        conversation.actions.fullscreen({display}),
                    show: conversation.actions.show,
                    hide: conversation.actions.hide,
                    mute: (state) => conversation.actions.mute({state}),
                    startVideo: conversation.actions.startVideo,
                    stopVideo: conversation.actions.stopVideo,
                    end: conversation.actions.end
                }
            ]
        ));

        bindings.method.onDisconnect(emit<undefined, undefined, undefined>('disconnected'));

        bindings.method.onMuteChange(emit<boolean, client.MuteInfo, undefined>('mute'));

        bindings.method.onMuteChange(emit<boolean, undefined, undefined>(
            'muted',
            (isMuted) => [undefined, undefined],
            (isMuted) => isMuted
        ));

        bindings.method.onMuteChange(emit<boolean, undefined, undefined>(
            'unmuted',
            (isMuted) => [undefined, undefined],
            (isMuted) => !isMuted
        ));
    }

}
