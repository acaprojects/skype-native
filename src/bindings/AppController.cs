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
    using Proxy = Func<object, Task<object>>;

    class AppController
    {
        private static AppController instance;

        private readonly LyncClient client;

        private readonly Automation automation;

        private AppController(LyncClient client, Automation automation)
        {
            this.client = client;
            this.automation = automation;
        }

        public static AppController Instance()
        {
            if (instance == null)
            {
                var client = LyncClient.GetClient();
                var automation = LyncClient.GetAutomation();
                instance = new AppController(client, automation);
            }

            // TODO check we still have comms with the client / reconnect if nesessary.

            return instance;
        }

        public object GetActiveUser()
        {
            return new {
                uri = client.Self.Contact.Uri
            };
        }

        public void Call(string uri, bool fullscreen = true, int display = 0)
        {
            List<string> participants = new List<string> { uri };

            automation.BeginStartConversation(
                AutomationModalities.Video,
                participants,
                null,
                (ar) =>
                {
                    ConversationWindow window = automation.EndStartConversation(ar);
                    if (fullscreen)
                    {
                        WindowManager.ShowFullscreen(window, display);
                    }
                },
                null);
        }

        public void JoinMeeting(string url, bool fullscreen = true, int display = 0)
        {
            automation.BeginStartConversation(
                url,
                0,
                (ar) =>
                {
                    ConversationWindow window = automation.EndStartConversation(ar);
                    if (fullscreen)
                    {
                        WindowManager.ShowFullscreen(window, display);
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

        public void Fullscreen(int display = 0)
        {
            foreach(var conversation in client.ConversationManager.Conversations)
            {
                WindowManager.ShowFullscreen(conversation, display);
            }
        }

        public void OnIncoming(Proxy callback)
        {
            client.ConversationManager.ConversationAdded += (o, e) =>
            {
                callback(null);

                var conversation = e.Conversation;
                var av = (AVModality)conversation.Modalities[ModalityTypes.AudioVideo];

                // TODO: reject as busy if already in a call

                if (av.State == ModalityState.Notified)
                {
                    var inviter = (Contact)conversation.Properties[ConversationProperty.Inviter];

#pragma warning disable 1998
                    Proxy AcceptCall = async (dynamic kwargs) =>
                    {
                        AcceptIncomingCall(conversation, kwargs.fullscreen, kwargs.display);
                        return null;
                    };

                    Proxy RejectCall = async (dynamic kwargs) =>
                    {
                        av.Reject(ModalityDisconnectReason.Decline);
                        return null;
                    };
#pragma warning restore 1998

                    callback(new
                    {
                        inviter = inviter.Uri,
                        accept = AcceptCall,
                        reject = RejectCall
                    }).Start();
                }
            };
        }

        public void AcceptIncomingCall(Conversation conversation, bool fullscreen = true, int display = 0)
        {
            var av = (AVModality)conversation.Modalities[ModalityTypes.AudioVideo];

            // Start our video on connect
            av.ModalityStateChanged += (sender, args) =>
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

            if (fullscreen) WindowManager.FullscreenOnConnect(conversation, display);

            av.Accept();
        }

        public void OnConnect(Proxy callback)
        {
            client.ConversationManager.ConversationAdded += (o, e) =>
            {
                var conversation = e.Conversation;
                var av = (AVModality)conversation.Modalities[ModalityTypes.AudioVideo];
 
                av.ModalityStateChanged += (sender, args) =>
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

        public void OnDisconnect(Proxy callback)
        {
            client.ConversationManager.ConversationAdded += (o, e) =>
            {
                var conversation = e.Conversation;
                var av = (AVModality)conversation.Modalities[ModalityTypes.AudioVideo];
                av.ModalityStateChanged += (sender, args) =>
                {
                    if (args.NewState == ModalityState.Disconnected)
                    {
                        callback(null).Start();
                    }
                };
            };
        }
        
        public void OnMuteChange(Proxy callback)
        {
            client.ConversationManager.ConversationAdded += (o, e) =>
            {
                var conversation = e.Conversation;
                var self = conversation.SelfParticipant;
                var av = (AVModality)conversation.Modalities[ModalityTypes.AudioVideo];
                av.AVModalityPropertyChanged += (sender, args) =>
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
