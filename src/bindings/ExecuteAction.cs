using Microsoft.Lync.Model;
using Microsoft.Lync.Model.Conversation;
using Microsoft.Lync.Model.Conversation.AudioVideo;
using System;

namespace SkypeClient
{
    /// <summary>
    /// Abstractions for binding behaviour to the Lync SDK events.
    /// </summary>
    static class ExecuteAction
    {
        /// <summary>
        /// Execute an action on all current conversations as well as any future ones.
        /// </summary>
        public static void OnAllConversations(LyncClient client, Action<Conversation> action)
        {
            Util.ForEach(client.ConversationManager.Conversations, action);

            client.ConversationManager.ConversationAdded += (o, e) =>
            {
                action(e.Conversation);
            };
        }

        /// <summary>
        /// Execute an action on every conversation end event.
        /// </summary>
        public static void OnConversationEnd(LyncClient client, Action<Conversation> action)
        {
            client.ConversationManager.ConversationRemoved += (o, e) =>
            {
                action(e.Conversation);
            };
        }

        /// <summary>
        /// Execute an action on a specific conversation's modality in a specific state.
        /// </summary>
        public static void InState<T>(T modality, ModalityState state, Action<T> action) where T : Modality
        {
            if (modality.State == state) action(modality);

            modality.ModalityStateChanged += (o, e) =>
            {
                if (e.NewState == state) action(modality);
            };
        }

        /// <summary>
        /// Execute an action on a media channel in a specific state.
        /// </summary>
        public static void InState<T>(T channel, ChannelState state, Action<T> action) where T : Channel
        {
            if (channel.State == state) action(channel);

            channel.StateChanged += (o, e) =>
            {
                if (e.NewState == state) action(channel);
            };
        }

        /// <summary>
        /// Execute an action on a modality state within all current and future conversations.
        /// </summary>
        public static void InState<T>(LyncClient client, ModalityTypes modalityType, ModalityState state, Action<Conversation, T> action) where T : Modality
        {
            OnAllConversations(client, conversation =>
            {
                var modality = (T)conversation.Modalities[modalityType];
                InState(modality, state, (T m) => action(conversation, m));
            });
        }
    }
}
