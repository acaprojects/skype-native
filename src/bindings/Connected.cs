using System;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Lync.Model;
using Microsoft.Lync.Model.Conversation;
using Microsoft.Lync.Model.Conversation.AudioVideo;

class Connected
{
#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
    public async Task<object> Invoke(dynamic callback)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
    {
        return SubscribeToConnected(callback);
    }

    private static bool SubscribeToConnected(Func<object, Task<object>> callback)
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
            AVModality av = (AVModality)e.Conversation.Modalities[ModalityTypes.AudioVideo];
            
            av.ModalityStateChanged += (o, args) =>
            {
                if (args.NewState == ModalityState.Connected)
                {
                    var participants = e.Conversation.Participants.Select(p => (string)p.Properties[ParticipantProperty.Name]);
                    callback(participants.Cast<string>().ToArray()).Start();
                }
            };
        };

        return true;
    }
}
