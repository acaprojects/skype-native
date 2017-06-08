using System;
using System.Management;

namespace SkypeClient
{
    public class ProcessWatcher : IDisposable
    {
        private readonly Action onProcessStart;

        private ManagementEventWatcher managementEventWatcher;

        public ProcessWatcher(string targetName, Action onStart)
        {
            onProcessStart = onStart;

            string queryString = "SELECT TargetInstance " +
                                 "FROM __InstanceCreationEvent " +
                                 "WITHIN  10 " +
                                 "WHERE TargetInstance ISA 'Win32_Process' " +
                                 "AND TargetInstance.Name = '" + targetName + "'";

            const string scope = @"\\.\root\CIMV2";

            managementEventWatcher = new ManagementEventWatcher(scope, queryString);
            managementEventWatcher.EventArrived += WatcherEventArrived;
            managementEventWatcher.Start();
        }

        private void WatcherEventArrived(object sender, EventArrivedEventArgs e)
        {
            onProcessStart();
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (managementEventWatcher != null)
                {
                    managementEventWatcher.Stop();
                    managementEventWatcher.EventArrived -= WatcherEventArrived;
                    managementEventWatcher.Dispose();
                }
            }
        }
    }
}
