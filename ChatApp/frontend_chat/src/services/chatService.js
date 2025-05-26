import * as signalR from '@microsoft/signalr';
import axios from 'axios';

// Detectare automată pentru Kubernetes sau dezvoltare locală
const getApiUrl = () => {
    const currentHost = window.location.hostname;

    // Verifică dacă suntem în Kubernetes (nu localhost)
    if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
        // Folosește IP-ul nodului și NodePort pentru backend
        return `http://${currentHost}:30088`;
    } else {
        // Dezvoltare locală
        return 'http://localhost:7009';
    }
};

//const API_URL = getApiUrl();
const API_URL = '/';
const HUB_URL = '/chatHub';

let connection = null;

const startConnection = async () => {
    if (connection) return;

    console.log('Connecting to SignalR Hub at:', HUB_URL);

    connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
            withCredentials: false,
            skipNegotiation: false,
            transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

    // Handle connection events
    connection.onreconnecting((error) => {
        console.log('SignalR reconnecting...', error);
    });

    connection.onreconnected((connectionId) => {
        console.log('SignalR reconnected with ID:', connectionId);
    });

    connection.onclose((error) => {
        console.log('SignalR connection closed', error);
        // Retry connection after 5 seconds
        setTimeout(startConnection, 5000);
    });

    try {
        await connection.start();
        console.log('SignalR Connected successfully to:', HUB_URL);
        console.log('Connection ID:', connection.connectionId);
    } catch (err) {
        console.error('Error while connecting to SignalR Hub: ', err);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(startConnection, 5000);
    }
};

const sendMessage = (username, message) => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke('SendMessage', username, message)
            .catch(err => console.error('Error sending message: ', err));
    } else {
        console.error('Connection not established. Cannot send message.');
        // Try to reconnect
        startConnection();
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
        console.log('Fetching messages via HTTP from:', `${API_URL}/api/chat`);
        const response = await axios.get(`${API_URL}/api/chat`);
        return response.data;
    } catch (error) {
        console.error('Error fetching messages via HTTP: ', error);
        return [];
    }
};

const onReceiveMessage = (callback) => {
    if (connection) {
        connection.off('ReceiveMessage'); // Remove previous handlers
        connection.on('ReceiveMessage', (message) => {
            callback(message);
        });
    }
};

const onReceiveMessages = (callback) => {
    if (connection) {
        connection.off('ReceiveMessages'); // Remove previous handlers
        connection.on('ReceiveMessages', (messages) => {
            callback(messages);
        });
    }
};

const onReceiveError = (callback) => {
    if (connection) {
        connection.off('ReceiveError'); // Remove previous handlers
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
    onReceiveError,
    getApiUrl // Export pentru debugging
};