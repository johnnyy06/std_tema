import * as signalR from '@microsoft/signalr';
import axios from 'axios';

// URL-ul API-ului backend
const API_URL = 'http://localhost:7009';
const HUB_URL = `${API_URL}/chatHub`;

let connection = null;

const startConnection = async () => {
    if (connection) return;

    connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL)
        .withAutomaticReconnect()
        .build();

    try {
        await connection.start();
        console.log('SignalR Connected.');
    } catch (err) {
        console.error('Error while connecting to SignalR Hub: ', err);
        setTimeout(startConnection, 5000);
    }
};

const sendMessage = (username, message) => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke('SendMessage', username, message)
            .catch(err => console.error('Error sending message: ', err));
    } else {
        console.error('Connection not established. Cannot send message.');
    }
};

const getMessages = () => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke('GetMessages')
            .catch(err => console.error('Error getting messages: ', err));
    } else {
        console.error('Connection not established. Cannot get messages.');
    }
};

const getMessagesHttp = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/chat`);
        return response.data;
    } catch (error) {
        console.error('Error fetching messages via HTTP: ', error);
        return [];
    }
};

const onReceiveMessage = (callback) => {
    if (connection) {
        connection.on('ReceiveMessage', (message) => {
            callback(message);
        });
    }
};

const onReceiveMessages = (callback) => {
    if (connection) {
        connection.on('ReceiveMessages', (messages) => {
            callback(messages);
        });
    }
};

const onReceiveError = (callback) => {
    if (connection) {
        connection.on('ReceiveError', (errorMessage) => {
            callback(errorMessage);
        });
    }
};

export default {
    startConnection,
    sendMessage,
    getMessages,
    getMessagesHttp,
    onReceiveMessage,
    onReceiveMessages,
    onReceiveError
};