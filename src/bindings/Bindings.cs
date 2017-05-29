using System.Threading.Tasks;

namespace SkypeClient
{
    class Bindings
    {
        public delegate Task<object> Proxy(object kwargs);

        public async Task<object> Call(dynamic kwargs)
        {
            AppController.Instance().Call(kwargs.uri, kwargs.fullscreen, kwargs.display);
            return null;
        }

        public async Task<object> Join(dynamic kwargs)
        {
            AppController.Instance().JoinMeeting(kwargs.uri, kwargs.fullscreen, kwargs.display);
            return null;
        }

        public async Task<object> HangupAll(dynamic kwargs)
        {
            AppController.Instance().HangupAll();
            return null;
        }

        public async Task<object> Mute(dynamic kwargs)
        {
            AppController.Instance().Mute(kwargs.state);
            return null;
        }

        public async Task<object> OnIncoming(dynamic kwargs)
        {
            AppController.Instance().OnIncoming(kwargs.callback);
            return null;
        }

        public async Task<object> OnConnect(dynamic kwargs)
        {
            AppController.Instance().OnConnect(kwargs.callback);
            return null;
        }

        public async Task<object> OnDisconnect(dynamic kwargs)
        {
            AppController.Instance().OnDisconnect(kwargs.callback);
            return null;
        }

        public async Task<object> OnMuteChange(dynamic kwargs)
        {
            AppController.Instance().OnMuteChange(kwargs.callback);
            return null;
        }

        public async Task<object> GetActiveUser(dynamic kwargs)
        {
            var user = AppController.Instance().GetActiveUser();
            return user;
        }
    }
}
