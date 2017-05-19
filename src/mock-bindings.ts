import { SkypeClient } from './skype-client';

/**
 * Live bindings for working detached from a live Skype client.
 * @type {SkypeClient}
 */
export const client: SkypeClient = {

    call(uri: string, fullscreen = true, display = 0): boolean {
        return true;
    }

};
