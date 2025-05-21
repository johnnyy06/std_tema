require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ocrRoutes = require('./routes/ocr');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:8080', // URL-ul frontend-ului tău Vue
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/ocr', ocrRoutes);

// Health check endpoint for Kubernetes
app.get('/health', (req, res) => {
    res.status(200).send('Healthy');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});