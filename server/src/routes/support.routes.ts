
import { Router } from 'express';
import { createTicket, getTickets, getTicket, addMessage, updateTicket } from '../controllers/support.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

router.post('/', createTicket);
router.get('/', getTickets);
router.get('/:id', getTicket);
router.post('/:id/messages', addMessage);
router.patch('/:id', updateTicket);

export default router;
