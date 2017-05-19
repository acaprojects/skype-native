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
    call: bind.sync('Call.cs')
};

/**
 * Live bindings into the native Skype SDK.
 * @type {SkypeClient}
 */
export const client: SkypeClient = {

    call(uri: string, fullscreen = true, display = 0): boolean {
        return bindings.call({uri, fullscreen, display});
    }

};
