import * as path from 'path';
import { isElectron } from './util/runtime-env';

// Edge needs to be compiled against a different verion of node to support
// electron. This is still a little messing as we need to pull down both, but
// at least it switches in the relevant version silently.
const edge = isElectron() ? require('electron-edge') : require('edge');

// Lync SDK redist assembly
const nativeLibs = path.join(__dirname, '../lib/native/win32');
const lyncSDK = path.join(nativeLibs, 'Microsoft.Lync.Model.dll');

/**
 * Resolve the path to a binding .NET source.
 */
const bindingPath = (name: string) =>
    path.join(__dirname, '../src/bindings', name);

/**
 * Creates a CLR binding for use in Node.
 */
const bind = (source: string) =>
    edge.func({
        source: bindingPath(source),
        references: [lyncSDK]
    });

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
