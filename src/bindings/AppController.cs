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

        private readonly Automation automate;

        private AppController()
        {
            client = LyncClient.GetClient();
            automate = LyncClient.GetAutomation();
        }

        public static AppController Instance()
        {
            if (instance == null)
            {
                instance = new AppController();
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

        public void JoinMeeting(string url, bool fullscreen = true, int display = 0)
        {
            // Convert meeting URL's in the format 'https://meet.lync.com/<company>/<user>/<conferenceId>'
            // to the 'conf:sip:userUri;gruu;opaque=app:conf:focus:id:conferenceId?' URI structure
            // string[] linktokens = url.Split('/');
            // string joinUri = "conf:" + client.Self.Contact.Uri + ";gruu;opaque=app:conf:focus:id:" + linktokens.Last() + "?";

            // client.ConversationManager.JoinConference(joinUri);

            string joinUri = url;
            automate.BeginStartConversation(
                joinUri,
                0,
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

#pragma warning disable CS1998
                    Proxy AcceptCall = async (dynamic kwargs) =>
                    {
                        AcceptIncomingCall(conversation, kwargs.fullscreen, kwargs.display);
                        return null;
                    };
#pragma warning restore CS1998

#pragma warning disable CS1998
                    Proxy RejectCall = async (dynamic kwargs) =>
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

            av.Accept();

            if (fullscreen)
            {
                ConversationWindow window = automate.GetConversationWindow(conversation);
                window.ShowFullScreen(display);
            }
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
