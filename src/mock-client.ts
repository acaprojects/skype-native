import { EventEmitter } from 'events';
import * as client from './skype-client';

/**
 * Mock bindings for working detached from a live Skype client.
 */
export class MockClient extends EventEmitter implements client.SkypeClient {

    public static bind() {
        return new MockClient();
    }

    public readonly user = {
        uri: 'sip:foo@bar.com',
        name: 'Not a real user'
    };

    private _state: client.SkypeAppState = 'signedIn';

    public get state()  {
        return this._state;
    }

    private constructor() {
        super();
    }

    public start() {
        this.setState('signedIn');
    }

    public signIn(user?: string, password?: string) {
        this.setState('signingIn');
        this.setState('signedIn');
    }

    public signOut() {
        this.setState('signingOut');
        this.setState('signedOut');
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

    private setState(state: client.SkypeAppState) {
        this._state = state;
        this.emit(state);
    }

}
