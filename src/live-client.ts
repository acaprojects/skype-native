import { join } from 'path';
import { EventEmitter } from 'events';
import * as R from 'ramda';
import { SkypeClient, SkypeClientEvent, Action } from './skype-client';
import { sync, async, PartialPrecompiledTarget } from './binder';

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

const merge = (partial: PartialPrecompiledTarget) => R.merge(bindings, partial);

const method = (name: string) => merge({methodName: name});

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
        const args = { uri, fullscreen, display };
        const startCall = bindSync<typeof args, void>('Call');
        return startCall(args);
    }

    public join(url: string, fullscreen = true, display = 0) {
        const args = { url, fullscreen, display };
        const joinMeeting = bindSync<typeof args, void>('Join');
        return joinMeeting(args);
    }

    public endCall() {
        const hangupAll = bindSync<null, void>('HangupAll');
        return hangupAll();
    }

    public mute(state = true) {
        const mute = bindSync<boolean, void>('Mute');
        return mute(state);
    }

    private bindEvents() {/*
        // Curry an event handler that we can pass to .NET.
        const emit = <T>(event: SkypeClientEvent) =>
            createCLRProxy<T, null>((payload) => this.emit(event, payload));

        interface IncomingArgs {
            inviter: string;
            accept: SyncBinding<null, void>;
            reject: SyncBinding<null, void>;
        }
        const onIncoming = bindSync<>('OnIncoming');
        onIncoming(createCLRProxy((call: IncomingArgs) =>
            this.emit('incoming',
                      call.inviter,
                      () => call.accept(null, true),
                      () => call.reject(null, true))
        ));

        const onConnect = bind.sync<CLRProxy<string[], null>, null>({methodName: 'OnConnect'});
        onConnect(emit('connected'));

        const ondisconnect = bind.sync<CLRProxy<string, null>, null>({methodName: 'OnDisconnect'});
        ondisconnect(emit('disconnected'));

        const onMuteChanged = bind.sync<CLRProxy<boolean, any>, null>({methodName: 'OnMuteChange'});
        onMuteChanged(createCLRProxy((state) => {
            this.emit('mute', state);
            this.emit(state ? 'muted' : 'unmuted');
        }));
    */}

}
