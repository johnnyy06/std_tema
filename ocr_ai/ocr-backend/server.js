const express = require('express');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const { DocumentAnalysisClient, AzureKeyCredential } = require('@azure/ai-form-recognizer');
const sql = require('mssql');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Încărcăm variabilele de mediu din fișierul .env
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Validate required environment variables
const requiredEnvVars = [
    'AZURE_STORAGE_CONNECTION_STRING',
    'BLOB_CONTAINER_NAME',
    'OCR_ENDPOINT',
    'OCR_KEY',
    'SQL_SERVER',
    'SQL_DATABASE',
    'SQL_USER',
    'SQL_PASSWORD'
];

// Check for missing environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    console.error('Continuing in development mode with mock services...');
}

// Log environment variables for debugging (without sensitive data)
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('BLOB_CONTAINER_NAME:', process.env.BLOB_CONTAINER_NAME);
console.log('OCR_ENDPOINT:', process.env.OCR_ENDPOINT);
console.log('SQL_SERVER:', process.env.SQL_SERVER);
console.log('SQL_DATABASE:', process.env.SQL_DATABASE);
console.log('SQL_USER:', process.env.SQL_USER);
console.log('AZURE_STORAGE_CONNECTION_STRING:', process.env.AZURE_STORAGE_CONNECTION_STRING ? 'Set' : 'Not set');
console.log('OCR_KEY:', process.env.OCR_KEY ? 'Set' : 'Not set');
console.log('SQL_PASSWORD:', process.env.SQL_PASSWORD ? 'Set' : 'Not set');

// Directoare pentru dezvoltare locală
const uploadsDir = path.join(__dirname, 'uploads');
const resultsDir = path.join(__dirname, 'results');

// Asigurăm-ne că directoarele există (pentru dezvoltare locală)
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
}

// Global error handler
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Middleware pentru parsing
app.use(express.json());

// Configurare multer pentru încărcarea fișierelor
// Pentru producție folosim memoryStorage pentru a trimite direct la Azure Blob
// Pentru dezvoltare folosim diskStorage pentru a salva local
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limită
    }
});

// Azure Blob Storage configuration
let blobServiceClient;
let containerClient;
let useAzureStorage = false;

try {
    if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
        blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
        containerClient = blobServiceClient.getContainerClient(process.env.BLOB_CONTAINER_NAME);
        console.log('Azure Blob Storage client initialized successfully');

        // Ensure container exists
        containerClient.createIfNotExists().then(() => {
            console.log(`Container '${process.env.BLOB_CONTAINER_NAME}' created or verified`);
            useAzureStorage = true;
        });
    } else {
        console.log('Azure Blob Storage not configured, using local storage');
    }
} catch (error) {
    console.error('Error initializing Azure Blob Storage client:', error);
    console.log('Using local storage instead');
}

// Azure Document Intelligence (OCR) configuration
let ocrClient;
let useAzureOcr = false;

try {
    if (process.env.OCR_ENDPOINT && process.env.OCR_KEY) {
        ocrClient = new DocumentAnalysisClient(
            process.env.OCR_ENDPOINT,
            new AzureKeyCredential(process.env.OCR_KEY)
        );
        console.log('Azure Document Intelligence client initialized successfully');
        useAzureOcr = true;
    } else {
        console.log('Azure Document Intelligence not configured, using simulated OCR');
    }
} catch (error) {
    console.error('Error initializing Azure Document Intelligence client:', error);
    console.log('Using simulated OCR instead');
}

// SQL Server configuration
const sqlConfig = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true,
        connectionTimeout: 30000,
        requestTimeout: 30000
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// SQL Connection pool
let sqlPool;
let useSqlDatabase = false;

// Simulare bază de date (pentru dezvoltare)
let documents = [];
let nextId = 1;

// Initialize SQL connection pool
async function initializeSqlPool() {
    if (!process.env.SQL_SERVER || !process.env.SQL_DATABASE) {
        console.log('SQL Server not configured, using in-memory storage');
        return false;
    }

    try {
        sqlPool = await sql.connect(sqlConfig);
        console.log('SQL Connection pool initialized successfully');
        useSqlDatabase = true;
        return true;
    } catch (err) {
        console.error('Error initializing SQL connection pool:', err);
        console.log('Using in-memory storage instead');
        return false;
    }
}

