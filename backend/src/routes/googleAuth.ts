import express from 'express';
import passport from 'passport';
import { generateToken } from '../utils/auth';

const router = express.Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

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
