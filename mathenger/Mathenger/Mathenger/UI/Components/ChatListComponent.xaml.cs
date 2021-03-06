using System;
using System.Collections;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using Mathenger.config;
using Mathenger.models;
using Mathenger.Models.Enums;
using Mathenger.services;

namespace Mathenger
{
    public partial class ChatListComponent : UserControl
    {
        #region private fields

        private ChatService _chatService = IoC.Get<ChatService>();
        private MessageService _messageService = IoC.Get<MessageService>();

        #endregion

        #region dependency properties

        public static readonly DependencyProperty ChatsProperty =
            DependencyProperty.Register("Chats",
                typeof(ObservableCollection<Chat>), typeof(ChatListComponent));

        public static readonly DependencyProperty SelectedChatProperty =
            DependencyProperty.Register("SelectedChat",
                typeof(Chat), typeof(ChatListComponent));

        public ObservableCollection<Chat> Chats {
            get => (ObservableCollection<Chat>)GetValue(ChatsProperty);
            set => SetValue(ChatsProperty, value);
        }

        public Chat SelectedChat {
            get => (Chat)GetValue(SelectedChatProperty);
            set => SetValue(SelectedChatProperty, value);
        }

        #endregion

        #region constructor

        public ChatListComponent()
        {
            DataContext = this;
            InitializeComponent();
        }

        #endregion

        private void DeleteButton_OnClick(object sender, RoutedEventArgs e)
        {
            var menuItem = sender as MenuItem;
            var menu = menuItem?.Parent as ContextMenu;
            var chat = menu?.DataContext as Chat;
            Debug.Assert(chat != null, nameof(chat) + " != null");
            _chatService.DeleteChat(chat.Id, () =>
            {
                Dispatcher?.Invoke(() => { Chats.Remove(chat); });
                _messageService.UnsubscribeFromChat(chat.Id);
            });
        }

        private void LeaveButton_OnClick(object sender, RoutedEventArgs e)
        {
            var menuItem = sender as MenuItem;
            var menu = menuItem?.Parent as ContextMenu;
            var chat = menu?.DataContext as Chat;
            if (chat?.ChatType == ChatType.PRIVATE_CHAT)
            {
                DeleteButton_OnClick(sender, e);
                return;
            }

            _chatService.LeaveGroupChat(chat as GroupChat, () =>
            {
                Dispatcher?.Invoke(() =>
                {
                    Debug.Assert(chat != null, nameof(chat) + " != null");
                    Chats.Remove(chat);
                    _messageService.UnsubscribeFromChat(chat.Id);
                });
            });
        }
    }

    public class ChatNameConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null) return null;
            var chat = value as Chat;
            Debug.Assert(chat != null, nameof(chat) + " != null");
            if (chat.ChatType.Equals(ChatType.PRIVATE_CHAT))
            {
                var properties = IoC.Get<ApplicationProperties>();
                var contact = chat.Members.First(member => member.Id != properties.MyAccount.Id);
                return contact.FirstName + " " + contact.LastName;
            }
            else if (chat.ChatType.Equals(ChatType.GROUP_CHAT))
            {
                return (chat as GroupChat)?.Name;
            }

            return null;
        }

        public string Convert(Chat chat)
        {
            return Convert(chat, chat.GetType(), null, null) as string;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }

    public class ChatImageConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null) return null;
            var chat = value as Chat;
            Debug.Assert(chat != null, nameof(chat) + " != null");
            if (chat.ChatType.Equals(ChatType.PRIVATE_CHAT))
            {
                var properties = IoC.Get<ApplicationProperties>();
                var contact = chat.Members.First(member => member.Id != properties.MyAccount.Id);
                return contact.Color;
            }

            return "#3459c0";
        }

        public string Convert(Chat chat)
        {
            return Convert(chat, chat.GetType(), null, null) as string;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }

    public class LastMessageConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null) return null;
            var chat = value as Chat;
            Debug.Assert(chat != null, nameof(chat) + " != null");
            return chat.Messages.OrderByDescending(x => x.Time).FirstOrDefault()?.Text;
        }

        public string Convert(Chat chat)
        {
            return Convert(chat, chat.GetType(), null, null) as string;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }

    public class ChatImageInitialsConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null) return null;
            var chat = value as Chat;
            Debug.Assert(chat != null, nameof(chat) + " != null");
            string chatName = new ChatNameConverter().Convert(chat, null, null, null) as string;
            var splittedChatName = chatName.Split(' ');
            if (chat.ChatType.Equals(ChatType.PRIVATE_CHAT))
            {
                try
                {
                    return $"{splittedChatName[0][0]}{splittedChatName[1][0]}".ToUpper();
                }
                catch (IndexOutOfRangeException e)
                {
                    return $"{splittedChatName[0][0]}".ToUpper();
                }
            }
            else if (chat.ChatType.Equals(ChatType.GROUP_CHAT))
            {
                try
                {
                    return $"{splittedChatName[0][0]}{splittedChatName[splittedChatName.Length - 1][0]}".ToUpper();
                }
                catch (IndexOutOfRangeException e)
                {
                    return "";
                }
            }
            return "";
        }

        public string Convert(Chat chat)
        {
            return Convert(chat, chat.GetType(), null, null) as string;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }

    public class LastMessageDateConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null) return null;
            var chat = value as Chat;
            Debug.Assert(chat != null, nameof(chat) + " != null");
            if (chat.Messages.Count == 0) return "";
            var date = chat.Messages.Max(x => x.Time);
            var difference = DateTime.Now - date;
            if (difference.TotalDays < 1)
            {
                return $"{date.Hour}:{date.Minute}";
            }
            else if (difference.TotalDays < 7)
            {
                return date.DayOfWeek;
            }
            else
            {
                return $"{date.Day}.{date.Month}.{date.Year}";
            }
        }

        public string Convert(Chat chat)
        {
            return Convert(chat, chat.GetType(), null, null) as string;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }



    public class ChatLastMessageComparer : IComparer
    {
        public int Compare(Object x, Object y)
        {
            var chat1 = x as Chat;
            var chat2 = y as Chat;
            Debug.Assert(chat1 != null, nameof(chat1) + " != null");
            Debug.Assert(chat2 != null, nameof(chat2) + " != null");
            if (chat1.Messages.Count == 0) { return -1; }
            else if (chat2.Messages.Count == 0) { return 1; }

            return -chat1.Messages.ToList().Max(message => message.Time)
                .CompareTo(chat2.Messages.ToList().Max(message => message.Time));
        }
    }
}