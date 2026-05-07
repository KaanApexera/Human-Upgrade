import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";
import { User } from "@shared/schema";

export function setupGoogleAuth() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn(
      "Google OAuth credentials not found in environment variables. Google Sign-In will not be available."
    );
    return;
  }

  const baseUrl = process.env.BASE_URL || (process.env.NODE_ENV === "production" ? "https://humanupgrade.app" : "http://localhost:5000");

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${baseUrl}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const googleId = profile.id;

          if (!email) {
            return done(new Error("No email found in Google profile"));
          }

          let user = await storage.getUserByEmail(email);

          if (!user) {
            // Create new user
            user = await storage.createUser({
              name: profile.displayName,
              email: email,
              password: "", // No password for Google users
              // @ts-ignore - googleId is added to schema but might not be in types yet if codegen didn't run
              googleId: googleId,
            });
          } else if (!user.googleId) {
            // Link existing user if they don't have googleId yet
            await storage.updateUser(user.id, { googleId });
            user.googleId = googleId;
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );

  // These are not needed for session-less/token-based auth but required by Passport
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}
