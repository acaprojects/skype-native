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

            // TODO: reject as busy if already in a call

            if (av.State == ModalityState.Notified)
            {
                Contact inviter = (Contact)e.Conversation.Properties[ConversationProperty.Inviter];

                Func <object, Task<object>> AcceptCall = (i) =>
                {
                    av.Accept();
                    return null;
                };

                Func<object, Task<object>> RejectCall = (i) =>
                {
                    av.Reject(ModalityDisconnectReason.Decline);
                    return null;
                };

                callback(new
                {
                    inviter = inviter.Uri,
                    accept = AcceptCall,
                    reject = RejectCall
                }).Start();
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
