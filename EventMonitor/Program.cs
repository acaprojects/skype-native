using Microsoft.Lync.Model;
using Microsoft.Lync.Model.Conversation;
using Microsoft.Lync.Model.Conversation.AudioVideo;
using SkypeClient;
using System;
using System.Threading.Tasks;

namespace EventMonitor
{
    class Program
    {
        private static ProcessWatcher startupWatcher;
        private static ProcessWatcher quitWatcher;

        static EventHandler<T> PrintEvent<T>(string message)
        {
            return (o, e) => Console.WriteLine(message);
        }

        static void SubscribeToEvents()
        {
            try
            {
                var client = LyncClient.GetClient();

                Console.WriteLine("Attaching client events");

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

                client.StateChanged += (o, e) =>
                {
                    Console.WriteLine("Client state " + e.OldState + " --> " + e.NewState);
                };
            }
            catch (ClientNotFoundException)
            {
                Console.WriteLine("Could not connect to Lync - waiting process start.");
            }
        }

        static void WatchProcess()
        {
            Action delayedSubscribe = async () =>
            {
                Console.WriteLine("Lync process started");
                await Task.Delay(TimeSpan.FromSeconds(5));
                SubscribeToEvents();
            };

            startupWatcher = ProcessWatcher.OnCreate("lync.exe", delayedSubscribe);

            quitWatcher = ProcessWatcher.OnDelete("lync.exe", () => Console.WriteLine("Lync proess exited"));
        }

        static void Main(string[] args)
        {
            Console.WriteLine("Spinning up event monitor");
            Console.WriteLine("Hit any key to quit...");
            Console.WriteLine();
            Console.WriteLine("---");
            Console.WriteLine();

            SubscribeToEvents();

            WatchProcess();

            Console.ReadKey();
        }
    }
}
