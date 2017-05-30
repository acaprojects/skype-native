using Microsoft.Lync.Model;
using Microsoft.Lync.Model.Conversation;
using Microsoft.Lync.Model.Conversation.AudioVideo;
using Microsoft.Lync.Model.Extensibility;
using System;

namespace SkypeClient
{
    class WindowManager
    {
        private static ConversationWindow GetWindow(Conversation conversation)
        {
            var client = LyncClient.GetAutomation();
            return client.GetConversationWindow(conversation);
        }

        public static void ShowFullscreen(ConversationWindow window, int display)
        {
            window.ShowFullScreen(display);
        }

        public static void ShowFullscreen(Conversation conversation, int display)
        {
            ShowFullscreen(GetWindow(conversation), display);
        }

        public static void FullscreenOnConnect(Conversation conversation, int display = 0)
        {
            var av = (AVModality)conversation.Modalities[ModalityTypes.AudioVideo];

            EventWatcher.ExecuteInState(av, ModalityState.Connected, () => ShowFullscreen(conversation, display));
        }

    }
}
