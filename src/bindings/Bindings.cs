using System.Threading.Tasks;

namespace SkypeClient
{
    class Bindings
    {
        public async Task<object> Call(dynamic options)
        {
            AppController app = AppController.getInstance();
            app.Call(options.uri, options.fullscreen, options.display);
            return null;
        }

        public async Task<object> HangupAll(dynamic options)
        {
            AppController app = AppController.getInstance();
            app.HangupAll();
            return null;
        }

        public async Task<object> OnIncoming(dynamic callback)
        {
            AppController app = AppController.getInstance();
            app.OnIncoming(callback);
            return null;
        }

        public async Task<object> OnConnect(dynamic callback)
        {
            AppController app = AppController.getInstance();
            app.OnConnect(callback);
            return null;
        }

        public async Task<object> OnDisconnect(dynamic callback)
        {
            AppController app = AppController.getInstance();
            app.OnDisconnect(callback);
            return null;
        }
    }
}
