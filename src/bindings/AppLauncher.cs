using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;

namespace SkypeClient
{
    public static class AppLauncher
    {
        private static string programFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);

        private static IEnumerable<string> installPaths = new List<string> {
            @"Microsoft Office\root\Office16\lync.exe",
            @"Microsoft Office\Office16\lync.exe",
            @"Microsoft Office\root\Office15\lync.exe",
            @"Microsoft Office\Office15\lync.exe"
        };

        public static IEnumerable<string> paths = installPaths.Select(p => Path.Combine(programFiles, p));

        public static void StartClient()
        {
            try
            {
                var client = paths.First(File.Exists);
                Process.Start(client);
            }
            catch (InvalidOperationException)
            {
                throw new Exception("No Lync or Skype client installed");
            }
        }
    }
}
