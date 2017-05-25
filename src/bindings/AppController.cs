using Microsoft.Lync.Model;
using Microsoft.Lync.Model.Conversation;
using Microsoft.Lync.Model.Conversation.AudioVideo;
using Microsoft.Lync.Model.Extensibility;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SkypeClient
{
    class AppController
    {
        private static AppController instance;

        private readonly LyncClient client;

        private AppController(LyncClient client)
        {
            this.client = client;
        }

        public static AppController getInstance()
        {
            if (instance == null)
            {
                instance = new AppController(LyncClient.GetClient());
            }

            // TODO check we still have comms with the client / reconnect if nesessary.

            return instance;
        }

        public void Call(string uri, bool fullscreen = true, int display = 0)
        {
            List<string> participants = new List<string> { uri };

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
                },
                null);
        }

        public void OnIncoming(Func<object, Task<object>> callback)
        {
            client.ConversationManager.ConversationAdded += (object sender, ConversationManagerEventArgs e) =>
            {
                AVModality av = (AVModality)e.Conversation.Modalities[ModalityTypes.AudioVideo];

                // TODO: reject as busy if already in a call

                if (av.State == ModalityState.Notified)
                {
                    Contact inviter = (Contact)e.Conversation.Properties[ConversationProperty.Inviter];

#pragma warning disable CS1998
                    Func<object, Task<object>> AcceptCall = async (dynamic options) =>
                    {
                        // Start our video on connect
                        av.ModalityStateChanged += (o, args) =>
                        {
                            if (args.NewState == ModalityState.Connected)
                            {
                                VideoChannel channelStream = av.VideoChannel;

                                while (!channelStream.CanInvoke(ChannelAction.Start))
                                {
                                }

                                channelStream.BeginStart(ar => { }, channelStream);
                                var retries = 5;
                                while ((channelStream.State != ChannelState.SendReceive) && (retries > 0))
                                {
                                    Thread.Sleep(1000);
                                    try
                                    {
                                        channelStream.BeginStart(ar => { }, channelStream);
                                    }
                                    catch (NotSupportedException)
                                    {
                                        //This is normal...
                                    }
                                    retries--;
                                }
                            }
                        };

                        av.Accept();

                        // TODO: support choosing display to open on as well as fullscreen as optional

                        // Fullscreen the call window
                        ConversationWindow window = LyncClient.GetAutomation().GetConversationWindow(e.Conversation);
                        window.ShowFullScreen(0);

                        return null;
                    };
#pragma warning restore CS1998

#pragma warning disable CS1998
                    Func<object, Task<object>> RejectCall = async (dynamic options) =>
                    {
                        av.Reject(ModalityDisconnectReason.Decline);
                        return null;
                    };
#pragma warning restore CS1998

                    callback(new
                    {
                        inviter = inviter.Uri,
                        accept = AcceptCall,
                        reject = RejectCall
                    }).Start();
                }
            };
        }

        public void OnConnect(Func<object, Task<object>> callback)
        {
            client.ConversationManager.ConversationAdded += (o, e) =>
            {
                AVModality av = (AVModality)e.Conversation.Modalities[ModalityTypes.AudioVideo];
                av.ModalityStateChanged += (sender, args) =>
                {
                    if (args.NewState == ModalityState.Connected)
                    {
                        var participants = e.Conversation.Participants.Select(p => (string)p.Properties[ParticipantProperty.Name]);
                        var participantNames = participants.Cast<string>().ToArray();

                        callback(participants).Start();
                    }
                };
            };
        }

        public void OnDisconnect(Func<object, Task<object>> callback)
        {
            client.ConversationManager.ConversationAdded += (o, e) =>
            {
                AVModality av = (AVModality)e.Conversation.Modalities[ModalityTypes.AudioVideo];
                av.ModalityStateChanged += (sender, args) =>
                {
                    if (args.NewState == ModalityState.Disconnected)
                    {
                        callback(null).Start();
                    }
                };
            };
        }
    }
}
