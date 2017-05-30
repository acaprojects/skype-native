using System.Threading.Tasks;

namespace Test
{
#pragma warning disable 1998
    public class TestBinding
    {
        // Simple identity function for use by unit tests
        public async Task<object> Identity(dynamic input)
        {
            return input;
        }
    }
#pragma warning restore 1998
}