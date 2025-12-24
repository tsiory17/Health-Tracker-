namespace HealthTracker.API.Repositories
{
    public interface IRealTimeNotificationService
    {
        Task SendNotificationToUserAsync<T>(int userId, string eventType, T payload);
    }
}
