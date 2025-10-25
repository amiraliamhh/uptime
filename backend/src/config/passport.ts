import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/auth';

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists with this Google ID
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id }
        });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with this email
        user = await prisma.user.findUnique({
          where: { email: profile.emails?.[0]?.value }
        });

        if (user) {
          // Link Google account to existing user
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: profile.id,
              provider: 'google',
              avatar: profile.photos?.[0]?.value,
              isVerified: true
            }
          });
          return done(null, user);
        }

        // Create new user
        user = await prisma.user.create({
          data: {
            email: profile.emails?.[0]?.value!,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
            provider: 'google',
            googleId: profile.id,
            isVerified: true
          }
        });

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
