import {notificationTypes, stompConstants} from "../constants";
import {messageActions} from "./message.actions";
import {chatActions} from "./chat.actions";
import addNotification from "react-push-notification";
import {Capacitor} from "@capacitor/core";

export const stompActions = {
    connect,
    disconnect,
    receiveMessage,
    sendMessage,
    subscribe,
    unsubscribe
};

function connect() {
    return {
        type: stompConstants.CONNECT
    }
}

function disconnect() {
    return {
        type: stompConstants.DISCONNECT
    }
}

function receiveMessage(message, topic) {
    return (dispatch, getState) => {
        const userId = getState().account?.currentAccount?.id;
        if (topic.includes("/chat/")) {
            const [chatId] = topic.split("/").slice(-1);
            dispatch(messageActions.addMessage(JSON.parse(message), parseInt(chatId)));
        }
        if (topic === `/topic/user/${userId}/notifications`) {
            const notification = JSON.parse(message);
            let chat;
            switch (notification.type) {
                case notificationTypes.NEW_CHAT:
                    chat = JSON.parse(notification.text);
                    dispatch(chatActions.addChat(chat));
                    break;
                case notificationTypes.CHAT_UNSUBSCRIBE:
                    const chatId = parseInt(notification.text);
                    dispatch(chatActions.removeChat(chatId));
                    break;
                case notificationTypes.CHAT_UPDATE:
                    chat = JSON.parse(notification.text);
                    dispatch(chatActions.updateChat(chat));
                    break;
                case notificationTypes.TEXT:
                    addNotification({
                        title: 'New Notification',
                        message: notification.text,
                        native: Capacitor.getPlatform() === 'web'
                    });
                    break;
                default:
                    break;
            }
        }
    }
}

function sendMessage(message, topic) {
    return {
        type: stompConstants.SEND_MESSAGE,
        message: JSON.stringify(message),
        topic
    }
}

function subscribe(topic) {
    return {
        type: stompConstants.SUBSCRIBE,
        topic
    }
}

function unsubscribe(topic) {
    return {
        type: stompConstants.UNSUBSCRIBE,
        topic
    }
}
