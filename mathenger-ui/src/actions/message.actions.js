import {messageConstants} from "../constants";
import {stompActions} from "./stomp.actions";
import {mathService} from "../services";
import addNotification from "react-push-notification";
import {chatUtils} from "../utils";
import {Capacitor} from "@capacitor/core";

export const messageActions = {
    addMessage,
    setNextMessage,
    setNextMessageText,
    setNextMessageFormula,
    setLatexPreview,
    setNextMessageFormulaError,
    sendMessage,
    addOlderMessages
};

function addMessage(message, chatId) {
    return (dispatch, getState) => {
        const state = getState();
        const chat = state.chat.chats.find(c => c.id === chatId);
        if (state.account.currentAccount?.id !== message.author.id
            && (document.hidden || state.selectedChatId !== chatId)) {
            addNotification({
                title: chatUtils.getName(chat, state.account.currentAccount),
                message: `${message.author.firstName} ${message.author.lastName}: ${message.text}`,
                native: Capacitor.getPlatform() === 'web',
                silent: state.chat?.chats[0]?.id === chatId
            });
        }
        dispatch({
            type: messageConstants.NEW_MESSAGE,
            chatId,
            message
        });
    };
}

function setNextMessage(message, chatId) {
    return {
        type: messageConstants.SET_NEXT_MESSAGE,
        message,
        chatId
    };
}

function setNextMessageText(text, chatId) {
    return {
        type: messageConstants.SET_NEXT_MESSAGE_TEXT,
        text,
        chatId
    };
}

function setNextMessageFormula(formula, chatId) {
    return (dispatch, getState) => {
        dispatch({
            type: messageConstants.SET_NEXT_FORMULA,
            formula,
            chatId
        });
        if (formula?.trim() === '') {
            dispatch(setLatexPreview('', chatId));
            return;
        }
        setTimeout(() => {
            if (getCurrentFormula(getState, chatId) === formula) {
                mathService.transformToLatex(formula)
                    .then(latex => {
                        if (getCurrentFormula(getState, chatId) === formula) {
                            dispatch(setLatexPreview(latex.toString(), chatId))
                        }
                    }, error => {
                        dispatch(setNextMessageFormulaError(error.data?.message, chatId));
                    });
            }
        }, 600);
    };
}

function setNextMessageFormulaError(error, chatId) {
    return {
        type: messageConstants.SET_NEXT_FORMULA_ERROR,
        error,
        chatId
    };
}

function setLatexPreview(latex, chatId) {
    return {
        type: messageConstants.SET_LATEX_PREVIEW,
        latex,
        chatId,
    };
}

function sendMessage(message, chatId) {
    return dispatch => {
        dispatch(stompActions.sendMessage(message, `/app/chats/${chatId}/send`));
        dispatch(setNextMessage(null, chatId));
    };
}

function addOlderMessages(messages, chatId) {
    return {
        type: messageConstants.ADD_OLDER_MESSAGES,
        messages,
        chatId
    };
}

function getCurrentFormula(getState, chatId) {
    return getState().message
        ?.chatsNextMessages[chatId]?.mathFormula?.formula;
}
