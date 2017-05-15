using System.Threading.Tasks;
using System.Collections.Generic;

using Microsoft.Lync.Model;
using Microsoft.Lync.Model.Extensibility;
using Microsoft.Lync.Model.Conversation;

public class Startup
{
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
            LyncClient.GetAutomation().BeginStartConversation(
                AutomationModalities.Video,
                participants,
                null,
                (ar) =>
                {
                    ConversationWindow win = LyncClient.GetAutomation().EndStartConversation(ar);
                    if (fullscreen)
                    {
                        win.ShowFullScreen(display);
                    }

                    // TODO: close window on call hangup
                    //win.Conversation.StateChanged += Conversation_StateChanged;
                },
                null);
            return true;
        }
        catch (ClientNotFoundException)
        {
            return false;
        }
    }

    private static void Conversation_StateChanged(object sender, ConversationStateChangedEventArgs e)
    {
        //throw new System.NotImplementedException();
    }
}