import { EventEmitter } from 'events';
import * as client from './skype-client';
import * as bindings from './bindings';
import { resolveJoinUrl } from './meeting';

type Action = () => void;
type Predicate<T> = (payload: T) => boolean;

/**
 * Live bindings into the native Skype SDK.
 */
export class LiveClient extends EventEmitter implements client.SkypeClient {

    public static bind() {
        const clientInstance = new LiveClient();

        clientInstance.attachLifeCycleEvents();

        const bindClient = () => {
            clientInstance.attachAuthEvents();
            clientInstance.attachClientEvents();
        };

        bindings.attemptInteraction(bindClient, clientInstance.start);

        return clientInstance;
    }

    private constructor() {
        super();
    }

    public get user() {
        const getUser = () => bindings.method.getActiveUser(null);
        const none = () => undefined;

        return bindings.attemptInteraction(getUser, none);
    }

    public get state() {
        const appStates = new Map<bindings.ClientState, client.SkypeAppState>();
        appStates.set('SignedIn', 'signedIn');
        appStates.set('SignedOut', 'signedOut');
        appStates.set('SigningIn', 'signingIn');
        appStates.set('SigningOut', 'signingOut');

        const getClientState = () => bindings.method.getClientState(null);
        const unknown = () => 'Invalid' as bindings.ClientState;

        const clientState = bindings.attemptInteraction(getClientState, unknown);

        return appStates.get(clientState) || 'offline';
    }

    public start() {
        bindings.method.startClient(null);
    }

    public signIn(user?: string, password?: string) {
        if (user ? !password : password) {
            throw new Error('A user and password must both be specified if not using cached credentials');
        }

        return bindings.method.signIn({user, password});
    }

    public signOut() {
        return bindings.method.signOut(null);
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
        const exec = <T>(a: Action) => bindings.callback<T>((p) => a());

        const emit = <T>(event: () => client.SkypeAppState) =>
            bindings.callback<T>((p) => this.emit(event()));

        const bindClient = () => {
            this.attachAuthEvents();
            this.attachClientEvents();
        };

        bindings.method.onClientStart(exec(bindClient));
        bindings.method.onClientStart(emit(() => this.state));

        bindings.method.onClientExit(emit(() => 'offline'));
    }

    private attachAuthEvents() {
        const emitAppState = <T>() =>
            bindings.callback<T>((p) => this.emit(this.state));

        bindings.method.onClientStateChange(emitAppState());
    }

    private attachClientEvents() {
        // Event subscriptions that are passed to CLR components provide
        // a single object payload when they are activated. The below creates
        // a bit of middleware that ingests this, optionally applying a
        // transform so we can emit a Node event with a common signature.
        type EventPayload<InfoType, ActionsType> = [InfoType, ActionsType];

        type PayloadTransform<T, U, V> = (payload: T) => EventPayload<U, V>;

        const emit = <T, U, V>(event: client.SkypeClientEvent,
                               transform?: PayloadTransform<T, U, V>,
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
