using System.Threading.Tasks;

public class TestBinding
{
    // Simple identity function for use by unit tests
    public async Task<object> Invoke(dynamic input)
    {
        return input;
    }
}