import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance with base configuration
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Accept': 'application/json'
    },
    timeout: 90000 // 90 seconds timeout for long OCR processing requests
});

// Error interceptor
apiClient.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error.response || error.message);
        return Promise.reject(error);
    }
);

export default {
    /**
     * Process a document with OCR
     * @param {File} file - The file to upload and process
     * @returns {Promise} Promise with the processing result
     */
    processDocument(file) {
        const formData = new FormData();
        formData.append('file', file);

        return apiClient.post('/ocr/process', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    /**
     * Get document processing history
     * @returns {Promise} Promise with the history records
     */
    getHistory() {
        return apiClient.get('/ocr/history');
    },

    /**
     * Get a specific document result by ID
     * @param {number} id - The document ID
     * @returns {Promise} Promise with the document result
     */
    getDocumentResult(id) {
        return apiClient.get(`/ocr/result/${id}`);
    },

    /**
     * Check API health status
     * @returns {Promise} Promise with health check information
     */
    checkHealth() {
        return apiClient.get('/health');
    }
};
