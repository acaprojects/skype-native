using Microsoft.Lync.Model;
using Microsoft.Lync.Model.Conversation;
using Microsoft.Lync.Model.Conversation.AudioVideo;
using Microsoft.Lync.Model.Extensibility;
using System;
using System.Collections.Generic;
using System.Linq;
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

            // Autostart video on all calls
            ExecuteAction.InState<AVModality>(ModalityTypes.AudioVideo, ModalityState.Connected, (conversation, modality) =>
            {
                CallMedia.StartVideo(modality);
            });
        }

        public static AppController Instance()
        {
            if (instance == null)
            {
                var client = LyncClient.GetClient();
                var automation = LyncClient.GetAutomation();
                instance = new AppController(client, automation);
            }

            // TODO: check we still have comms with the client / reconnect if nesessary.

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
            Call(participants, fullscreen, display);
        }

        public void Call(List<string> participants, bool fullscreen = true, int display = 0)
        {
            automation.BeginStartConversation(
                AutomationModalities.Video,
                participants,
                null,
                (ar) =>
                {
                    ConversationWindow window = automation.EndStartConversation(ar);
                    if (fullscreen)
                    {
                        CallWindow.ShowFullscreen(window, display);
                    }
                },
                null);
        }

        public void JoinMeeting(string url, bool fullscreen = true, int display = 0)
        {
            automation.BeginStartConversation(
                url,
                0,
                ar =>
                {
                    ConversationWindow window = automation.EndStartConversation(ar);

                    if (fullscreen)
                    {
                        var av = window.Conversation.Modalities[ModalityTypes.AudioVideo];
                        ExecuteAction.InState(av, ModalityState.Connected, (modality) =>
                        {
                            CallWindow.ShowFullscreen(automation, modality.Conversation, display);
                        });
                    }
                },
                null);
        }

        public void HangupAll()
        {
            Action<Conversation> endConversation = conversation =>
            {
                var av = conversation.Modalities[ModalityTypes.AudioVideo];
                av.BeginDisconnect(ModalityDisconnectReason.None,
                    ar =>
                    {
                        av.EndDisconnect(ar);
                        conversation.End();
                    },
                    null);
            };

            Util.ForEach(client.ConversationManager.Conversations, endConversation);
        }

        public void Mute(bool state)
        {
            foreach (var conversation in client.ConversationManager.Conversations)
            {
                var participant = conversation.SelfParticipant;
                participant.BeginSetMute(
                    state,
                    ar =>
                    {
                        participant.EndSetMute(ar);
                    },
                    null);
            }
        }

        public void Fullscreen(int display = 0)
        {
            Action<Conversation> fullscreenOnDisplay = c => CallWindow.ShowFullscreen(automation, c, display);

            Util.ForEach(client.ConversationManager.Conversations, fullscreenOnDisplay);
        }

        public void OnIncoming(Proxy callback)
        {
            ExecuteAction.InState<AVModality>(ModalityTypes.AudioVideo, ModalityState.Notified, (conversation, modality) =>
            {
                var inviter = (Contact)conversation.Properties[ConversationProperty.Inviter];

#pragma warning disable 1998
                Proxy AcceptCall = async (dynamic kwargs) =>
                {
                    modality.Accept();
                    if (kwargs.fullscreen) CallWindow.ShowFullscreen(automation, conversation, kwargs.display);
                    return null;
                };

                Proxy RejectCall = async (dynamic kwargs) =>
                {
                    modality.Reject(ModalityDisconnectReason.Decline);
                    return null;
                };
#pragma warning restore 1998

                callback(new
                {
                    inviter = inviter.Uri,
                    accept = AcceptCall,
                    reject = RejectCall
                });
            });
        }

        public void OnConnect(Proxy callback)
        {
            ExecuteAction.InState<AVModality>(ModalityTypes.AudioVideo, ModalityState.Connected, (conversation, modality) =>
            {
                var participants = conversation.Participants.Select(p => (string)p.Properties[ParticipantProperty.Name]);
                var participantNames = participants.Cast<string>().ToArray();

                callback(participants);
            });
        }

        public void OnDisconnect(Proxy callback)
        {
            ExecuteAction.InState<AVModality>(ModalityTypes.AudioVideo, ModalityState.Disconnected, (conversation, modality) =>
            {
                callback(null);
            });
        }

        public void OnMuteChange(Proxy callback)
        {
            ExecuteAction.OnAllConversations(conversation =>
            {
                var self = conversation.SelfParticipant;
                var av = (AVModality)conversation.Modalities[ModalityTypes.AudioVideo];

                // The client raises multiple property changed events during call setup. Squash these so we one raise events on change. 
                var previousState = (bool)av.Properties[ModalityProperty.AVModalityAudioCaptureMute];

                av.AVModalityPropertyChanged += (o, e) =>
                {
                    if (e.Property == ModalityProperty.AVModalityAudioCaptureMute)
                    {
                        var newState = (bool)e.Value;
                        if (newState != previousState) callback(newState);
                        previousState = newState;
                    }
                };
            });
        }
    }
}
