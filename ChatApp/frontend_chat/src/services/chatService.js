import * as signalR from '@microsoft/signalr';
import axios from 'axios';

// Pentru Kubernetes - folosește adresa externă NodePort
// Înlocuiește YOUR_NODE_IP cu IP-ul real al nodului Kubernetes
const NODE_IP = 'YOUR_NODE_IP'; // ex: '192.168.1.100' sau 'localhost' dacă rulezi local
const API_URL = `http://${NODE_IP}:30088`; // NodePort pentru backend
const HUB_URL = `${API_URL}/chatHub`;

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
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Debug)
        .build();

    try {
        await connection.start();
        console.log('SignalR Connected successfully to:', HUB_URL);
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