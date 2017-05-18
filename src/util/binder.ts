import { isElectron } from './runtime-env';

// Edge needs to be compiled against a different verion of node to support
// electron. This is still a little messing as we need to pull down both, but
// at least it switches in the relevant version silently.
const edge = isElectron() ? require('electron-edge') : require('edge');

/**
 * Creates a CLR binding for use in Node.
 */
export function bindToCLR(source: string, references: string[] = []) {
    return edge.func({
        source,
        references
    });
}
