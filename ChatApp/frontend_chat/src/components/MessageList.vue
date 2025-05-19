<template>
  <div class="message-list">
    <div v-if="messages.length === 0" class="no-messages">
      Nu există mesaje. Fii primul care trimite un mesaj!
    </div>
    <div v-else class="messages">
      <div 
        v-for="(message, index) in messages" 
        :key="index" 
        class="message"
        :class="{'current-user': message.username === currentUser}"
      >
        <div class="message-header">
          <span class="username">{{ message.username }}</span>
          <span class="timestamp">{{ formatDate(message.timestamp) }}</span>
        </div>
        <div class="message-content">
          {{ message.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessageList',
  props: {
    messages: {
      type: Array,
      required: true
    },
    currentUser: {
      type: String,
      default: ''
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString();
    }
  },
  updated() {
    // Auto-scroll la cel mai recent mesaj
    const messageList = this.$el;
    messageList.scrollTop = messageList.scrollHeight;
  }
}
</script>

<style scoped>
.message-list {
  height: 400px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
}

.no-messages {
  text-align: center;
  color: #666;
  margin-top: 150px;
}

.messages {
  display: flex;
  flex-direction: column;
}

.message {
  margin-bottom: 15px;
  padding: 10px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-width: 80%;
  align-self: flex-start;
}

.message.current-user {
  align-self: flex-end;
  background-color: #e3f2fd;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 0.9em;
}

.username {
  font-weight: bold;
  color: #2c3e50;
}

.timestamp {
  color: #999;
  font-size: 0.9em;
}

.message-content {
  word-break: break-word;
  line-height: 1.4;
}
</style>