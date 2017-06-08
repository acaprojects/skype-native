using System;
using System.Threading.Tasks;

namespace SkypeClient
{
#pragma warning disable 1998 // all bindings need to be exposed as async for Edge integration
    class Bindings
    {
        private ProcessWatcher lyncWatcher;

        public static Func<object, Task<object>> CreateAction(Action<dynamic> action)
        {
            return async (dynamic kwargs) =>
            {
                action(kwargs);
                return null;
            };
        }

        public async Task<object> Call(dynamic kwargs)
        {
            AppController.Instance().Call(kwargs.uri, kwargs.fullscreen, kwargs.display);
            return null;
        }

        public async Task<object> Join(dynamic kwargs)
        {
            AppController.Instance().JoinMeeting(kwargs.url, kwargs.fullscreen, kwargs.display);
            return null;
        }

        public async Task<object> HangupAll(dynamic kwargs)
        {
            AppController.Instance().HangupAll();
            return null;
        }

        public async Task<object> Mute(dynamic kwargs)
        {
            AppController.Instance().MuteAll(kwargs.state);
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

        public async Task<object> OnClientStart(dynamic kwargs)
        {
            lyncWatcher = new ProcessWatcher("lync.exe", () => kwargs.callback(null));
            return null;
        }

        public async Task<object> StartClient(dynamic kwargs)
        {
            AppLauncher.StartClient();
            return null;
        }

        // OnQuit

        // OnSignIn

        // OnSignOut

        // State

        public async Task<object> GetActiveUser(dynamic kwargs)
        {
            var user = AppController.Instance().GetActiveUser();
            return user;
        }
    }
#pragma warning restore 1998
}
