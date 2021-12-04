import {Capacitor} from "@capacitor/core";

export const apiConstants = {
    BASE_URL: Capacitor.getPlatform() === 'web'
        ? process.env.REACT_APP_API_BASE_URL
        : process.env.REACT_APP_ANDROID_API_BASE_URL,
    WEB_SOCKET_CONNECTION_URL: Capacitor.getPlatform() === 'web'
        ? process.env.REACT_APP_WEB_SOCKET_CONNECTION_URL
        : process.env.REACT_APP_ANDROID_WEB_SOCKET_CONNECTION_URL
}
