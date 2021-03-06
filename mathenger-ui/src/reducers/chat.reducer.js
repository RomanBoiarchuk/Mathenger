import {chatConstants, messageConstants} from "../constants";
import {chatUtils} from "../utils";

const initialState = {
    chats: [],
    selectedChatId: null,
    loading: true
}

function chatReducer(state = initialState, action) {
    switch (action.type) {
        case chatConstants.SET_CHATS_FULFILLED:
            chatUtils.sortByLastMessageDate(action.payload);
            return {
                ...state,
                chats: action.payload,
                loading: false
            };
        case chatConstants.SELECT_CHAT:
            return {
                ...state,
                selectedChatId: action.id
            };
        case messageConstants.NEW_MESSAGE:
            let chat = state.chats.find(chat => chat.id === action.chatId);
            chat.messages = [action.message, ...chat.messages];
            return {
                ...state,
                chats: [chat, ...state.chats.filter(oldChat => oldChat.id !== chat.id)]
            };
        case chatConstants.ADD_CHAT:
            return {
                ...state,
                chats: [action.chat, ...state.chats]
            };
        case chatConstants.REMOVE_CHAT:
            return {
                ...state,
                chats: state.chats.filter(chat => chat.id !== action.chatId)
            };
        case chatConstants.UPDATE_CHAT:
            return {
                ...state,
                chats: state.chats.map(chat => {
                    if (chat.id === action.chat.id) {
                        action.chat.messages = chat.messages;
                        return action.chat;
                    }
                    return chat;
                })
            };
        case chatConstants.ADD_AND_SELECT_IF_NOT_EXISTS:
            return {
                ...state,
                selectedChatId: action.chat.id,
                chats: state.chats.filter(chat => chat.id === action.chat.id).length > 0 ?
                    state.chats : chatUtils.insertSorted(action.chat, state.chats)
            }
        case messageConstants.ADD_OLDER_MESSAGES:
            let chats = [...state.chats];
            chats.filter(chat => chat.id === action.chatId)
                .forEach(chat => {
                    const oldMessageIds = chat.messages.map(message => message.id);
                    const newMessages = action.messages
                        .filter(message => !oldMessageIds.includes(message.id));
                    chat.messages = [...chat.messages, ...newMessages];
                    if (newMessages.length === 0) {
                        chat.loadedAllMessages = true;
                    }
                });
            return {
                ...state,
                chats
            }
        default:
            return state;
    }
}

export default chatReducer;
