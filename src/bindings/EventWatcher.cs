using Microsoft.Lync.Model.Conversation;
using System;

namespace SkypeClient
{
    class EventWatcher
    {
        public static void ExecuteInState(Modality modality, ModalityState state, Action action)
        {
            if (modality.State == state) action();

            modality.ModalityStateChanged += (o, e) =>
            {
                if (e.NewState == state) action();
            };
        }
    }
}
