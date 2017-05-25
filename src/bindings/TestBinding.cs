using System.Threading.Tasks;

namespace Test
{
    public class TestBinding
    {
        // Simple identity function for use by unit tests
#pragma warning disable CS1998
        public async Task<object> Identity(dynamic input)
#pragma warning restore CS1998
        {
            return input;
        }
    }
}