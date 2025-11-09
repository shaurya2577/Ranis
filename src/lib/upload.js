/**
 * Multer Configuration for File Uploads
 * 
 * Handles image uploads for custom orders
 * Stores in memory, then uploads to Supabase Storage
 */

import multer from 'multer';

/**
 * Allowed image MIME types
 */
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
];

/**
 * Maximum file size: 5MB
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Memory storage for multer
 * Files are stored in memory as Buffer objects
 */
const storage = multer.memoryStorage();

/**
 * File filter: only allow images
 */
const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`), false);
    }
};

/**
 * Multer middleware configuration
 * 
 * Accepts up to 5 files with field name 'photos'
 * Max file size: 5MB
 */
export const uploadMiddleware = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 5 // Maximum 5 images per request
    }
}).array('photos', 5);

/**
 * Validate uploaded files
 * Returns array of errors or empty array if valid
 */
export function validateUploadedFiles(files) {
    const errors = [];

    if (!files || files.length === 0) {
        return errors; // No files is OK (optional)
    }

    if (files.length > 5) {
        errors.push('Maximum 5 images allowed');
    }

    files.forEach((file, index) => {
        if (file.size > MAX_FILE_SIZE) {
            errors.push(`File ${index + 1} exceeds 5MB limit`);
        }

        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            errors.push(`File ${index + 1} has invalid type: ${file.mimetype}`);
        }
    });

    return errors;
}

