import { join } from 'path';
import { bindToCLR } from './util/binder';

const relative = (...paths: string[]) => join(__dirname, ...paths);

// Lync SDK redist assembly
const lyncSDK = relative('../lib/native/win32', 'Microsoft.Lync.Model.dll');

/**
 * Resolve the path to the .NET source for an action.
 */
const sourcePath = (action: string) => relative('../src/bindings', `${action}.cs`);

/**
 * Creates a CLR binding for use in Node.
 */
const bind = (action: string) => bindToCLR(sourcePath(action), [lyncSDK]);

export function call(uri: string, fullscreen = true, display = 0) {
    bind('Call')({
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
