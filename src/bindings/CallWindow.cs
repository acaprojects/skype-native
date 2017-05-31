using Microsoft.Lync.Model.Conversation;
using Microsoft.Lync.Model.Extensibility;
using System;
using System.Runtime.InteropServices;

namespace SkypeClient
{
    static class CallWindow
    {
        // Z order insertion points
        private static readonly IntPtr HWND_BOTTOM = new IntPtr(1);
        private static readonly IntPtr HWND_TOP = new IntPtr(0);
        private static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
        private static readonly IntPtr HWND_NOTOPMOST = new IntPtr(-2);

        // Set window position flags
        private const UInt32 SWP_NOSIZE = 0x0001;
        private const UInt32 SWP_NOMOVE = 0x0002;
        private const UInt32 TOPMOST_FLAGS = SWP_NOMOVE | SWP_NOSIZE;

        // Show window options
        private const int SW_HIDE = 0;
        private const int SW_SHOW = 5;

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

        private static bool ForceTop(IntPtr hWnd)
        {
            return SetWindowPos(hWnd, HWND_TOPMOST, 0, 0, 0, 0, TOPMOST_FLAGS);
        }

        private static bool Show(IntPtr hWnd)
        {
            return ShowWindow(hWnd, SW_SHOW);
        }

        private static bool Hide(IntPtr hWnd)
        {
            return ShowWindow(hWnd, SW_HIDE);
        }
        
        private static void Execute(Func<IntPtr, bool> windowInteraction, ConversationWindow window)
        {
            windowInteraction(window.Handle);
        }

        private static void Execute(Func<IntPtr, bool> windowInteraction, Automation automation, Conversation conversation)
        {
            var window = automation.GetConversationWindow(conversation);
            windowInteraction(window.Handle);
        }

        public static void ForceTop(ConversationWindow window)
        {
            Execute(ForceTop, window);
        }

        public static void ForceTop(Automation automation, Conversation conversation)
        {
            Execute(ForceTop, automation, conversation);
        }

        public static void Hide(ConversationWindow window)
        {
            Execute(Hide, window);
        }

        public static void Hide(Automation automation, Conversation conversation)
        {
            Execute(Hide, automation, conversation);
        }

        public static void Show(ConversationWindow window)
        {
            Execute(Show, window);
        }

        public static void Show(Automation automation, Conversation conversation)
        {
            Execute(Show, automation, conversation);
        }

        public static void ShowFullscreen(ConversationWindow window, int display)
        {
            window.ShowFullScreen(display);
            Show(window);
            ForceTop(window);
        }

        public static void ShowFullscreen(Automation automation, Conversation conversation, int display)
        {
            var window = automation.GetConversationWindow(conversation);
            ShowFullscreen(window, display);
        }
    }
}
