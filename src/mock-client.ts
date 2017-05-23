import { EventEmitter } from 'events';
import { SkypeClient } from './skype-client';

/**
 * Mock bindings for working detached from a live Skype client.
 */
export class MockClient extends EventEmitter implements SkypeClient {

    public call(uri: string, fullscreen = true, display = 0) {
        this.emit('connected', [uri]);
        return true;
    }

    public endCall() {
        this.emit('disconnected');
        return true;
    }

    public mute(state = true) {
        this.emit(state ? 'muted' : 'unmuted');
        return true;
    }

}
