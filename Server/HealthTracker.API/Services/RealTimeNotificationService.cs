using HealthTracker.API.Hubs;
using HealthTracker.API.Repositories;
using Microsoft.AspNetCore.SignalR;

namespace HealthTracker.API.Services
{
    public class RealTimeNotificationService : IRealTimeNotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public RealTimeNotificationService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendNotificationToUserAsync<T>(int userId, string eventType, T payload)
        {
            await _hubContext.Clients.Group(userId.ToString()).SendAsync("ReceiveNotification", new
            {
                eventType,
                payload
            });
        }
    }
}
