import express from 'express';
import { createUser, getUserById, updateUserBalance } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', createUser);
router.get('/:id', getUserById);
router.put('/:id/balance', updateUserBalance);

export default router;



