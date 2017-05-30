using Microsoft.Lync.Model;
using Microsoft.Lync.Model.Conversation;
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
