using System;
using System.Threading.Tasks;
using System.Runtime.InteropServices;

using Microsoft.Lync.Model;
using Microsoft.Lync.Model.Conversation;
using Microsoft.Lync.Model.Conversation.AudioVideo;
using Microsoft.Lync.Model.Extensibility;

class Incoming
{
    private static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
    private const UInt32 SWP_NOSIZE = 0x0001;
    private const UInt32 SWP_NOMOVE = 0x0002;
    private const UInt32 TOPMOST_FLAGS = SWP_NOMOVE | SWP_NOSIZE;

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

    public static bool ForceTop(IntPtr hWnd)
    {
        return SetWindowPos(hWnd, HWND_TOPMOST, 0, 0, 0, 0, TOPMOST_FLAGS);
    }

    public async Task<object> Invoke(dynamic callback)
    {
        return SubscribeToIncoming(callback);
    }

    private static bool SubscribeToIncoming(Func<object, Task<object>> callback)
    {
        LyncClient client;
        try
        {
            client = LyncClient.GetClient();
        }
        catch (ClientNotFoundException)
        {
            return false;
        }

        client.ConversationManager.ConversationAdded += (object sender, ConversationManagerEventArgs e) =>
        {
            AVModality av = (AVModality)e.Conversation.Modalities[ModalityTypes.AudioVideo];

            // TODO: reject as busy if already in a call

            if (av.State == ModalityState.Notified)
            {
                Contact inviter = (Contact)e.Conversation.Properties[ConversationProperty.Inviter];

                Func <object, Task<object>> AcceptCall = (dynamic options) =>
                {
                    av.Accept();

                    // TODO: support choosing display to open on as well as fullscreen as optional

                    // Fullscreen the call window
                    ConversationWindow window = LyncClient.GetAutomation().GetConversationWindow(e.Conversation);
                    window.ShowFullScreen(0);
                    ForceTop(window.Handle);

                    return null;
                };

                Func<object, Task<object>> RejectCall = (dynamic options) =>
                {
                    av.Reject(ModalityDisconnectReason.Decline);
                    return null;
                };

                callback(new
                {
                    inviter = inviter.Uri,
                    accept = AcceptCall,
                    reject = RejectCall
                }).Start();
            }
            else
            {
                // Ignore chat
                e.Conversation.End();
            }
        };

        return true;
    }
}
