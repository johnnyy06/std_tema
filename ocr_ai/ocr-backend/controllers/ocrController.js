const azureServices = require('../services/azureServices');
const sql = require('mssql');

// SQL configuration
const sqlConfig = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE,
    server: process.env.SQL_SERVER,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, // for azure
        trustServerCertificate: false // change to true for local dev / self-signed certs
    }
};

// Process document
exports.processDocument = async (req, res) => {
    console.log('Request received:', req.file);
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // 1. Upload to Blob Storage
        const blobUrl = await azureServices.uploadToBlob(req.file);

        // 2. Process with Document Intelligence
        const extractedText = await azureServices.processWithOcr(blobUrl);

        // 3. Save result to SQL Database
        await saveToDatabase(req.file.originalname, blobUrl, extractedText);

        res.status(200).json({ text: extractedText });
    } catch (error) {
        console.error('Error processing document:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get processing history
exports.getHistory = async (req, res) => {
    try {
        await sql.connect(sqlConfig);
        const result = await sql.query`
      SELECT Id, Filename, BlobUrl, Timestamp 
      FROM OcrResults 
      ORDER BY Timestamp DESC
    `;

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error retrieving history:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get result by ID
exports.getResult = async (req, res) => {
    try {
        const id = req.params.id;
        await sql.connect(sqlConfig);
        const result = await sql.query`
      SELECT ExtractedText 
      FROM OcrResults 
      WHERE Id = ${id}
    `;

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Result not found' });
        }

        res.status(200).json({ text: result.recordset[0].ExtractedText });
    } catch (error) {
        console.error('Error retrieving result:', error);
        res.status(500).json({ message: error.message });
    }
};

// Save to database
async function saveToDatabase(filename, blobUrl, extractedText) {
    try {
        await sql.connect(sqlConfig);
        await sql.query`
      INSERT INTO OcrResults (Filename, BlobUrl, Timestamp, ExtractedText)
      VALUES (${filename}, ${blobUrl}, ${new Date()}, ${extractedText})
    `;
    } catch (error) {
        console.error('Error saving to database:', error);
        throw error;
    }
}