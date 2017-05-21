using System;
using System.Threading.Tasks;

using Microsoft.Lync.Model;
using Microsoft.Lync.Model.Conversation;
using Microsoft.Lync.Model.Conversation.AudioVideo;

class Incoming
{
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

            if (av.State == ModalityState.Notified)
            {
                callback("Incoming Call").Start();
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
