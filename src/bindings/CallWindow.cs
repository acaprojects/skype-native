using Microsoft.Lync.Model;
using Microsoft.Lync.Model.Conversation;
using Microsoft.Lync.Model.Conversation.AudioVideo;
using Microsoft.Lync.Model.Extensibility;
using System;

namespace SkypeClient
{
    static class CallWindow
    {
        public static void ShowFullscreen(ConversationWindow window, int display)
        {
            window.ShowFullScreen(display);
        }

        public static void ShowFullscreen(Conversation conversation, int display)
        {
            var av = (AVModality)conversation.Modalities[ModalityTypes.AudioVideo];

            Func<Conversation, ConversationWindow> window = c => LyncClient.GetAutomation().GetConversationWindow(c);

            Action<Conversation> fullscreen = c => ShowFullscreen(window(c), display);

            ExecuteAction.InState(av, ModalityState.Connected, () => ShowFullscreen(conversation, display));
        }

    }
}
