import { join } from 'path';
import { EventEmitter } from 'events';
import { SkypeClient } from './skype-client';
import { createBindingEnv } from './binder';

/**
 * Resolves a set of paths relative to the curent directory.
 */
const relative = (...path: string[]) => join(__dirname, ...path);

/**
 * Lync SDK redist assembly.
 */
const lyncSDK = relative('../lib/native/win32', 'Microsoft.Lync.Model.dll');

/**
 * Creates binding to our Skype CLR actions for use in Node.
 */
const bind = createBindingEnv(relative('../src/bindings'), [lyncSDK]);

/**
 * Mappings to .NET source for the native client bindings.
 */
const bindings = {
    startCall: bind.sync('StartCall'),
    endCall: bind.sync('EndCall')
};

/**
 * Live bindings into the native Skype SDK.
 */
export class LiveClient extends EventEmitter implements SkypeClient {

    public call(uri: string, fullscreen = true, display = 0): boolean {
        return bindings.startCall({uri, fullscreen, display});
    }

    public endCall(): boolean {
        return bindings.endCall();
    }

}
