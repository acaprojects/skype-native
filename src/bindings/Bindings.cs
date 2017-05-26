using System.Threading.Tasks;

namespace SkypeClient
{
    class Bindings
    {
        public async Task<object> Call(dynamic options)
        {
            AppController.Instance().Call(options.uri, options.fullscreen, options.display);
            return null;
        }

        public async Task<object> HangupAll(dynamic options)
        {
            AppController.Instance().HangupAll();
            return null;
        }

        public async Task<object> Mute(dynamic state)
        {
            AppController.Instance().Mute(state);
            return null;
        }

        public async Task<object> OnIncoming(dynamic callback)
        {
            AppController.Instance().OnIncoming(callback);
            return null;
        }

        public async Task<object> OnConnect(dynamic callback)
        {
            AppController.Instance().OnConnect(callback);
            return null;
        }

        public async Task<object> OnDisconnect(dynamic callback)
        {
            AppController.Instance().OnDisconnect(callback);
            return null;
        }

        public async Task<object> OnMuteChange(dynamic callback)
        {
            AppController.Instance().OnMuteChange(callback);
            return null;
        }

        public async Task<object> GetActiveUser(dynamic options)
        {
            var user = AppController.Instance().GetActiveUser();
            return user;
        }
    }
}
