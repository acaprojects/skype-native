using System.Threading.Tasks;

using Microsoft.Lync.Model;
using Microsoft.Lync.Model.Conversation;
using Microsoft.Lync.Model.Conversation.AudioVideo;

class Disconnected
{
#pragma warning disable CS1998 // Method needs to be async for execution by Edge.js
    public async Task<object> Invoke(dynamic callback)
#pragma warning restore CS1998
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
 
        client.ConversationManager.ConversationAdded += (sender, e) =>
        {
            callback().Start();
            AVModality av = (AVModality)e.Conversation.Modalities[ModalityTypes.AudioVideo];

            if (av.State == ModalityState.Disconnected)
            {
                callback().Start();
            }

            av.ModalityStateChanged += (o, args) =>
            {
                if (args.NewState == ModalityState.Disconnected)
                {
                    callback().Start();
                }
            };
        };

        return true;
    }
}
