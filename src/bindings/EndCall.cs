using System.Threading.Tasks;

using Microsoft.Lync.Model;
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
            foreach(Conversation conversation in LyncClient.GetClient().ConversationManager.Conversations)
            {
                conversation.End();
            }

            return true;
        }
        catch (ClientNotFoundException)
        {
            return false;
        }
    }
}