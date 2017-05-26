using System.Threading.Tasks;

namespace SkypeClient
{
    class Bindings
    {
        public async Task<object> Call(dynamic options)
        {
            AppController.getInstance().Call(options.uri, options.fullscreen, options.display);
            return null;
        }

        public async Task<object> HangupAll(dynamic options)
        {
            AppController.getInstance().HangupAll();
            return null;
        }

        public async Task<object> Mute(dynamic state)
        {
            AppController.getInstance().Mute(state);
            return null;
        }

        public async Task<object> OnIncoming(dynamic callback)
        {
            AppController.getInstance().OnIncoming(callback);
            return null;
        }

        public async Task<object> OnConnect(dynamic callback)
        {
            AppController.getInstance().OnConnect(callback);
            return null;
        }

        public async Task<object> OnDisconnect(dynamic callback)
        {
            AppController.getInstance().OnDisconnect(callback);
            return null;
        }

        public async Task<object> OnMuteChange(dynamic callback)
        {
            AppController.getInstance().OnMuteChange(callback);
            return null;
        }
    }
}
