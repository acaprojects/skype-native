import { join } from 'path';
import { EventEmitter } from 'events';
import { SkypeClient, SkypeClientEvent, Action } from './skype-client';
import { createBinder, createCLRProxy, PrecompiledTarget, SyncBinding, CLRProxy } from './binder';

/**
 * Resolves a set of paths relative to the curent directory.
 */
const relative = (...path: string[]) => join(__dirname, ...path);

/**
 * Lync SDK redist assembly.
 */
const lyncSDK = relative('../lib/native/win32', 'Microsoft.Lync.Model.dll');

/**
 * Precompiled native bindings.
 */
const skypeNativeLib = relative('../lib/native/win32', 'SkypeClient.dll');

/**
 * Creates binding to our Skype CLR actions for use in Node.
 */
const bind = createBinder<PrecompiledTarget>({
    assemblyFile: skypeNativeLib,
    references: [lyncSDK],
    typeName: 'SkypeClient.Bindings'
});

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
        const getUser = bind.sync<CLRProxy<undefined, any>, any>({methodName: 'GetActiveUser'});
        const user = getUser();
        this.user = {uri: user.uri};
    }

    public call(uri: string, fullscreen = true, display = 0) {
        const args = { uri, fullscreen, display };
        const startCall = bind.sync<typeof args, void>({methodName: 'Call'});
        return startCall(args);
    }

    public endCall() {
        const hangupAll = bind.sync<null, void>({methodName: 'HangupAll'});
        return hangupAll();
    }

    public mute(state = true) {
        const mute = bind.sync<boolean, void>({methodName: 'Mute'});
        return mute(state);
    }

    private bindEvents() {
        // Curry an event handler that we can pass to .NET.
        const emit = <T>(event: SkypeClientEvent) =>
            createCLRProxy<T, null>((payload) => this.emit(event, payload));

        interface IncomingArgs {
            inviter: string;
            accept: SyncBinding<null, void>;
            reject: SyncBinding<null, void>;
        }
        const onIncoming = bind.sync<CLRProxy<IncomingArgs, any>, null>({methodName: 'OnIncoming'});
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
    }

}
