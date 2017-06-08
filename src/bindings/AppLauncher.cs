using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SkypeClient
{
    static class AppLauncher
    {
        private static string RootDir = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles) + @"\Microsoft Office\root\";

        private static string newClient = RootDir + @"Office16\lync.exe";
        private static string legacyClient = RootDir + @"Office15\lync.exe";

        public static void StartClient()
        {
            if (File.Exists(newClient))
            {
                Process.Start(newClient);
            }
            else if (File.Exists(legacyClient))
            {
                Process.Start(legacyClient);
            }
            else
            {
                throw new Exception("No Lync or Skype client installed");
            }
        }
    }
}
