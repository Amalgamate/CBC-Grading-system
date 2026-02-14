import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/permissions.middleware';

const router = Router();
const bookController = new BookController();

// All book routes require authentication
router.use(authenticate);

router.get('/', requirePermission('VIEW_BOOKS'), bookController.getAllBooks);
router.post('/', requirePermission('MANAGE_BOOKS'), bookController.createBook);
router.put('/:id', requirePermission('MANAGE_BOOKS'), bookController.updateBook);
router.post('/:id/assign', requirePermission('MANAGE_BOOKS'), bookController.assignBook);
router.post('/:id/return', requirePermission('MANAGE_BOOKS'), bookController.returnBook);
router.delete('/:id', requirePermission('MANAGE_BOOKS'), bookController.deleteBook);

export default router;