// Extract text from OCR result
function extractTextFromOcrResult(result) {
    let extractedText = '';

    if (result && result.pages) {
        for (const page of result.pages) {
            if (page.lines) {
                for (const line of page.lines) {
                    extractedText += line.content + '\n';
                }
            }
        }
    }

    return extractedText.trim();
}

// Simulate OCR for development
function simulateOcr(file) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const extractedText = `Sample OCR text from ${file.originalname}\n\nThis is a simulated OCR text for development purposes.\nThe actual text would be extracted from the document using Azure Document Intelligence API.\n\nFile details:\n- Name: ${file.originalname}\n- Size: ${file.size} bytes\n- Type: ${file.mimetype}`;

            resolve({
                extractedText,
                pages: [{ pageNumber: 1, lines: [{ content: extractedText }] }]
            });
        }, Math.floor(Math.random() * 1000) + 500);
    });
}

// Process document with OCR
app.post('/api/ocr/process', upload.single('file'), async (req, res) => {
    try {
        console.log('OCR process request received');

        if (!req.file) {
            console.error('No file in request');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const file = req.file;
        console.log(`Processing file: ${file.originalname}, size: ${file.size} bytes, type: ${file.mimetype}`);

        // Start timer for performance tracking
        const startTime = Date.now();

        // Variable to store blob URL
        let blobUrl = '';

        // 1. Upload to Azure Blob Storage or save locally
        if (useAzureStorage && containerClient) {
            console.log('Uploading to Azure Blob Storage...');
            // Create safe filename for blob
            const safeFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
            const blobName = `${Date.now()}-${safeFileName}`;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            await blockBlobClient.upload(file.buffer, file.size);
            blobUrl = blockBlobClient.url;
            console.log('File uploaded to blob storage:', blobUrl);
        } else {
            // Salvăm fișierul local (pentru dezvoltare)
            const localFilePath = path.join(uploadsDir, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`);
            fs.writeFileSync(localFilePath, file.buffer);
            blobUrl = localFilePath;
            console.log('File saved locally:', localFilePath);
        }

        // 2. Process with Azure Document Intelligence or simulate OCR
        console.log('Processing with OCR...');
        let extractedText = '';
        let result = null;

        if (useAzureOcr && ocrClient) {
            const poller = await ocrClient.beginAnalyzeDocument(
                "prebuilt-document", // Using the prebuilt document model for OCR
                file.buffer
            );

            result = await poller.pollUntilDone();
            extractedText = extractTextFromOcrResult(result);
            console.log('OCR processing completed with Azure Document Intelligence');
        } else {
            // Simulăm procesul OCR (pentru dezvoltare)
            result = await simulateOcr(file);
            extractedText = result.extractedText;
            console.log('OCR processing simulated (development mode)');
        }

        // Calculate processing time
        const processingTimeMs = Date.now() - startTime;

        // 3. Store in SQL Database or in-memory storage
        console.log('Storing document information...');
        let documentId = 0;

        if (useSqlDatabase && sqlPool) {
            try {
                // Inserăm în tabelul dbo.fileinfo conform structurii tale
                const dbResult = await sqlPool.request()
                    .input('filename', sql.VarChar, file.originalname)
                    .input('blob_store_addr', sql.VarChar, blobUrl)
                    .input('time', sql.DateTime, new Date())
                    .input('file_text', sql.VarChar, extractedText)
                    .query(`
                        INSERT INTO dbo.fileinfo (filename, blob_store_addr, time, file_text)
                        VALUES (@filename, @blob_store_addr, @time, @file_text);
                        SELECT SCOPE_IDENTITY() AS id;
                    `);

                documentId = dbResult.recordset[0].id;
                console.log(`Document stored in SQL database with ID: ${documentId}`);
            } catch (sqlError) {
                console.error('Error storing in SQL database:', sqlError);
                throw new Error(`Database error: ${sqlError.message}`);
            }
        } else {
            // Stocăm în memorie (pentru dezvoltare)
            const newDocument = {
                id: nextId++,
                filename: file.originalname,
                blob_store_addr: blobUrl,
                time: new Date(),
                file_text: extractedText
            };

            documents.push(newDocument);
            documentId = newDocument.id;
            console.log(`Document stored in memory with ID: ${documentId}`);
        }

        // Return response to client
        res.json({
            message: 'Document processed successfully',
            documentId,
            text: extractedText,
            blobUrl,
            processingTimeMs,
            filename: file.originalname,
            fileSize: file.size,
            fileType: file.mimetype
        });
    } catch (error) {
        console.error('Error processing document:', error);
        res.status(500).json({
            message: 'Error processing document',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get processing history
app.get('/api/ocr/history', async (req, res) => {
    try {
        let history = [];

        if (useSqlDatabase && sqlPool) {
            // Query from SQL database
            const result = await sqlPool.request().query(`
                SELECT 
                    id, 
                    filename, 
                    blob_store_addr, 
                    time,
                    CASE 
                        WHEN LEN(file_text) > 200 
                        THEN SUBSTRING(file_text, 1, 200) + '...' 
                        ELSE file_text 
                    END AS extractedTextPreview
                FROM dbo.fileinfo 
                ORDER BY time DESC
            `);

            // Map to our frontend expected format
            history = result.recordset.map(record => ({
                id: record.id,
                fileName: record.filename,
                blobUrl: record.blob_store_addr,
                uploadTimestamp: record.time,
                status: 'completed',
                extractedTextPreview: record.extractedTextPreview,
                // Estimate file size and type from filename if not available
                fileSize: 'Unknown',
                fileType: record.filename.split('.').pop() || 'Unknown'
            }));
        } else {
            // Return from in-memory array
            history = documents.map(doc => ({
                id: doc.id,
                fileName: doc.filename,
                blobUrl: doc.blob_store_addr,
                uploadTimestamp: doc.time,
                status: 'completed',
                extractedTextPreview: doc.file_text.substring(0, 200) + (doc.file_text.length > 200 ? '...' : '')
            }));
        }

        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({
            message: 'Error fetching history',
            details: error.message
        });
    }
});

// Get specific document by ID
app.get('/api/ocr/result/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        let document = null;

        if (useSqlDatabase && sqlPool) {
            // Query from SQL database
            const result = await sqlPool.request()
                .input('id', sql.Int, id)
                .query('SELECT * FROM dbo.fileinfo WHERE id = @id');

            if (result.recordset.length === 0) {
                return res.status(404).json({ message: 'Document not found' });
            }

            const record = result.recordset[0];
            document = {
                id: record.id,
                fileName: record.filename,
                blobUrl: record.blob_store_addr,
                uploadTimestamp: record.time,
                text: record.file_text,
                status: 'completed'
            };
        } else {
            // Find in in-memory array
            document = documents.find(doc => doc.id === id);

            if (!document) {
                return res.status(404).json({ message: 'Document not found' });
            }
        }

        res.json({
            id: document.id,
            fileName: document.filename,
            blobUrl: document.blob_store_addr,
            uploadTimestamp: document.time,
            text: document.file_text,
            status: 'completed'
        });
    } catch (error) {
        console.error('Error retrieving document:', error);
        res.status(500).json({
            message: 'Error retrieving document',
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    const health = {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: Date.now(),
        services: {
            azureBlobStorage: useAzureStorage,
            azureOcr: useAzureOcr,
            sqlDatabase: useSqlDatabase
        },
        environment: process.env.NODE_ENV || 'development'
    };

    // Check if SQL connection is actually working
    if (useSqlDatabase && sqlPool) {
        try {
            await sqlPool.request().query('SELECT 1');
            health.services.sqlDatabase = true;
        } catch (error) {
            health.services.sqlDatabase = false;
            health.status = 'degraded';
        }
    }

    // Set appropriate status code
    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
});

// Initialize database and start server
async function startServer() {
    try {
        // Încercăm să inițializăm conexiunea la baza de date
        // Dacă nu reușim, vom folosi stocarea în memorie
        await initializeSqlPool();

        app.listen(port, () => {
            console.log(`OCR API Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
            console.log(`CORS enabled for ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
            console.log(`Using Azure Blob Storage: ${useAzureStorage}`);
            console.log(`Using Azure OCR: ${useAzureOcr}`);
            console.log(`Using SQL Database: ${useSqlDatabase}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();