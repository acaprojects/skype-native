using System;
using System.Threading;
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

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
    public async Task<object> Invoke(dynamic callback)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
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

#pragma warning disable CS1998
                Func <object, Task<object>> AcceptCall = async (dynamic options) =>
                {
                    // Start our video on connect
                    av.ModalityStateChanged += (o, args) =>
                    {
                        if (args.NewState == ModalityState.Connected)
                        {
                            VideoChannel channelStream = av.VideoChannel;

                            while (!channelStream.CanInvoke(ChannelAction.Start))
                            {
                            }

                            channelStream.BeginStart(ar => { }, channelStream);
                            var retries = 5;
                            while ((channelStream.State != ChannelState.SendReceive) && (retries > 0))
                            {
                                Thread.Sleep(1000);

                                try
                                {
                                    channelStream.BeginStart(ar => { }, channelStream);
                                }
                                catch (NotSupportedException)
                                {
                                    //This is normal...
                                }
                                retries--;
                            }
                        }
                    };

                    av.Accept();

                    // TODO: support choosing display to open on as well as fullscreen as optional

                    // Fullscreen the call window
                    ConversationWindow window = LyncClient.GetAutomation().GetConversationWindow(e.Conversation);
                    window.ShowFullScreen(0);
                    ForceTop(window.Handle);

                    return null;
                };
#pragma warning restore CS1998

#pragma warning disable CS1998
                Func<object, Task<object>> RejectCall = async (dynamic options) =>
                {
                    av.Reject(ModalityDisconnectReason.Decline);
                    return null;
                };
#pragma warning restore CS1998

                callback(new
                {
                    inviter = inviter.Uri,
                    accept = AcceptCall,
                    reject = RejectCall
                }).Start();
            }
        };

        return true;
    }
}
