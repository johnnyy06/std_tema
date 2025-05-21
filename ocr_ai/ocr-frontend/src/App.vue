<template>
  <div id="app">
    <header>
      <h1>Document OCR Processing</h1>
    </header>
    <main>
      <OcrProcessor />
    </main>
    <footer>
      <p>&copy; 2025 - OCR Document Processing Application</p>
    </footer>
  </div>
</template>

<script>
import OcrProcessor from './components/OcrProcessor.vue'

export default {
  name: 'App',
  components: {
    OcrProcessor
  }
}
</script>

<style>
:root {
  --primary-color: #4285f4;
  --primary-dark: #3367d6;
  --text-color: #333;
  --light-gray: #f5f5f5;
  --medium-gray: #ddd;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--light-gray);
  color: var(--text-color);
  line-height: 1.6;
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
  color: var(--primary-color);
  font-weight: 500;
}

footer {
  text-align: center;
  margin-top: 30px;
  color: #666;
  font-size: 0.9em;
  padding: 20px 0;
  border-top: 1px solid var(--medium-gray);
}

main {
  min-height: 70vh;
}

button {
  cursor: pointer;
}

button:focus, input:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

@media (max-width: 768px) {
  #app {
    padding: 10px;
  }
  
  h1 {
    font-size: 1.5rem;
  }
}
</style>