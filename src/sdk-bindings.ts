import { join } from 'path';
import { SkypeClient } from './skype-client';
import { binder } from './util/binder';

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
const bind = binder(relative('../src/bindings'), [lyncSDK]);

/**
 * Mappings to .NET source for the native client bindings.
 */
const bindings = {
    startCall: bind.sync('StartCall'),
    endCall: bind.sync('EndCall')
};

/**
 * Live bindings into the native Skype SDK.
 * @type {SkypeClient}
 */
export const client: SkypeClient = {

    call(uri: string, fullscreen = true, display = 0): boolean {
        return bindings.startCall({uri, fullscreen, display});
    },

    endCall(): boolean {
        return bindings.endCall();
    }

};
