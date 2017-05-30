using Microsoft.Lync.Model;
using Microsoft.Lync.Model.Conversation;
using Microsoft.Lync.Model.Conversation.AudioVideo;
using System;

namespace EventMonitor
{
    class Program
    {
        static EventHandler<T> PrintEvent<T>(string message)
        {
            return (o, e) => Console.WriteLine(message);
        }

        static void SubscribeToEvents()
        {
            var client = LyncClient.GetClient();

            client.ConversationManager.ConversationAdded +=
                PrintEvent<ConversationManagerEventArgs>("Conversation added");

            client.ConversationManager.ConversationRemoved +=
                PrintEvent<ConversationManagerEventArgs>("Conversation removed");

            client.ConversationManager.ConversationAdded += (o, e) =>
            {
                var av = (AVModality)e.Conversation.Modalities[ModalityTypes.AudioVideo];

                av.ModalityStateChanged += (sender, args) =>
                {
                    Console.WriteLine("AV modality " + args.OldState + " --> " + args.NewState);
                };
            };
        }

        static void Main(string[] args)
        {
            Console.WriteLine("Listening for Skype client events");

            SubscribeToEvents();

            Console.WriteLine("Hit any key to quit...");
            Console.ReadKey();
        }
    }
}
