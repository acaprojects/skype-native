import { SkypeClient } from './skype-client';

/**
 * Mock bindings for working detached from a live Skype client.
 * @type {SkypeClient}
 */
export const client: SkypeClient = {

    call(uri: string, fullscreen = true, display = 0) {
        return true;
    },

    endCall() {
        return true;
    }

};
