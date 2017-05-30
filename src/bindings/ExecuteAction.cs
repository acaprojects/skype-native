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
        /// <param name="action">an Action delegate to run on each conversation</param>
        public static void OnAllConversations(Action<Conversation> action)
        {
            var client = LyncClient.GetClient();

            Util.ForEach(client.ConversationManager.Conversations, action);

            client.ConversationManager.ConversationAdded += (o, e) =>
            {
                action(e.Conversation);
            };
        }

        /// <summary>
        /// Execute an action on a specific conversation's modality in a specific state.
        /// </summary>
        /// <param name="modality">the Modality to monitor</param>
        /// <param name="state">the state to execute in</param>
        /// <param name="action">an action delegate to run</param>
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
        /// <param name="channel"></param>
        /// <param name="state"></param>
        /// <param name="action"></param>
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
        /// <typeparam name="T"></typeparam>
        /// <param name="modalityType"></param>
        /// <param name="state"></param>
        /// <param name="action"></param>
        public static void InState<T>(ModalityTypes modalityType, ModalityState state, Action<Conversation, T> action) where T : Modality
        {

            OnAllConversations(conversation =>
            {
                var modality = (T)conversation.Modalities[modalityType];
                InState(modality, state, (T m) => action(conversation, m));
            });
        }
    }
}
