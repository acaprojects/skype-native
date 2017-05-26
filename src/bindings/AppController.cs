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

        private readonly Automation automate;

        private AppController()
        {
            client = LyncClient.GetClient();
            automate = LyncClient.GetAutomation();
        }

        public static AppController getInstance()
        {
            if (instance == null)
            {
                instance = new AppController();
            }

            // TODO check we still have comms with the client / reconnect if nesessary.

            return instance;
        }

        public void Call(string uri, bool fullscreen = true, int display = 0)
        {
            List<string> participants = new List<string> { uri };

            automate.BeginStartConversation(
                AutomationModalities.Video,
                participants,
                null,
                (ar) =>
                {
                    ConversationWindow win = automate.EndStartConversation(ar);
                    if (fullscreen)
                    {
                        win.ShowFullScreen(display);
                    }
                },
                null);
        }

        public void HangupAll()
        {
            foreach (var conversation in client.ConversationManager.Conversations)
            {
                conversation.End();
            }
        }

        public void Mute(bool state)
        {
            foreach (var conversation in client.ConversationManager.Conversations)
            {
                var participant = conversation.SelfParticipant;
                participant.BeginSetMute(
                    state,
                    (ar) =>
                    {
                        participant.EndSetMute(ar);
                    },
                    null);
            }
        }

        public void OnIncoming(Func<object, Task<object>> callback)
        {
            client.ConversationManager.ConversationAdded += (c, e) =>
            {
                var conversation = c as Conversation;
                var av = (AVModality)conversation.Modalities[ModalityTypes.AudioVideo];

                // TODO: reject as busy if already in a call

                if (av.State == ModalityState.Notified)
                {
                    var inviter = (Contact)conversation.Properties[ConversationProperty.Inviter];

#pragma warning disable CS1998
                    Func<object, Task<object>> AcceptCall = async (dynamic options) =>
                    {
                        // Start our video on connect
                        av.ModalityStateChanged += (o, args) =>
                        {
                            if (args.NewState == ModalityState.Connected)
                            {
                                var channelStream = av.VideoChannel;

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
                        ConversationWindow window = automate.GetConversationWindow(e.Conversation);
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
            client.ConversationManager.ConversationAdded += (c, e) =>
            {
                var conversation = c as Conversation;
                var av = (AVModality)conversation.Modalities[ModalityTypes.AudioVideo];
 
                av.ModalityStateChanged += (m, args) =>
                {
                    if (args.NewState == ModalityState.Connected)
                    {
                        var participants = conversation.Participants.Select(p => (string)p.Properties[ParticipantProperty.Name]);
                        var participantNames = participants.Cast<string>().ToArray();

                        callback(participants).Start();
                    }
                };
            };
        }

        public void OnDisconnect(Func<object, Task<object>> callback)
        {
            client.ConversationManager.ConversationAdded += (c, e) =>
            {
                var conversation = c as Conversation;
                var av = (AVModality)conversation.Modalities[ModalityTypes.AudioVideo];
                av.ModalityStateChanged += (m, args) =>
                {
                    if (args.NewState == ModalityState.Disconnected)
                    {
                        callback(null).Start();
                    }
                };
            };
        }
        
        public void OnMuteChange(Func<object, Task<object>> callback)
        {
            client.ConversationManager.ConversationAdded += (c, e) =>
            {
                var conversation = c as Conversation;
                var self = conversation.SelfParticipant;
                var av = (AVModality)conversation.Modalities[ModalityTypes.AudioVideo];
                av.AVModalityPropertyChanged += (m, args) =>
                {
                    if (args.Property == ModalityProperty.AVModalityAudioCaptureMute)
                    {
                        var state = (bool)args.Value;
                        callback(state).Start();
                    }
                };
            };
        }
    }
}
