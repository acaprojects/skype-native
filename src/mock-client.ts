import { EventEmitter } from 'events';
import { SkypeClient } from './skype-client';

/**
 * Mock bindings for working detached from a live Skype client.
 */
export class MockClient extends EventEmitter implements SkypeClient {

    public readonly user = {
        uri: 'sip:foo@bar.com',
        name: 'Not a real user'
    };

    public start() {
        this.emit('clientStarted');
    }

    public call(uri: string, fullscreen = true, display = 0) {
        this.emit('connected', [uri]);
        return true;
    }

    public join(url: string, fullscreen = true, display = 0) {
        this.emit('connected', [url]);
        return true;
    }

    public end() {
        this.emit('disconnected');
        return true;
    }

    public mute(state = true) {
        this.emit(state ? 'muted' : 'unmuted');
        return true;
    }

}
