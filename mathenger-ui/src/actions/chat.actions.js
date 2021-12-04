import {chatConstants} from "../constants";
import {chatService} from "../services";
import {stompActions} from "./stomp.actions";
import addNotification from "react-push-notification";
import {chatUtils} from "../utils";
import {Capacitor} from "@capacitor/core";

export const chatActions = {
    setMyChats,
    selectChat,
    addChat,
    removeChat,
    updateChat,
    addAndSelectIfNotExists
}

function setMyChats() {
    return dispatch => {
        dispatch({
            type: chatConstants.SET_CHATS,
            payload: chatService.getMyChats()
                .then(chats => {
                    chats.forEach(chat => {
                        dispatch(stompActions.subscribe(`/topic/chat/${chat.id}`));
                    });
                    return chats;
                })
        });
    }
}

function addChat(chat) {
    return (dispatch, getState) => {
        const state = getState();
        addNotification({
            title: chatUtils.getName(chat, state.account.currentAccount),
            message: 'New chat',
            native: Capacitor.getPlatform() === 'web'
        });
        dispatch({
            type: chatConstants.ADD_CHAT,
            chat
        });
        dispatch(stompActions.subscribe(`/topic/chat/${chat.id}`));
    }
}

function removeChat(chatId) {
    return dispatch => {
        dispatch({
            type: chatConstants.REMOVE_CHAT,
            chatId
        });
        dispatch(stompActions.unsubscribe(`/topic/chat/${chatId}`));
    }
}

function updateChat(chat) {
    return {
        type: chatConstants.UPDATE_CHAT,
        chat
    }
}

function selectChat(id) {
    return {
        type: chatConstants.SELECT_CHAT,
        id
    }
}

function addAndSelectIfNotExists(chat) {
    return dispatch => {
        dispatch({
            type: chatConstants.ADD_AND_SELECT_IF_NOT_EXISTS,
            chat
        });
        dispatch(stompActions.subscribe(`/topic/chat/${chat.id}`));
    }
}
