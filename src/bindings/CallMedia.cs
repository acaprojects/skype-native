using Microsoft.Lync.Model;
using Microsoft.Lync.Model.Conversation;
using Microsoft.Lync.Model.Conversation.AudioVideo;
using System;
using System.Threading;

namespace SkypeClient
{
    static class CallMedia
    {
        private static void StartMediaChannel(Channel stream, int retries = 5)
        {
            Action AttemptStart = () => stream.BeginStart(ar => stream.EndStart(ar), stream);

            AttemptStart();

            while ((stream.State != ChannelState.SendReceive) && (retries > 0))
            {
                Thread.Sleep(1000);
                try
                {
                    AttemptStart();
                }
                catch (NotSupportedException)
                {
                    //This is normal...
                }
                retries--;
            }
        }

        private static void StopMediaChannel(Channel stream)
        {
            stream.BeginStop(ar => stream.EndStop(ar), stream);
        }

        public static void StartVideo(AVModality av)
        {
            ExecuteAction.InState(av, ModalityState.Connected, modality =>
            {
                var video = modality.VideoChannel;

                Predicate<Channel> active = channel =>
                       channel.State == ChannelState.Connecting
                    || channel.State == ChannelState.Send
                    || channel.State == ChannelState.SendReceive;
                
                if (!active(video))
                {
                    while (!video.CanInvoke(ChannelAction.Start)) { }
                    StartMediaChannel(video);
                }
            });
        }

        public static void StopVideo(AVModality av)
        {
            var video = av.VideoChannel;
            StopMediaChannel(video);
        }

        public static void AlwaysStartVideo(LyncClient client)
        {
            ExecuteAction.InState<AVModality>(client, ModalityTypes.AudioVideo, ModalityState.Connected, (conversation, modality) =>
            {
                StartVideo(modality);
            });
        }
    }
}
