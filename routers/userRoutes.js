import express from 'express';
const router = express.Router();
import { signupUser, loginUser, getUserProfile } from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/jwtToken.js';

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.get('/profile', authenticateToken, getUserProfile);

export default router;