import { join } from 'path';
import binder from './util/binder';

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

export function call(uri: string, fullscreen = true, display = 0) {
    bind('Call.cs')({
        uri,
        fullscreen,
        display
    }, true);
}

/*
call
endCall

accept
reject

mute

selfView

callInfo

addParticipant
removeParticipant

addIncomingCallListener

*/
