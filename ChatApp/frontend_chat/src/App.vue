<template>
  <div id="app">
    <header>
      <h1>Aplicație Chat cu WebSockets</h1>
    </header>
    <main>
      <chat-box />
    </main>
    <footer>
      <p>&copy; 2025 - Aplicație Chat</p>
    </footer>
  </div>
</template>

<script>
import ChatBox from './components/ChatBox.vue'

export default {
  name: 'App',
  components: {
    ChatBox
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 30px;
}

h1 {
  color: #333;
}

footer {
  text-align: center;
  margin-top: 30px;
  color: #666;
  font-size: 0.9em;
}

main {
  min-height: 70vh;
}
</style>