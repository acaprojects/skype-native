import { EventEmitter } from 'events';

export interface SkypeClient extends EventEmitter {

    /**
     * Start a fullscreen, outbound call on the primary diplay.
     * @param  {string}  uri        the uri to dial
     * @return {boolean}            true if the call was started
     */
    call(uri: string): boolean;

    /**
     * Start an outbound call on the primary display.
     * @param  {string}  uri        the uri to dial
     * @param  {boolean} fullscreen true if the UI should be shown full screen
     * @return {boolean}            true if the call was started
     */
    call(uri: string, fullscreen: boolean): boolean;

    /**
     * Start an outbound call.
     * @param  {string}  uri        the uri to dial
     * @param  {boolean} fullscreen true if the UI should be shown full screen
     * @param  {number}  display    the monitor to show the call UI on
     * @return {boolean}            true if the call was started
     */
    call(uri: string, fullscreen: boolean, display: number): boolean;

    /**
     * End all currently active calls.
     * @return {boolean} true if successfull
     */
    endCall(): boolean;
}

/*
endCall

accept
reject

mute

selfView

callInfo

addParticipant
removeParticipant

addIncomingCallListener

isSignedIn
? event listener for auth ?

*/
