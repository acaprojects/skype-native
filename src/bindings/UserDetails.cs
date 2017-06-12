using Microsoft.Lync.Model;
using System;

namespace SkypeClient
{
    class UserDetails
    {
        public readonly String name;

        public readonly String uri;

        public UserDetails(Contact contact)
        {
            name = (String)contact.GetContactInformation(ContactInformationType.DisplayName);
            uri = contact.Uri;
        }
    }
}
