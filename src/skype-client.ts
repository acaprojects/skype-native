import { EventEmitter } from 'events';

/**
 * Events emitted due to changes in the client call state.
 */
export type SkypeCallStateEvent = 'incoming' | 'connected' | 'disconnected';

/**
 * Events emitted due to changes in the client audio mute state.
 */
export type SkypeMuteStateEvent = 'mute'| 'muted' | 'unmuted';

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
     * Information about the currently logged in user.
     */
    readonly user: {
        uri: string
    };

    /**
     * Start a fullscreen, outbound call on the primary diplay.
     */
    call(uri: string): void;

    /**
     * Start an outbound call on the primary display.
     */
    call(uri: string, fullscreen: boolean): void;

    /**
     * Start an outbound call.
     */
    call(uri: string, fullscreen: boolean, display: number): void;

    /**
     * Join a meeting by URL and open full screen on the primary display.
     */
    join(url: string): void;

    /**
     * Join a meeting by URL and show on the primary display.
     */
    join(url: string, fullscreen: boolean): void;

    /**
     * Join a meeting by URL.
     */
    join(url: string, fullscreen: boolean, display: number): void;

    /**
     * End all currently active calls.
     */
    endCall(): void;

    /**
     * Make any currently active calls fullscreen
     *
     * TODO: remove this, included as test only
     */
    fullscreen(): void;

    /**
     * Set the privacy mute state of any calls currently in progress.
     */
    mute(state: boolean): void;

    /**
     * Subsribe to incoming call events.
     */
    on(event: 'incoming', listener: (inviter?: string,
                                     accept?: (fullscreen?: boolean, display?: number) => void,
                                     reject?: () => void,
                                     fullscreen?: () => void) => void): this;

    /**
     * Subscribe to call connected events.
     */
    on(event: 'connected', listener: (participants: string[]) => void): this;

    /**
     * Subscribe to call disconnected events.
     */
    on(event: 'disconnected', listener: () => void): this;

    on(event: 'mute', listenter: (state: boolean) => void): this;

    on(event: 'muted', listener: () => void): this;

    on(event: 'unmuted', listener: () => void): this;
}
