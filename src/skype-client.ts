export interface SkypeClient {

    /**
     * Start a fullscreen, outbound call on the primary diplay.
     * @param  {string}  uri        the uri to dial
     * @return {boolean}            [description]
     */
    call(uri: string): boolean;

    /**
     * Start an outbound call on the primary display.
     * @param  {string}  uri        the uri to dial
     * @param  {boolean} fullscreen true if the UI should be shown full screen
     * @return {boolean}            [description]
     */
    call(uri: string, fullscreen: boolean): boolean;

    /**
     * Start an outbound call.
     * @param  {string}  uri        the uri to dial
     * @param  {boolean} fullscreen true if the UI should be shown full screen
     * @param  {number}  display    the monitor to show the call UI on
     * @return {boolean}            [description]
     */
    call(uri: string, fullscreen: boolean, display: number): boolean;
}

/*
call
endCall

accept
reject

mute

selfView

callInfo

addParticipant
removeParticipant

addIncomingCallListener

*/
