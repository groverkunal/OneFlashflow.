
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as path from 'path';
// You might need to adjust the import if pdf-parse has different export styles
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdf = require('pdf-parse'); 
import mammoth from 'mammoth';

admin.initializeApp();

const firestore = admin.firestore();
const storage = admin.storage();

const UPLOAD_PATH_PREFIX = 'uploads/'; // Ensure this matches client-side

export const parseDocumentOnUpload = functions
  .region('us-central1') // Choose your preferred region
  .runWith({ memory: '512MB', timeoutSeconds: 120 }) // Adjust resources as needed
  .storage.object()
  .onFinalize(async (object) => {
    const filePath = object.name; // File path in the bucket.
    const contentType = object.contentType; // File type.
    const bucketName = object.bucket;

    if (!filePath || !contentType) {
      functions.logger.error('File path or content type missing.');
      return null;
    }

    // Ensure we only process files in the designated upload path
    // And that it's not a directory (directories also trigger onFinalize)
    if (!filePath.startsWith(UPLOAD_PATH_PREFIX) || filePath.endsWith('/')) {
      functions.logger.log(`Skipping file not in uploads or is a directory: ${filePath}`);
      return null;
    }
    
    // Extract the firestoreDocId from the filePath (e.g., uploads/userId/firestoreDocId_filename.pdf)
    // This assumes the client includes the Firestore doc ID in the filename when uploading.
    const fileName = path.basename(filePath);
    const firestoreDocId = fileName.split('_')[0]; // Simple extraction, make robust as needed

    if (!firestoreDocId) {
        functions.logger.error('Could not extract Firestore document ID from filename:', fileName);
        return null;
    }

    const docRef = firestore.collection('parsedDocuments').doc(firestoreDocId);

    try {
      await docRef.update({ status: 'parsing' });
      functions.logger.log(`Processing file: ${filePath}`);

      const bucket = storage.bucket(bucketName);
      const tempFilePath = `/tmp/${path.basename(filePath)}`; // Functions run in a read-only env, /tmp is writable
      await bucket.file(filePath).download({ destination: tempFilePath });
      functions.logger.log(`File downloaded to: ${tempFilePath}`);

      let extractedText = '';

      if (contentType === 'application/pdf') {
        // Placeholder: Implement actual PDF parsing
        // const dataBuffer = fs.readFileSync(tempFilePath); // Not needed if pdf-parse takes path
        try {
            const data = await pdf(tempFilePath); // pdf-parse typically takes a buffer or path
            extractedText = data.text;
            functions.logger.log('PDF parsing successful.');
        } catch (pdfError) {
            functions.logger.error('Error parsing PDF:', pdfError);
            await docRef.update({ status: 'failed', error: 'PDF parsing error' });
            return null;
        }

      } else if (
        contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // .docx
        contentType === 'application/msword' // .doc (mammoth might handle .doc with caveats)
      ) {
        // Placeholder: Implement actual DOCX parsing
        try {
            const result = await mammoth.extractRawText({ path: tempFilePath });
            extractedText = result.value;
            functions.logger.log('DOCX parsing successful.');
        } catch (docxError) {
            functions.logger.error('Error parsing DOCX:', docxError);
            await docRef.update({ status: 'failed', error: 'DOCX parsing error' });
            return null;
        }
      } else {
        functions.logger.warn(`Unsupported file type: ${contentType} for file ${filePath}`);
        await docRef.update({ status: 'failed', error: 'Unsupported file type' });
        return null;
      }

      // Preprocessing (optional, customize as needed)
      extractedText = extractedText.replace(/\s\s+/g, ' ').trim();

      await docRef.update({
        extractedText: extractedText,
        status: 'completed',
        parsedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      functions.logger.log(`Successfully parsed and updated Firestore for: ${filePath}`);

      // Optional: Delete the file from /tmp if needed, though it's cleaned up on function completion
      // fs.unlinkSync(tempFilePath);

    } catch (error) {
      functions.logger.error('Error processing file:', error);
      try {
        await docRef.update({
          status: 'failed',
          error: (error instanceof Error ? error.message : 'Unknown processing error'),
        });
      } catch (updateError) {
        functions.logger.error('Error updating Firestore with failure status:', updateError);
      }
    }
    return null;
  });
