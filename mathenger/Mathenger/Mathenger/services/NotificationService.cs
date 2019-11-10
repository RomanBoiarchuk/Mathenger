using System;
using Mathenger.models;
using Mathenger.Models.Enums;
using Mathenger.utils.stomp;
using Newtonsoft.Json;

namespace Mathenger.services
{
    public class NotificationService
    {
        #region private fields

        private StompSocketProvider _socketProvider;

        #endregion

        #region constructor

        public NotificationService(StompSocketProvider socketProvider)
        {
            _socketProvider = socketProvider;
        }

        #endregion

        public void SubscribeToNewChatNotifications(long userId, Action<Chat> chatConsumer)
        {
            _socketProvider.Subscribe($"notification-{userId}",
                $"user/{userId}/notifications", stompMessage =>
                {
                    var notification = JsonConvert.DeserializeObject<Notification>(stompMessage.Body);
                    if (notification.Type == NotificationType.NEW_CHAT)
                    {
                        chatConsumer?.Invoke(JsonConvert
                            .DeserializeObject<Chat>(notification.Text));
                    }
                });
        }

        public void UnsubscribeToNewChatNotifications(long userId)
        {
            _socketProvider.UnSubscribe($"notification-{userId}");
        }
    }
}