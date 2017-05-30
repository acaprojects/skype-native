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
            stream.BeginStart(ar => stream.EndStart(ar), stream);

            while ((stream.State != ChannelState.SendReceive) && (retries > 0))
            {
                Thread.Sleep(1000);
                try
                {
                    stream.BeginStart(ar => stream.EndStart(ar), stream);
                }
                catch (NotSupportedException)
                {
                    //This is normal...
                }
                retries--;
            }
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
    }
}
