using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace QuaveChallenge.API.Hubs
{
    public class EventHub : Hub
    {
        public async Task SendEventUpdate(string eventType, int communityId, int personId)
        {
            await Clients.All.SendAsync("ReceiveEventUpdate", eventType, communityId, personId);
        }
    }
}