/**
 * Document Routes
 * @module routes/document.routes
 */

import { Router } from 'express';
import { documentController } from '../controllers/document.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireTenant } from '../middleware/tenant.middleware';
import { uploadSingle, uploadMultiple } from '../middleware/upload.middleware';

const router = Router();

// All routes require authentication and tenant context
router.use(authenticate, requireTenant);

/**
 * @route   POST /api/documents/upload
 * @desc    Upload a single document
 * @access  Private
 */
router.post('/upload', uploadSingle, documentController.uploadDocument.bind(documentController));

/**
 * @route   POST /api/documents/upload-multiple
 * @desc    Upload multiple documents
 * @access  Private
 */
router.post('/upload-multiple', uploadMultiple, documentController.uploadMultipleDocuments.bind(documentController));

/**
 * @route   GET /api/documents
 * @desc    Get all documents for the school
 * @access  Private
 * @query   category, search, page, limit
 */
router.get('/', documentController.getDocuments.bind(documentController));

/**
 * @route   GET /api/documents/categories
 * @desc    Get all document categories
 * @access  Private
 */
router.get('/categories', documentController.getCategories.bind(documentController));

/**
 * @route   GET /api/documents/:id
 * @desc    Get a single document
 * @access  Private
 */
router.get('/:id', documentController.getDocument.bind(documentController));

/**
 * @route   PUT /api/documents/:id
 * @desc    Update document metadata
 * @access  Private
 */
router.put('/:id', documentController.updateDocument.bind(documentController));

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete a document
 * @access  Private
 */
router.delete('/:id', documentController.deleteDocument.bind(documentController));

export default router;
