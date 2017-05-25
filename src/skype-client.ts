import { EventEmitter } from 'events';

/**
 * Events emitted due to changes in the client call state.
 */
export type SkypeCallStateEvent = 'incoming' | 'connected' | 'disconnected';

/**
 * Events emitted due to changes in the client audio mute state.
 */
export type SkypeMuteStateEvent = 'muted' | 'unmuted';

/**
 * Events emitted by the Skype client.
 */
export type SkypeClientEvent = SkypeCallStateEvent | SkypeMuteStateEvent;

export type Action = (...args: any[]) => void;

export type Func<T> = (...args: any[]) => T;

export type Predicate = Func<boolean>;

/**
 * Comms proxy for controlling and interacting with the desktop Skype for
 * Business client.
 */
export interface SkypeClient extends EventEmitter {

    /**
     * Start a fullscreen, outbound call on the primary diplay.
     * @param  {string}  uri        the uri to dial
     */
    call(uri: string): void;

    /**
     * Start an outbound call on the primary display.
     * @param  {string}  uri        the uri to dial
     * @param  {boolean} fullscreen true if the UI should be shown full screen
     * @return {boolean}            true if the call was started
     */
    call(uri: string, fullscreen: boolean): void;

    /**
     * Start an outbound call.
     * @param  {string}  uri        the uri to dial
     * @param  {boolean} fullscreen true if the UI should be shown full screen
     * @param  {number}  display    the monitor to show the call UI on
     * @return {boolean}            true if the call was started
     */
    call(uri: string, fullscreen: boolean, display: number): void;

    /**
     * End all currently active calls.
     * @return {boolean} true if successfull
     */
    endCall(): void;

    /**
     * Set the privacy mute state of any calls currently in progress.
     * @param  {boolean} state true if the mute should be activated
     * @return {boolean}       true if successful
     */
    mute(state: boolean): void;

    // getUser(): string;

    /**
     * Subsribe to incoming call events.
     */
    on(event: 'incoming', listener: (inviter?: string, accept?: () => void, reject?: () => void) => void): this;

    /**
     * Subscribe to call connected events.
     */
    on(event: 'connected', listener: (participants: string[]) => void): this;

    /**
     * Subscribe to call disconnected events.
     */
    on(event: 'disconnected', listener: () => void): this;

    on(event: 'muted', listener: () => void): this;

    on(event: 'unmuted', listener: () => void): this;
}

/*
selfView

callInfo

addParticipant
removeParticipant

addIncomingCallListener

isSignedIn
? event listener for auth ?

*/
