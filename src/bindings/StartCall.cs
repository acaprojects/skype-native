using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Runtime.InteropServices;

using Microsoft.Lync.Model;
using Microsoft.Lync.Model.Extensibility;
using Microsoft.Lync.Model.Conversation;

public class StartCall
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

    public async Task<object> Invoke(dynamic options)
    {
        return Call(options.uri, options.fullscreen, options.display);
    }

    private static bool Call(string uri, bool fullscreen = true, int display = 0)
    {
        List<string> participants = new List<string>
        {
            uri
        };

        try
        {
            // TODO: switch this back to async
            ConversationWindow win = LyncClient.GetAutomation().EndStartConversation(
                LyncClient.GetAutomation().BeginStartConversation(
                    AutomationModalities.Video,
                    participants,
                    null,
                    null,
                    null
                )
            );

            if (fullscreen)
            {
                win.ShowFullScreen(display);
                ForceTop(win.Handle);
            }

            // Close the converation window on AudioVideo disconnect.
            win.Conversation.Modalities[ModalityTypes.AudioVideo].ModalityStateChanged += (object o, ModalityStateChangedEventArgs e) =>
            {
                if (e.NewState == ModalityState.Disconnected)
                {
                    win.Conversation.End();
                }
            };

            return true;
        }
        catch (ClientNotFoundException)
        {
            return false;
        }
    }
}