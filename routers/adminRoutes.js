import express from 'express';
const router = express.Router();
import { adminLogin, getMasters, createMaster } from '../controllers/adminController.js';
import { authenticateToken } from '../middlewares/jwtToken.js';

router.post('/login', adminLogin);
router.post('/master', authenticateToken, createMaster);
router.get('/masters', authenticateToken, getMasters);


export default router;