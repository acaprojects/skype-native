import * as edge from 'edge';
import * as path from 'path';

const lyncSDK = path.join(__dirname, '../lib/native/win32', 'Microsoft.Lync.Model.dll');

const binding = (name: string) => path.join(__dirname, '../src/bindings', name);

const bind = (source: string) =>
    edge.func({
        source: binding(source),
        references: [lyncSDK]
    });

export function call(uri: string, fullscreen = true, display = 0) {
    bind('Call.cs')({
        uri,
        fullscreen,
        display
    }, true);
}
