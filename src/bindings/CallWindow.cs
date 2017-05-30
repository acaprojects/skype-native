using Microsoft.Lync.Model.Conversation;
using Microsoft.Lync.Model.Extensibility;

namespace SkypeClient
{
    static class CallWindow
    {
        public static void ShowFullscreen(ConversationWindow window, int display)
        {
            window.ShowFullScreen(display);
        }

        public static void ShowFullscreen(Automation automation, Conversation conversation, int display)
        {
            var window = automation.GetConversationWindow(conversation);
            ShowFullscreen(window, display);
        }
    }
}
