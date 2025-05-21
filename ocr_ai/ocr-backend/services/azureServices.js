const { AzureKeyCredential, DocumentAnalysisClient } = require('@azure/ai-form-recognizer');
const { BlobServiceClient } = require('@azure/storage-blob');

// Azure Storage configuration
const storageConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.BLOB_CONTAINER_NAME || 'ocr-documents';

// Document Intelligence configuration
const ocrEndpoint = process.env.OCR_ENDPOINT;
const ocrKey = process.env.OCR_KEY;

// Upload file to Azure Blob Storage
exports.uploadToBlob = async (file) => {
    // Create a BlobServiceClient
    const blobServiceClient = BlobServiceClient.fromConnectionString(storageConnectionString);

    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create the container if it does not exist
    await containerClient.createIfNotExists();

    // Create a unique name for the blob
    const blobName = `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;

    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload data to the blob
    await blockBlobClient.upload(file.buffer, file.size);

    // Return the URL to the blob
    return blockBlobClient.url;
};

// Process document with Azure Document Intelligence
exports.processWithOcr = async (documentUrl) => {
    const client = new DocumentAnalysisClient(
        ocrEndpoint,
        new AzureKeyCredential(ocrKey)
    );

    // Start the analysis process
    const poller = await client.beginAnalyzeDocumentFromUrl(
        "prebuilt-document",
        documentUrl
    );

    // Wait for the operation to complete
    const result = await poller.pollUntilDone();

    // Extract text from document
    let extractedText = '';

    if (result && result.pages) {
        for (const page of result.pages) {
            for (const line of page.lines || []) {
                extractedText += line.content + '\n';
            }
        }
    }

    return extractedText;
};