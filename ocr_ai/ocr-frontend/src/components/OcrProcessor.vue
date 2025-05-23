<template>
  <div class="ocr-container">
    <h2>OCR Document Processing</h2>
    
    <div class="connection-info">
      <div class="info-item">
        <strong>API URL:</strong> {{ apiUrl }}
      </div>
      <div class="info-item">
        <strong>Status:</strong> 
        <span :class="connectionStatus.class">{{ connectionStatus.text }}</span>
      </div>
      <button @click="testConnection" class="test-button">Test Connection</button>
    </div>
    
    <div class="upload-section">
      <div class="file-input-wrapper">
        <label for="file-upload" class="file-input-label">
          <span v-if="!selectedFile">Select Document</span>
          <span v-else>{{ selectedFile.name }}</span>
        </label>
        <input 
          id="file-upload" 
          type="file" 
          @change="onFileSelected" 
          accept="image/jpeg,image/png,application/pdf"
          class="file-input" 
        />
      </div>
      <button 
        @click="uploadFile" 
        :disabled="!selectedFile || processing || !isConnected"
        class="upload-button"
      >
        {{ processing ? 'Processing...' : 'Upload & Process' }}
      </button>
    </div>
    
    <div v-if="processing" class="processing">
      <div class="spinner"></div>
      <p>Processing your document...</p>
    </div>
    
    <div v-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="clearError" class="clear-error-btn">Clear</button>
    </div>
    
    <div v-if="results" class="results">
      <h3>Extracted Text:</h3>
      <div class="result-container">
        <div class="result-info">
          <div class="result-item">
            <strong>File:</strong> {{ currentDocument?.fileName }}
          </div>
          <div class="result-item">
            <strong>Processing Time:</strong> {{ formatProcessingTime(currentDocument?.processingTimeMs) }}
          </div>
          <div class="result-item">
            <strong>Uploaded:</strong> {{ formatDate(currentDocument?.uploadTimestamp) }}
          </div>
        </div>
        <pre class="result-text">{{ results }}</pre>
      </div>
    </div>
    
    <div class="history" v-if="history.length > 0">
      <h3>Processing History</h3>
      <ul class="history-list">
        <li v-for="item in history" :key="item.id" class="history-item">
          <div class="history-item-content">
            <div class="history-item-info">
              <strong>{{ item.fileName }}</strong>
              <span class="file-info">{{ formatFileSize(item.fileSize) }} | {{ item.fileType }}</span>
              <span class="timestamp">{{ formatDate(item.uploadTimestamp) }}</span>
              <span class="status" :class="item.status">{{ item.status }}</span>
            </div>
            <div class="history-item-preview" v-if="item.extractedTextPreview">
              {{ item.extractedTextPreview }}
            </div>
            <button @click="viewResult(item)" class="view-button">View Result</button>
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
      history: [],
      currentDocument: null,
      apiUrl: '',
      isConnected: false,
      connectionStatus: { text: 'Checking...', class: 'checking' }
    }
  },
  mounted() {
    this.initializeApiUrl();
    this.testConnection();
    this.loadHistory();
  },
  methods: {
    initializeApiUrl() {
      const currentHost = window.location.hostname;
      
      // Detectează dacă suntem în Kubernetes
      if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
        // Port NodePort pentru OCR backend din kubectl get services (31991)
        this.apiUrl = `http://${currentHost}:31991/api`;
      } else {
        // Fallback pentru dezvoltare locală
        this.apiUrl = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api';
      }
      
      console.log('OCR API URL:', this.apiUrl);
    },
    
    async testConnection() {
      try {
        this.connectionStatus = { text: 'Testing...', class: 'checking' };
        
        const response = await axios.get(`${this.apiUrl.replace('/api', '')}/api/health`, {
          timeout: 10000
        });
        
        console.log('OCR Backend health check:', response.data);
        this.isConnected = true;
        this.connectionStatus = { text: 'Connected', class: 'connected' };
        this.error = null;
      } catch (err) {
        console.error('OCR Backend connection test failed:', err);
        this.isConnected = false;
        this.connectionStatus = { text: 'Disconnected', class: 'disconnected' };
        this.error = `Cannot connect to OCR backend at ${this.apiUrl}. ${err.message}`;
      }
    },
    
    onFileSelected(event) {
      this.selectedFile = event.target.files[0];
      this.error = null;
      this.results = null;
      this.currentDocument = null;
    },
    
    async uploadFile() {
      if (!this.selectedFile) return;
      
      this.processing = true;
      this.error = null;
      
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      
      try {
        console.log('Uploading to:', `${this.apiUrl}/ocr/process`);
        
        const response = await axios.post(`${this.apiUrl}/ocr/process`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 90000 // 90 seconds
        });
        
        console.log('OCR Response:', response.data);
        
        this.results = response.data.text;
        this.currentDocument = {
          id: response.data.documentId,
          fileName: this.selectedFile.name,
          fileSize: this.selectedFile.size,
          fileType: this.selectedFile.type,
          uploadTimestamp: new Date(),
          processingTimeMs: response.data.processingTimeMs
        };
        
        this.loadHistory(); // Reîncarcă istoricul după procesare
      } catch (err) {
        console.error('Upload error:', err);
        let errorMessage = 'Error processing document: ';
        
        if (err.response) {
          errorMessage += err.response.data?.message || err.response.data?.details || `HTTP ${err.response.status}`;
        } else if (err.request) {
          errorMessage += 'Network error - cannot reach server';
        } else {
          errorMessage += err.message;
        }
        
        this.error = errorMessage;
      } finally {
        this.processing = false;
      }
    },
    
    async loadHistory() {
      try {
        const response = await axios.get(`${this.apiUrl}/ocr/history`, {
          timeout: 10000
        });
        this.history = response.data;
        console.log('History loaded:', this.history.length, 'items');
      } catch (err) {
        console.error('Failed to load history:', err);
        if (this.isConnected) {
          this.error = 'Failed to load processing history. Please try again later.';
        }
      }
    },
    
    async viewResult(item) {
      try {
        const response = await axios.get(`${this.apiUrl}/ocr/result/${item.id}`, {
          timeout: 10000
        });
        this.results = response.data.text;
        this.currentDocument = response.data;
        
        // Scroll to results
        this.$nextTick(() => {
          const resultsElement = document.querySelector('.results');
          if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: 'smooth' });
          }
        });
      } catch (err) {
        console.error('Error loading result:', err);
        this.error = 'Error loading result: ' + 
          (err.response?.data?.message || err.message);
      }
    },
    
    clearError() {
      this.error = null;
    },
    
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    
    formatFileSize(bytes) {
      if (!bytes) return '';
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      if (bytes === 0) return '0 Bytes';
      const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
      return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    },
    
    formatProcessingTime(ms) {
      if (!ms) return '';
      if (ms < 1000) return `${ms} ms`;
      return `${(ms / 1000).toFixed(2)} seconds`;
    }
  }
}
</script>

