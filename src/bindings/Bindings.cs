using System;
using System.Threading.Tasks;

namespace SkypeClient
{
#pragma warning disable 1998 // all bindings need to be exposed as async for Edge integration
    class Bindings
    {
        private ProcessWatcher processStart;
        private ProcessWatcher processExit;

        public static Func<object, Task<object>> CreateAction(Action<dynamic> action)
        {
            return async (dynamic kwargs) =>
            {
                action(kwargs);
                return null;
            };
        }

        public async Task<object> StartClient(dynamic kwargs)
        {
            AppLauncher.StartClient();
            return null;
        }

        public async Task<object> OnClientStart(dynamic kwargs)
        {
            processStart = ProcessWatcher.OnCreate("lync.exe", () => kwargs.callback(null));
            return null;
        }

        public async Task<object> OnClientExit(dynamic kwargs)
        {
            processExit = ProcessWatcher.OnDelete("lync.exe", () => kwargs.callback(null));
            return null;
        }

        public async Task<object> SignIn(dynamic kwargs)
        {
            AppController.Instance(false).SignIn(kwargs.user, kwargs.password);
            return null;
        }

        public async Task<object> SignOut(dynamic kwargs)
        {
            AppController.Instance().SignOut();
            return null;
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
            AppController.Instance(false).OnIncoming(kwargs.callback);
            return null;
        }

        public async Task<object> OnConnect(dynamic kwargs)
        {
            AppController.Instance(false).OnConnect(kwargs.callback);
            return null;
        }

        public async Task<object> OnDisconnect(dynamic kwargs)
        {
            AppController.Instance(false).OnDisconnect(kwargs.callback);
            return null;
        }

        public async Task<object> OnMuteChange(dynamic kwargs)
        {
            AppController.Instance(false).OnMuteChange(kwargs.callback);
            return null;
        }

        public async Task<object> OnClientStateChange(dynamic kwargs)
        {
            AppController.Instance(false).OnClientStateChange(kwargs.callback);
            return null;
        }

        public async Task<object> GetActiveUser(dynamic kwargs)
        {
            return AppController.Instance().GetActiveUser();
        }

        public async Task<object> GetClientState(dynamic kwargs)
        {
            return AppController.Instance(false).GetClientState();
        }
    }
#pragma warning restore 1998
}
