import express from 'express';
import passport from 'passport';
import { generateToken } from '../utils/auth';

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     summary: Initiate Google OAuth authentication
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth consent screen
 */
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to frontend with JWT token or error
 */
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    try {
      const user = req.user as any;
      
      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email
      });

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:6051';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:6051'}/login?error=oauth_failed`);
    }
  }
);

export default router;