<style scoped>
.ocr-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.connection-info {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.info-item {
  font-size: 0.9em;
}

.test-button {
  padding: 5px 10px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.8em;
}

.checking { color: #ff9800; }
.connected { color: #4caf50; font-weight: bold; }
.disconnected { color: #f44336; font-weight: bold; }

.clear-error-btn {
  margin-left: 10px;
  padding: 5px 10px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.8em;
}

/* Restul stilurilor rămân la fel... */
h2 {
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.upload-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.file-input-wrapper {
  position: relative;
  flex: 1;
}

.file-input {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-input-label {
  display: block;
  padding: 10px 15px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-button {
  padding: 10px 20px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-button:hover {
  background-color: #3367d6;
}

.upload-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.processing {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #4285f4;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 30px;
}

.result-container {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.result-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 10px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #ddd;
}

.result-item {
  font-size: 0.9em;
}

.result-text {
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 15px;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;
}

.history {
  margin-top: 30px;
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.history-item {
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 10px;
  overflow: hidden;
}

.history-item-content {
  padding: 15px;
}

.history-item-info {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
}

.file-info {
  color: #666;
  font-size: 0.85em;
}

.timestamp {
  color: #666;
  font-size: 0.85em;
  margin-left: auto;
}

.status {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8em;
}

.status.completed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status.pending {
  background-color: #fff8e1;
  color: #ff8f00;
}

.status.error {
  background-color: #ffebee;
  color: #c62828;
}

.history-item-preview {
  font-family: monospace;
  font-size: 12px;
  color: #666;
  background-color: #f9f9f9;
  padding: 8px;
  margin: 10px 0;
  border-radius: 4px;
  white-space: pre-wrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 60px;
}

.view-button {
  display: block;
  width: 100%;
  padding: 8px;
  margin-top: 10px;
  background-color: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  text-align: center;
}

.view-button:hover {
  background-color: #bdbdbd;
}

@media (max-width: 576px) {
  .upload-section {
    flex-direction: column;
  }
  
  .result-info {
    flex-direction: column;
    gap: 5px;
  }
  
  .history-item-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .timestamp {
    margin-left: 0;
  }
  
  .connection-info {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>