import { EventEmitter } from 'events';
import { SkypeClient } from './skype-client';

/**
 * Mock bindings for working detached from a live Skype client.
 */
export class MockClient extends EventEmitter implements SkypeClient {

    public call(uri: string, fullscreen = true, display = 0) {
        return true;
    }

    public endCall() {
        return true;
    }

}
