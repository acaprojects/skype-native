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
    references: [lyncSDK]
});

/**
 * Mappings to .NET source for the native client bindings.
 */
const bindings = {
    startCall: bind.sync<any, boolean>({typeName: 'StartCall'}),
    endCall: bind.sync<null, boolean>({typeName: 'EndCall'}),
    listenIncoming: bind.sync<CLRProxy, void>({typeName: 'Incoming'}),
    listenConnected: bind.sync<CLRProxy, void>({typeName: 'Connected'}),
    listenDisconnected: bind.sync<CLRProxy, void>({typeName: 'Disconnected'})
};

/**
 * Live bindings into the native Skype SDK.
 */
export class LiveClient extends EventEmitter implements SkypeClient {

    constructor() {
        super();

        // TODO: attempt to connect with / launch client on init

        this.bindEvents();
    }

    public call(uri: string, fullscreen = true, display = 0) {
        return bindings.startCall({uri, fullscreen, display});
    }

    public endCall() {
        return bindings.endCall();
    }

    public mute(state = true) {
        return true;
    }

    private bindEvents() {
        // Curry an event handler that we can pass to .NET.
        const emitWithPayload = (event: SkypeClientEvent) =>
            createCLRProxy((payload) => this.emit(event, payload));

        // Prep an exposed .NET function for execution as a synchronous action.
        const createAction = (binding: SyncBinding) =>
            () => binding(null, true) as Action;

        bindings.listenIncoming(createCLRProxy((call: any) =>
            this.emit('incoming', call.inviter, createAction(call.accept), createAction(call.reject))
        ));

        bindings.listenConnected(emitWithPayload('connected'));

        bindings.listenDisconnected(emitWithPayload('disconnected'));
    }

}
