import * as signalR from '@microsoft/signalr';
import axios from 'axios';

// Use absolute paths for Kubernetes environment
const API_URL = '';  // Empty string since we're using relative paths
const HUB_URL = '/chatHub';

let connection = null;

const startConnection = async () => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        console.log('Already connected to SignalR');
        return;
    }

    console.log('Connecting to SignalR Hub at:', HUB_URL);

    connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
            withCredentials: false,
            skipNegotiation: false,
            transport: signalR.HttpTransportType.WebSockets |
                signalR.HttpTransportType.ServerSentEvents |
                signalR.HttpTransportType.LongPolling
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
        // Re-fetch messages after reconnection
        getMessages();
    });

    connection.onclose((error) => {
        console.log('SignalR connection closed', error);
        connection = null;
        // Retry connection after 5 seconds
        setTimeout(startConnection, 5000);
    });

    try {
        await connection.start();
        console.log('SignalR Connected successfully to:', HUB_URL);
        console.log('Connection ID:', connection.connectionId);
        console.log('Connection state:', connection.state);
    } catch (err) {
        console.error('Error while connecting to SignalR Hub: ', err);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(startConnection, 5000);
    }
};

const sendMessage = (username, message) => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke('SendMessage', username, message)
            .catch(err => {
                console.error('Error sending message: ', err);
                // Try to reconnect
                startConnection();
            });
    } else {
        console.error('Connection not established. Cannot send message.');
        // Try to reconnect
        startConnection();
    }
};

const getMessages = () => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke('GetMessages')
            .catch(err => {
                console.error('Error getting messages: ', err);
                // Fallback to HTTP if SignalR fails
                getMessagesHttp();
            });
    } else {
        console.error('Connection not established. Trying HTTP fallback.');
        // Fallback to HTTP
        getMessagesHttp();
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
        connection.off('ReceiveMessage');
        connection.on('ReceiveMessage', (message) => {
            console.log('Received message:', message);
            callback(message);
        });
    }
};

const onReceiveMessages = (callback) => {
    if (connection) {
        connection.off('ReceiveMessages');
        connection.on('ReceiveMessages', (messages) => {
            console.log('Received messages:', messages);
            callback(messages);
        });
    }
};

const onReceiveError = (callback) => {
    if (connection) {
        connection.off('ReceiveError');
        connection.on('ReceiveError', (errorMessage) => {
            console.error('Received error from server:', errorMessage);
            callback(errorMessage);
        });
    }
};

// Check connection status
const isConnected = () => {
    return connection && connection.state === signalR.HubConnectionState.Connected;
};

export default {
    startConnection,
    sendMessage,
    getMessages,
    getMessagesHttp,
    onReceiveMessage,
    onReceiveMessages,
    onReceiveError,
    isConnected
};