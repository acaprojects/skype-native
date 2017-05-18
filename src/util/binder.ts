import { join } from 'path';
import { isElectron } from './runtime-env';

// Edge needs to be compiled against a different verion of node to support
// electron. This is still a little messy as we need to pull down both, but at
// least it switches in the relevant version silently.
const edge = isElectron() ? require('electron-edge') : require('edge');

/**
 * Creates a CLR binding for use in Node.
 */
export function bindToCLR(source: string, references: string[] = []) {
    return edge.func({source, references});
}

/**
 * Create a binder function for a given basepath and set of references that may
 * then be used to build CLR bound methods.
 */
export function binder(basePath = '', references: string[] = []) {
    return (source: string) => bindToCLR(join(basePath, source), references);
}
