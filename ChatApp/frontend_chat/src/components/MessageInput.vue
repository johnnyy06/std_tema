<template>
    <div class="message-input-container">
        <div v-if="!username" class="username-form">
            <div class="form-title">Introdu numele tău pentru a începe chat-ul</div>
            <div class="input-group">
                <input type="text" v-model="usernameInput" placeholder="Numele tău" @keyup.enter="submitUsername"
                    class="username-input" />
                <button @click="submitUsername" class="submit-btn" :disabled="!usernameInput.trim()">
                    Începe Chat
                </button>
            </div>
        </div>
        <form v-else class="message-form" @submit.prevent="submitMessage">
            <input type="text" v-model="messageInput" placeholder="Scrie un mesaj..." @keyup.enter="submitMessage"
                class="message-input" />
            <button type="submit" class="submit-btn" :disabled="!messageInput.trim()">
                Trimite
            </button>
        </form>
    </div>
</template>

<script>
export default {
    name: 'MessageInput',
    props: {
        username: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            messageInput: '',
            usernameInput: ''
        }
    },
    methods: {
        submitMessage() {
            if (this.messageInput.trim()) {
                this.$emit('send-message', this.messageInput);
                this.messageInput = '';
            }
        },
        submitUsername() {
            if (this.usernameInput.trim()) {
                this.$emit('set-username', this.usernameInput);
            }
        }
    }
}
</script>

<style scoped>
.message-input-container {
    padding: 15px;
    background-color: #fff;
    border-top: 1px solid #eee;
}

.username-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.form-title {
    font-size: 1.1em;
    color: #333;
    margin-bottom: 5px;
    text-align: center;
}

.input-group,
.message-form {
    display: flex;
    gap: 10px;
}

.username-input,
.message-input {
    flex: 1;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1em;
    outline: none;
}

.username-input:focus,
.message-input:focus {
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.submit-btn {
    padding: 0 20px;
    background-color: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
}

.submit-btn:hover {
    background-color: #0d8aee;
}

.submit-btn:disabled {
    background-color: #bdbdbd;
    cursor: not-allowed;
}
</style>