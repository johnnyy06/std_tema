<template>
  <div class="ocr-container">
    <h2>OCR Document Processing</h2>
    
    <div class="upload-section">
      <input type="file" @change="onFileSelected" accept="image/jpeg,image/png,application/pdf" />
      <button @click="uploadFile" :disabled="!selectedFile || processing">Upload & Process</button>
    </div>
    
    <div v-if="processing" class="processing">
      <p>Processing your document...</p>
    </div>
    
    <div v-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    
    <div v-if="results" class="results">
      <h3>Extracted Text:</h3>
      <pre>{{ results }}</pre>
    </div>
    
    <div class="history" v-if="history.length > 0">
      <h3>Processing History</h3>
      <ul>
        <li v-for="(item, index) in history" :key="index">
          <div>
            <strong>{{ item.Filename }}</strong> - {{ formatDate(item.Timestamp) }}
            <button @click="viewResult(item)">View Result</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'OcrProcessor',
  data() {
    return {
      selectedFile: null,
      processing: false,
      results: null,
      error: null,
      history: []
    }
  },
  mounted() {
    this.loadHistory();
  },
  methods: {
    onFileSelected(event) {
      this.selectedFile = event.target.files[0];
      this.error = null;
      this.results = null;
    },
    
    async uploadFile() {
      if (!this.selectedFile) return;
      
      this.processing = true;
      this.error = null;
      
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      
      try {
        // Trimite fișierul la backend pentru procesare
        const response = await axios.post('http://localhost:3000/api/ocr/process', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        this.results = response.data.text;
        this.loadHistory(); // Reîncarcă istoricul după procesare
      } catch (err) {
        this.error = 'Error processing document: ' + (err.response?.data?.message || err.message);
      } finally {
        this.processing = false;
      }
    },
    
    async loadHistory() {
      try {
        const response = await axios.get('http://ocr-backend-service/api/ocr/history');
        this.history = response.data;
      } catch (err) {
        console.error('Failed to load history:', err);
      }
    },
    
    async viewResult(item) {
      try {
        const response = await axios.get(`http://ocr-backend-service/api/ocr/result/${item.Id}`);
        this.results = response.data.text;
      } catch (err) {
        this.error = 'Error loading result: ' + err.message;
      }
    },
    
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleString();
    }
  }
}
</script>

<style scoped>
/* Stilurile sunt la fel ca în exemplul anterior */
</style>