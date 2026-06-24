import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadIdentityDocs } from '../middleware/upload.middleware';

export const authRoutes = Router();

authRoutes.post('/register', (req, res) => authController.register(req, res));
authRoutes.post('/verify-otp', (req, res) => authController.verifyOtp(req, res));
authRoutes.post('/refresh', (req, res) => authController.refresh(req, res));
authRoutes.post('/logout', authenticate, (req, res) => authController.logout(req, res));
authRoutes.post('/verify-identity', authenticate, uploadIdentityDocs, (req, res) =>
  authController.verifyIdentity(req, res),
);
authRoutes.get('/verification-status', authenticate, (req, res) =>
  authController.verificationStatus(req, res),
);
authRoutes.delete('/cuenta', authenticate, (req, res) =>
  authController.deleteAccount(req, res),
);
