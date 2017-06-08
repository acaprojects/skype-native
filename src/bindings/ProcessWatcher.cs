using System;
using System.Management;

namespace SkypeClient
{
    public class ProcessWatcher : IDisposable
    {
        private readonly Action action;

        private ManagementEventWatcher managementEventWatcher;

        private static string scope = @"\\.\root\CIMV2";

        public static ProcessWatcher OnCreate(string targetName, Action action)
        {
            return new ProcessWatcher(buildQuery("__InstanceCreationEvent", targetName), action);
        }
 
        public static ProcessWatcher OnDelete(string targetName, Action action)
        {
            return new ProcessWatcher(buildQuery("__InstanceDeletionEvent", targetName), action);
        }

        private static string buildQuery(string source, string target)
        {
            return "SELECT TargetInstance " +
                   "FROM " + source + " " +
                   "WITHIN  10 " +
                   "WHERE TargetInstance ISA 'Win32_Process' " +
                   "AND TargetInstance.Name = '" + target + "'";
        }

        private ProcessWatcher(string query, Action action)
        {
            this.action = action;

            managementEventWatcher = new ManagementEventWatcher(scope, query);
            managementEventWatcher.EventArrived += WatcherEventArrived;
            managementEventWatcher.Start();
        }

        private void WatcherEventArrived(object sender, EventArrivedEventArgs e)
        {
            action();
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
