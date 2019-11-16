using System;
using System.Collections.ObjectModel;
using System.Linq;
using Mathenger.config;
using Mathenger.dto;
using Mathenger.models;
using RestSharp;

namespace Mathenger.services
{
    public class ChatService
    {
        private RequestSender _sender;

        public ChatService(RequestSender sender)
        {
            _sender = sender;
        }

        public void GetMyChats(Action<ObservableCollection<chat>> chatsConsumer)
        {
            var request = new RestRequest("/chats", Method.GET);
            _sender.Send<ChatsDTO>(request, dto =>
            {
                var chats = dto.PrivateChats.Cast<chat>()
                    .Concat(dto.GroupChats.Cast<chat>())
                    .ToList();
                chatsConsumer?.Invoke(new ObservableCollection<chat>(chats));
            });
        }

        public void StartPrivateChat(long contactId, Action<chat> chatConsumer)
        {
            var request = new RestRequest($"/chats/new/{contactId}", Method.POST);
            _sender.Send(request, chatConsumer);
        }

        public void StartGroupChat(GroupChat chat, Action<GroupChat> chatConsumer)
        {
            var request = new RestRequest("/chats/new", Method.POST);
            request.AddJsonBody(chat);
            _sender.Send(request, chatConsumer);
        }

        public void DeleteChat(long chatId, Action onSuccess)
        {
            var request = new RestRequest($"/chats/delete/{chatId}", Method.DELETE);
            _sender.Send(request, onSuccess);
        }
    }
}