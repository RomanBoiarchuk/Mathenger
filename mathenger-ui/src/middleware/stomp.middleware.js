import {Client} from "@stomp/stompjs";
import {apiConstants, stompConstants} from "../constants";
import {tokenStorage} from "../services/tokenStorage";
import {stompActions} from "../actions";

const stompMiddleware = store => {
    let client = null;
    let topicSubscriptions = {};

    function deactivateClient() {
        if (client != null) {
            Object.values(topicSubscriptions)
                .forEach(subscription => subscription.unsubscribe());
            client.deactivate();
        }
    }

    function setupClient() {
        client = new Client({
            brokerURL: apiConstants.WEB_SOCKET_CONNECTION_URL,
            connectHeaders: {
                Authorization: tokenStorage.getToken()
            },
            debug: str => console.log(str)
        });

        topicSubscriptions = {};

        client.onConnect = frame => {
            console.log(frame);
        };

        client.onStompError = frame => {
            console.log(frame);
        };

        client.activate();
    }

    return next => action => {
        switch (action.type) {
            case stompConstants.CONNECT:
                deactivateClient();
                setupClient();
                return;
            case stompConstants.DISCONNECT:
                deactivateClient();
                return;
            case stompConstants.SEND_MESSAGE:
                if (client != null) {
                    client.publish({
                        destination: action.topic,
                        body: action.message,
                        headers: {'Authorization': tokenStorage.getToken()}
                    });
                }
                return;
            case stompConstants.SUBSCRIBE:
                unsubscribe(topicSubscriptions, action);
                let subscription = client?.subscribe(action.topic, message => {
                    store.dispatch(stompActions.receiveMessage(message.body, action.topic));
                });
                topicSubscriptions[action.topic] = subscription;
                return;
            case stompConstants.UNSUBSCRIBE:
                unsubscribe(topicSubscriptions, action);
                return;
            default:
                return next(action);
        }
    }
};

function unsubscribe(topicSubscriptions, action) {
    if (topicSubscriptions[action.topic]) {
        topicSubscriptions[action.topic].unsubscribe();
        topicSubscriptions[action.topic] = null;
    }
}

export default stompMiddleware;