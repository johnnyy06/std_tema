<template>
    <div class="chat-box">
        <div class="chat-header">
            <h2>Chat în timp real</h2>
            <div v-if="username" class="user-info">
                Conectat ca: <span class="current-username">{{ username }}</span>
                <button @click="logout" class="logout-btn">Deconectare</button>
            </div>
        </div>

        <message-list :messages="messages" :current-user="username" />

        <message-input :username="username" @send-message="sendMessage" @set-username="setUsername" />

        <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
        </div>

        <div class="connection-status" :class="connectionClass">
            {{ connectionStatus }}
        </div>
    </div>
</template>

<script>
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';
import chatService from '../services/chatService';

export default {
    name: 'ChatBox',
    components: {
        MessageList,
        MessageInput
    },
    data() {
        return {
            username: '',
            messages: [],
            errorMessage: '',
            connectionStatus: 'Conectare...',
            isConnected: false
        }
    },
    computed: {
        connectionClass() {
            return {
                'connected': this.isConnected,
                'disconnected': !this.isConnected
            }
        }
    },
    async mounted() {
        // Încercăm să recuperăm numele utilizatorului din localStorage
        const storedUsername = localStorage.getItem('chat_username');
        if (storedUsername) {
            this.username = storedUsername;
        }

        try {
            // Inițializăm conexiunea SignalR
            await chatService.startConnection();
            this.isConnected = true;
            this.connectionStatus = 'Conectat';

            // Înregistrăm handler-uri pentru evenimente
            chatService.onReceiveMessage((message) => {
                this.messages.push(message);
            });

            chatService.onReceiveMessages((messages) => {
                this.messages = messages;
            });

            chatService.onReceiveError((error) => {
                this.errorMessage = error;
                setTimeout(() => {
                    this.errorMessage = '';
                }, 5000);
            });

            // Cerem toate mesajele existente
            if (this.username) {
                chatService.getMessages();
            }
        } catch (error) {
            console.error('Eroare la conectare:', error);
            this.connectionStatus = 'Deconectat - Reîncercați mai târziu';
        }
    },
    methods: {
        sendMessage(message) {
            chatService.sendMessage(this.username, message);
        },
        setUsername(username) {
            this.username = username;
            localStorage.setItem('chat_username', username);
            // Cerem toate mesajele existente după setarea numelui
            chatService.getMessages();
        },
        logout() {
            this.username = '';
            localStorage.removeItem('chat_username');
        }
    }
}
</script>

<style scoped>
.chat-box {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    height: 600px;
}

.chat-header {
    background-color: #2196f3;
    color: white;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chat-header h2 {
    margin: 0;
    font-size: 1.3em;
    font-weight: 500;
}

.user-info {
    font-size: 0.9em;
    display: flex;
    align-items: center;
    gap: 10px;
}

.current-username {
    font-weight: bold;
}

.logout-btn {
    background-color: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 5px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85em;
}

.logout-btn:hover {
    background-color: rgba(255, 255, 255, 0.3);
}

.error-message {
    background-color: #f44336;
    color: white;
    padding: 10px 15px;
    text-align: center;
    font-size: 0.9em;
}

.connection-status {
    padding: 5px 10px;
    font-size: 0.8em;
    text-align: center;
}

.connected {
    background-color: #e8f5e9;
    color: #2e7d32;
}

.disconnected {
    background-color: #ffebee;
    color: #c62828;
}
</style>