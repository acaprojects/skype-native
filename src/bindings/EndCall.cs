using System.Threading.Tasks;
using System.Collections.Generic;

using Microsoft.Lync.Model;
using Microsoft.Lync.Model.Extensibility;
using Microsoft.Lync.Model.Conversation;


public class EndCall
{
    public async Task<object> Invoke(dynamic options)
    {
        return HangupAll();
    }

    private static bool HangupAll()
    {
        try {
            return true;
        }
        catch (ClientNotFoundException)
        {
            return false;
        }
    }

    private static void EndConversation(Conversation conversation)
    {
        //conversation.
    }
}