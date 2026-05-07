import type { Express, Request, Response } from "express";
import express from "express";
import multer from "multer";
import crypto from "crypto";
import { z } from "zod";
import { storage } from "./storage";
import {
  authMiddleware,
  optionalAuthMiddleware,
  validatePassword,
  setSessionCookie,
  clearSessionCookie,
} from "./auth";
import passport from "passport";
import { parseDocument, isImageFile, isPdfFile } from "./documentParser";
import {
  analyzeBiomarkers,
  generateDosAndDonts,
  generateCycleRecommendations,
} from "./openai";
import {
  createCheckoutSession,
  createBillingPortalSession,
  isStripeConfigured,
  processSubscriptionUpdate,
  validatePromotionCode,
  getStripePriceId,
} from "./stripe";
import { getStripeSync } from "./stripeClient";
import {
  getOuraAuthUrl,
  getWhoopAuthUrl,
  exchangeOuraCode,
  exchangeWhoopCode,
  syncOuraData,
  syncWhoopData,
  calculateWearableInsights,
} from "./wearables";
import { generateDailyRoutine } from "./openai";
import { sendWelcomeEmail, sendPasswordResetEmail } from "./email";
import { uploadToR2, isR2Configured } from "./r2";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/bmp",
];

// Memory storage — files live in RAM until uploaded to R2
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Please upload a PDF or image file (PNG, JPG, JPEG, WebP)"));
    }
  },
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<void> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Auth routes
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const data = registerSchema.parse(req.body);

      // Check if user exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create user
      const user = await storage.createUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // Create session
      const session = await storage.createSession(user.id);
      setSessionCookie(res, session.token);

      // Send welcome email (non-blocking)
      sendWelcomeEmail(user.email, user.name || "").catch(() => {});

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
        trialStartDate: user.trialStartDate,
        trialEndsAt: user.trialEndsAt,
        hasUsedTrial: user.hasUsedTrial,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Register error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const data = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValid = await validatePassword(data.password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create session
      const session = await storage.createSession(user.id);
      setSessionCookie(res, session.token);

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input" });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post(
    "/api/logout",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        if (req.sessionToken) {
          await storage.deleteSession(req.sessionToken);
        }
        clearSessionCookie(res);
        res.json({ message: "Logged out" });
      } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Logout failed" });
      }
    }
  );

  app.post("/api/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email required" });

      const user = await storage.getUserByEmail(email);
      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ message: "If an account exists with this email, a reset link has been sent" });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await storage.updateUser(user.id, {
        passwordResetToken: token,
        passwordResetExpires: expires,
      });

      await sendPasswordResetEmail(user.email, token);

      res.json({ message: "If an account exists with this email, a reset link has been sent" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  app.post("/api/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) return res.status(400).json({ message: "Token and password required" });
      if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

      const user = await storage.getUserByResetToken(token);
      if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
        return res.status(400).json({ message: "Reset link is invalid or has expired" });
      }

      const bcrypt = await import("bcrypt");
      const hashed = await bcrypt.hash(password, 10);

      await storage.updateUser(user.id, {
        password: hashed,
        passwordResetToken: null,
        passwordResetExpires: null,
      });

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Google Auth Routes
  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/auth?error=google_failed",
      session: false,
    }),
    async (req: Request, res: Response) => {
      try {
        const user = req.user as any;
        if (!user) {
          return res.redirect("/auth?error=user_not_found");
        }

        // Create session
        const session = await storage.createSession(user.id);
        setSessionCookie(res, session.token);

        res.redirect("/dashboard");
      } catch (error) {
        console.error("Google auth callback error:", error);
        res.redirect("/auth?error=server_error");
      }
    }
  );

  // Current user
  app.get(
    "/api/user",
    optionalAuthMiddleware,
    async (req: Request, res: Response) => {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if uploads need to be reset (new month)
      const user = req.user;
      const now = new Date();
      const lastReset = user.lastUploadReset
        ? new Date(user.lastUploadReset)
        : new Date(0);

      if (
        now.getMonth() !== lastReset.getMonth() ||
        now.getFullYear() !== lastReset.getFullYear()
      ) {
        await storage.updateUser(user.id, {
          pdfUploadsThisMonth: 0,
          lastUploadReset: now,
        });
        user.pdfUploadsThisMonth = 0;
      }

      // Check if trial has expired
      let currentPlan = user.subscriptionPlan;
      let currentStatus = user.subscriptionStatus;

      if (user.subscriptionPlan === "trial" && user.trialEndsAt) {
        if (new Date() > new Date(user.trialEndsAt)) {
          currentPlan = "none";
          currentStatus = "expired";
          await storage.updateUser(user.id, {
            subscriptionPlan: "none",
            subscriptionStatus: "expired",
          });
        }
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        preferredLanguage: user.preferredLanguage || "en",
        subscriptionPlan: currentPlan,
        subscriptionStatus: currentStatus,
        renewalDate: user.renewalDate,
        pdfUploadsThisMonth: user.pdfUploadsThisMonth,
        trialStartDate: user.trialStartDate,
        trialEndsAt: user.trialEndsAt,
        hasUsedTrial: user.hasUsedTrial,
      });
    }
  );

  // Update user language preference
  app.patch(
    "/api/user/language",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const { language } = req.body;
        const validLanguages = ["en", "de", "fr", "es", "tr", "zh", "ja"];

        if (!language || !validLanguages.includes(language)) {
          return res.status(400).json({ message: "Invalid language code" });
        }

        await storage.updateUser(req.user!.id, { preferredLanguage: language });
        res.json({ message: "Language preference updated", language });
      } catch (error) {
        console.error("Update language error:", error);
        res
          .status(500)
          .json({ message: "Failed to update language preference" });
      }
    }
  );

  // Document Upload (PDF or Image)
  app.post(
    "/api/upload",
    authMiddleware,
    upload.single("pdf"),
    async (req: Request, res: Response) => {
      try {
        const user = req.user!;

        // Check subscription - allow active, trial status
        const isTrialActive =
          user.subscriptionPlan === "trial" &&
          user.trialEndsAt &&
          new Date() < new Date(user.trialEndsAt);
        const isPaidActive = user.subscriptionStatus === "active";

        if (!isTrialActive && !isPaidActive) {
          return res
            .status(403)
            .json({ message: "Active subscription or trial required" });
        }

        // Check upload limits for trial and basic users (1 upload max)
        if (
          user.subscriptionPlan === "trial" ||
          user.subscriptionPlan === "basic"
        ) {
          if ((user.pdfUploadsThisMonth || 0) >= 1) {
            return res.status(403).json({
              message:
                user.subscriptionPlan === "trial"
                  ? "Trial upload limit reached. Subscribe to continue analyzing your biomarkers."
                  : "Monthly upload limit reached. Upgrade to Premium for unlimited uploads.",
            });
          }
        }

        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        // Validate file type
        const mimeType = req.file.mimetype;
        if (!isPdfFile(mimeType) && !isImageFile(mimeType)) {
          return res
            .status(400)
            .json({
              message: "Please upload a PDF or image file (PNG, JPG, JPEG)",
            });
        }

        // Upload file to R2 (or fall back to local path key)
        const buffer = req.file.buffer;
        const uniqueKey = `uploads/${user.id}/${Date.now()}-${req.file.originalname.replace(/[^a-z0-9.\-_]/gi, "_")}`;
        let filePath = uniqueKey;
        if (isR2Configured()) {
          try {
            filePath = await uploadToR2(buffer, uniqueKey, req.file.mimetype);
          } catch (r2err) {
            console.error("R2 upload failed:", r2err);
            return res.status(500).json({ message: "File storage unavailable. Please try again." });
          }
        }

        // Create upload record
        const uploadRecord = await storage.createUpload({
          userId: user.id,
          fileName: req.file.originalname,
          filePath,
          fileSize: req.file.size,
        });

        // Update upload count
        await storage.updateUser(user.id, {
          pdfUploadsThisMonth: (user.pdfUploadsThisMonth || 0) + 1,
        });

        try {
          await storage.updateUpload(uploadRecord.id, { status: "processing" });

          const parseResult = await parseDocument(
            buffer,
            mimeType,
            uploadRecord.id,
            user.id
          );

          // Check for red flags (emergency symptoms) in extracted text
          const { detectRedFlags } = await import("./openai");
          const redFlagCheck = detectRedFlags(parseResult.text);

          if (redFlagCheck.detected) {
            await storage.updateUpload(uploadRecord.id, {
              status: "completed",
              extractedText: parseResult.text.substring(0, 10000),
              pageCount: parseResult.pageCount,
              ocrUsed: parseResult.ocrUsed,
            });

            return res.status(200).json({
              uploadId: uploadRecord.id,
              status: "emergency_detected",
              isEmergency: true,
              emergencyMessage: redFlagCheck.emergencyMessage,
              biomarkersFound: 0,
            });
          }

          // Save extracted biomarkers
          if (parseResult.biomarkers.length > 0) {
            await storage.createBiomarkers(parseResult.biomarkers);
          }

          // Update upload with results
          await storage.updateUpload(uploadRecord.id, {
            status: "completed",
            extractedText: parseResult.text.substring(0, 10000),
            pageCount: parseResult.pageCount,
            ocrUsed: parseResult.ocrUsed,
          });

          // Auto-generate protocol
          const biomarkers = await storage.getBiomarkersByUpload(
            uploadRecord.id
          );

          let analysisError: string | null = null;

          if (biomarkers.length > 0) {
            try {
              // Fetch user metrics for personalized fitness protocol
              const userMetrics = await storage.getUserMetrics(user.id);
              const metricsInput = userMetrics
                ? {
                    heightCm: parseFloat(String(userMetrics.heightCm)),
                    weightKg: parseFloat(String(userMetrics.weightKg)),
                    bodyFatPercent: userMetrics.bodyFatPercent
                      ? parseFloat(String(userMetrics.bodyFatPercent))
                      : undefined,
                    age: userMetrics.age,
                    gender: userMetrics.gender as "male" | "female",
                    fitnessGoal: userMetrics.fitnessGoal as
                      | "muscle_gain"
                      | "fat_loss"
                      | "body_recomp",
                    activityLevel: userMetrics.activityLevel as
                      | "sedentary"
                      | "light"
                      | "moderate"
                      | "active"
                      | "very_active"
                      | undefined,
                  }
                : undefined;

              const analysis = await analyzeBiomarkers(biomarkers, metricsInput);

              await storage.createProtocol({
                userId: user.id,
                uploadId: uploadRecord.id,
                performanceAge: analysis.performanceAge,
                peptideReadiness: analysis.peptideReadiness,
                hormoneStatus: analysis.hormoneStatus,
                metabolicStatus: analysis.metabolicStatus,
                inflammation: analysis.inflammation,
                morningRoutine: analysis.morningRoutine,
                eveningRoutine: analysis.eveningRoutine,
                supplementProtocol: analysis.supplementProtocol,
                workoutPlan: analysis.workoutPlan,
                fitnessProtocol: analysis.fitnessProtocol,
                lifestyleGuidance: analysis.lifestyleGuidance,
                risks: analysis.risks,
                notes: analysis.notes,
              });
            } catch (analysisErr: any) {
              console.error("Protocol analysis error:", analysisErr?.message || analysisErr);
              analysisError = analysisErr?.message || "Protocol generation failed";
            }
          }

          res.json({
            uploadId: uploadRecord.id,
            status: "completed",
            biomarkersFound: parseResult.biomarkers.length,
            ocrUsed: parseResult.ocrUsed,
            analysisError: analysisError || undefined,
          });
        } catch (parseError: any) {
          console.error("Document parsing error:", parseError?.message || parseError);
          await storage.updateUpload(uploadRecord.id, { status: "failed" });
          res.status(500).json({ message: "Failed to parse document" });
        }
      } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Upload failed" });
      }
    }
  );

  // Generate/regenerate protocol
  app.post(
    "/api/generate",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const user = req.user!;

        // Check subscription - allow active or trial status
        const isTrialActive =
          user.subscriptionPlan === "trial" &&
          user.trialEndsAt &&
          new Date() < new Date(user.trialEndsAt);
        const isPaidActive = user.subscriptionStatus === "active";

        if (!isTrialActive && !isPaidActive) {
          return res
            .status(403)
            .json({ message: "Active subscription or trial required" });
        }

        // Get user's biomarkers
        const biomarkers = await storage.getUserBiomarkers(user.id);

        if (biomarkers.length === 0) {
          return res
            .status(400)
            .json({
              message: "No biomarkers found. Please upload a PDF first.",
            });
        }

        // Fetch user metrics for personalized fitness protocol
        const userMetrics = await storage.getUserMetrics(user.id);
        const metricsInput = userMetrics
          ? {
              heightCm: parseFloat(String(userMetrics.heightCm)),
              weightKg: parseFloat(String(userMetrics.weightKg)),
              bodyFatPercent: userMetrics.bodyFatPercent
                ? parseFloat(String(userMetrics.bodyFatPercent))
                : undefined,
              age: userMetrics.age,
              gender: userMetrics.gender as "male" | "female",
              fitnessGoal: userMetrics.fitnessGoal as
                | "muscle_gain"
                | "fat_loss"
                | "body_recomp",
              activityLevel: userMetrics.activityLevel as
                | "sedentary"
                | "light"
                | "moderate"
                | "active"
                | "very_active"
                | undefined,
            }
          : undefined;

        const analysis = await analyzeBiomarkers(biomarkers, metricsInput);

        const protocol = await storage.createProtocol({
          userId: user.id,
          performanceAge: analysis.performanceAge,
          peptideReadiness: analysis.peptideReadiness,
          hormoneStatus: analysis.hormoneStatus,
          metabolicStatus: analysis.metabolicStatus,
          inflammation: analysis.inflammation,
          morningRoutine: analysis.morningRoutine,
          eveningRoutine: analysis.eveningRoutine,
          supplementProtocol: analysis.supplementProtocol,
          workoutPlan: analysis.workoutPlan,
          fitnessProtocol: analysis.fitnessProtocol,
          lifestyleGuidance: analysis.lifestyleGuidance,
          risks: analysis.risks,
          notes: analysis.notes,
        });

        // Create audit log for protocol generation
        const inputData = {
          biomarkerCount: biomarkers.length,
          biomarkerNames: biomarkers.map((b) => b.name),
          userMetrics: metricsInput
            ? {
                age: metricsInput.age,
                gender: metricsInput.gender,
                fitnessGoal: metricsInput.fitnessGoal,
              }
            : null,
        };
        const inputHash = crypto
          .createHash("sha256")
          .update(JSON.stringify(inputData))
          .digest("hex");

        await storage.createAuditLog({
          userId: user.id,
          action: "protocol_generated",
          inputSnapshotHash: inputHash,
          inputSnapshot: inputData,
          aiOutput: {
            performanceAge: analysis.performanceAge,
            protocolId: protocol.id,
          },
          modelUsed: "gpt-5",
        });

        res.json(protocol);
      } catch (error) {
        console.error("Generate error:", error);
        res.status(500).json({ message: "Failed to generate protocol" });
      }
    }
  );

  // Get latest protocol
  app.get(
    "/api/protocol",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const user = req.user!;
        const protocol = await storage.getLatestProtocol(user.id);

        if (!protocol) {
          return res.json(null);
        }

        // Check if user is on trial - filter premium fields
        const isTrialActive =
          user.subscriptionPlan === "trial" &&
          user.trialEndsAt &&
          new Date() < new Date(user.trialEndsAt);
        const isPremium =
          user.subscriptionPlan === "premium_monthly" ||
          user.subscriptionPlan === "premium_annual";

        if (isTrialActive && !isPremium) {
          // Trial users only get Performance Age - lock everything else
          return res.json({
            id: protocol.id,
            userId: protocol.userId,
            performanceAge: protocol.performanceAge,
            generatedAt: protocol.generatedAt,
            // Return null for premium fields to enforce frontend locks
            peptideReadiness: null,
            hormoneStatus: null,
            metabolicStatus: null,
            inflammation: null,
            morningRoutine: null,
            eveningRoutine: null,
            supplementProtocol: null,
            workoutPlan: null,
            risks: null,
            notes:
              "Subscribe to unlock your full personalized protocol including hormone analysis, supplement recommendations, and daily routines.",
          });
        }

        res.json(protocol);
      } catch (error) {
        console.error("Get protocol error:", error);
        res.status(500).json({ message: "Failed to get protocol" });
      }
    }
  );

  // Get protocol by user ID
  app.get(
    "/api/protocol/:userId",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        if (req.params.userId !== req.user!.id) {
          return res.status(403).json({ message: "Forbidden" });
        }

        const protocol = await storage.getLatestProtocol(req.params.userId);
        res.json(protocol || null);
      } catch (error) {
        console.error("Get protocol error:", error);
        res.status(500).json({ message: "Failed to get protocol" });
      }
    }
  );

  // Generate Do's and Don'ts (Premium only)
  app.post(
    "/api/protocol/dos-donts",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const user = req.user!;

        // Check premium subscription
        const isPremium =
          user.subscriptionPlan === "premium_monthly" ||
          user.subscriptionPlan === "premium_annual";

        if (!isPremium) {
          return res
            .status(403)
            .json({ message: "Premium subscription required" });
        }

        // Get user's latest protocol and biomarkers
        const protocol = await storage.getLatestProtocol(user.id);
        const biomarkers = await storage.getUserBiomarkers(user.id);

        if (!biomarkers || biomarkers.length === 0) {
          return res
            .status(400)
            .json({
              message:
                "No biomarker data found. Please upload bloodwork first.",
            });
        }

        // Generate do's and don'ts
        const dosAndDonts = await generateDosAndDonts(biomarkers, protocol);

        // Update protocol with the new data
        if (protocol) {
          await storage.updateProtocol(protocol.id, { dosAndDonts });
        }

        res.json(dosAndDonts);
      } catch (error) {
        console.error("Generate do's and don'ts error:", error);
        res.status(500).json({ message: "Failed to generate guidelines" });
      }
    }
  );

  // Generate Cycle Recommendations (Premium only)
  app.post(
    "/api/protocol/cycle-optimizer",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const user = req.user!;

        // Check premium subscription
        const isPremium =
          user.subscriptionPlan === "premium_monthly" ||
          user.subscriptionPlan === "premium_annual";

        if (!isPremium) {
          return res
            .status(403)
            .json({ message: "Premium subscription required" });
        }

        // Get user's latest protocol and biomarkers
        const protocol = await storage.getLatestProtocol(user.id);
        const biomarkers = await storage.getUserBiomarkers(user.id);
        const userMetrics = await storage.getUserMetrics(user.id);

        if (!biomarkers || biomarkers.length === 0) {
          return res
            .status(400)
            .json({
              message:
                "No biomarker data found. Please upload bloodwork first.",
            });
        }

        // Generate cycle recommendations
        const cycleRecommendations = await generateCycleRecommendations(
          biomarkers,
          protocol,
          userMetrics
            ? {
                age: userMetrics.age,
                gender: userMetrics.gender,
                fitnessGoal: userMetrics.fitnessGoal || undefined,
              }
            : undefined
        );

        // Update protocol with the new data
        if (protocol) {
          await storage.updateProtocol(protocol.id, { cycleRecommendations });
        }

        res.json(cycleRecommendations);
      } catch (error) {
        console.error("Generate cycle recommendations error:", error);
        res
          .status(500)
          .json({ message: "Failed to generate cycle recommendations" });
      }
    }
  );

  // Stripe subscription
  app.post(
    "/api/subscribe",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const { priceId, promoCode } = req.body;

        if (!priceId) {
          return res.status(400).json({ message: "Price ID required" });
        }

        // Check if Stripe is configured
        const stripeReady = await isStripeConfigured();
        if (!stripeReady) {
          return res
            .status(503)
            .json({ message: "Payment system not configured yet" });
        }

        // Convert symbolic plan name to actual Stripe price ID
        let actualPriceId: string;
        try {
          actualPriceId = getStripePriceId(priceId);
        } catch (error) {
          console.error("Price ID mapping error:", error);
          return res.status(400).json({ message: "Invalid subscription plan" });
        }

        const user = req.user!;
        const baseUrl = `${req.protocol}://${req.get("host")}`;

        const session = await createCheckoutSession(
          user.id,
          user.email,
          actualPriceId,
          `${baseUrl}/dashboard?success=true`,
          `${baseUrl}/pricing?canceled=true`,
          promoCode
        );

        res.json({ url: session.url });
      } catch (error) {
        console.error("Subscribe error:", error);
        res.status(500).json({ message: "Failed to create checkout session" });
      }
    }
  );

  // Validate promo code
  app.post("/api/validate-promo", async (req: Request, res: Response) => {
    try {
      const { code } = req.body;

      if (!code || typeof code !== "string") {
        return res
          .status(400)
          .json({ valid: false, message: "Promo code required" });
      }

      // Check if Stripe is configured
      const stripeReady = await isStripeConfigured();
      if (!stripeReady) {
        return res
          .status(503)
          .json({ valid: false, message: "Payment system not configured" });
      }

      const result = await validatePromotionCode(code.trim().toUpperCase());
      res.json(result);
    } catch (error) {
      console.error("Promo validation error:", error);
      res
        .status(500)
        .json({ valid: false, message: "Failed to validate promo code" });
    }
  });

  // Billing portal
  app.get(
    "/api/billing-portal",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const user = req.user!;

        if (!user.stripeCustomerId) {
          return res.status(400).json({ message: "No billing account found" });
        }

        const stripeReady = await isStripeConfigured();
        if (!stripeReady) {
          return res
            .status(503)
            .json({ message: "Payment system not configured" });
        }

        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const session = await createBillingPortalSession(
          user.stripeCustomerId,
          `${baseUrl}/dashboard`
        );

        res.json({ url: session.url });
      } catch (error) {
        console.error("Billing portal error:", error);
        res.status(500).json({ message: "Failed to open billing portal" });
      }
    }
  );

  // Get user's subscription status
  app.get(
    "/api/user/subscription",
    authMiddleware,
    async (req: Request, res: Response) => {
      const user = req.user!;
      res.json({
        plan: user.subscriptionPlan,
        status: user.subscriptionStatus,
        renewalDate: user.renewalDate,
        uploadsThisMonth: user.pdfUploadsThisMonth,
        uploadsRemaining:
          user.subscriptionPlan === "basic"
            ? Math.max(0, 1 - (user.pdfUploadsThisMonth || 0))
            : "unlimited",
      });
    }
  );

  // Sync subscription status from Stripe (call after checkout)
  app.post(
    "/api/sync-subscription",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const user = req.user!;

        if (!user.stripeCustomerId) {
          return res.status(400).json({ message: "No Stripe customer found" });
        }

        const stripeReady = await isStripeConfigured();
        if (!stripeReady) {
          return res
            .status(503)
            .json({ message: "Payment system not configured" });
        }

        // Import Stripe client
        const { getUncachableStripeClient } = await import("./stripeClient");
        const stripe = await getUncachableStripeClient();

        // Get customer's subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          status: "active",
          limit: 1,
        });

        if (subscriptions.data.length === 0) {
          // No active subscription found
          return res.json({
            synced: true,
            plan: user.subscriptionPlan,
            status: user.subscriptionStatus,
          });
        }

        const subscription = subscriptions.data[0] as any;
        const priceId = subscription.items.data[0]?.price.id;

        // Determine plan from price ID
        let plan = "premium_monthly";
        if (priceId === process.env.STRIPE_PRICE_BASIC) {
          plan = "basic";
        } else if (priceId === process.env.STRIPE_PRICE_Yearly) {
          plan = "premium_annual";
        } else if (priceId === process.env.STRIPE_PRICE_PRO) {
          plan = "premium_monthly";
        }

        // Get renewal date from subscription
        const renewalTimestamp = subscription.current_period_end;
        const renewalDate = renewalTimestamp
          ? new Date(renewalTimestamp * 1000)
          : new Date();

        // Update user subscription
        await storage.updateUser(user.id, {
          subscriptionPlan: plan,
          subscriptionStatus: "active",
          stripeSubscriptionId: subscription.id,
          renewalDate,
        });

        res.json({
          synced: true,
          plan,
          status: "active",
          renewalDate,
        });
      } catch (error) {
        console.error("Sync subscription error:", error);
        res.status(500).json({ message: "Failed to sync subscription" });
      }
    }
  );

  // Stripe webhook endpoint
  app.post("/api/webhooks/stripe", async (req: Request, res: Response) => {
    try {
      const stripeReady = await isStripeConfigured();
      if (!stripeReady) return res.status(503).json({ error: "Stripe not configured" });

      const signature = req.headers["stripe-signature"];
      if (!signature) return res.status(400).json({ error: "Missing stripe-signature header" });

      const rawBody = (req as any).rawBody;
      if (!rawBody || !Buffer.isBuffer(rawBody)) return res.status(400).json({ error: "Invalid request body" });

      const sig = Array.isArray(signature) ? signature[0] : signature;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event: any;
      try {
        const { stripe: getStripe } = await import("./stripe");
        const stripeClient = await getStripe();
        if (webhookSecret) {
          event = stripeClient.webhooks.constructEvent(rawBody, sig, webhookSecret);
        } else {
          // No webhook secret — parse raw body directly (less secure, ok for dev)
          event = JSON.parse(rawBody.toString());
        }
      } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).json({ error: "Invalid webhook signature" });
      }

      // Handle relevant events
      try {
        if (event.type === "checkout.session.completed") {
          const session = event.data.object;
          const userId = session.metadata?.userId;
          const subscriptionId = session.subscription;
          if (userId && subscriptionId) {
            const { stripe: getStripe } = await import("./stripe");
            const stripeClient = await getStripe();
            const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
            const priceId = subscription.items.data[0]?.price?.id;
            const { getPlanFromStripePrice } = await import("./stripe");
            const plan = priceId ? await getPlanFromStripePrice(priceId) : "premium_monthly";
            await processSubscriptionUpdate(
              subscriptionId,
              userId,
              subscription.status,
              plan,
              subscription.current_period_end
            );
            console.log(`✅ Subscription activated: user=${userId} plan=${plan}`);
          }
        } else if (event.type === "customer.subscription.updated") {
          const subscription = event.data.object;
          const userId = subscription.metadata?.userId;
          if (userId) {
            const priceId = subscription.items.data[0]?.price?.id;
            const { getPlanFromStripePrice } = await import("./stripe");
            const plan = priceId ? await getPlanFromStripePrice(priceId) : "premium_monthly";
            await processSubscriptionUpdate(
              subscription.id,
              userId,
              subscription.status,
              plan,
              subscription.current_period_end
            );
            console.log(`✅ Subscription updated: user=${userId} plan=${plan} status=${subscription.status}`);
          }
        } else if (event.type === "customer.subscription.deleted") {
          const subscription = event.data.object;
          const userId = subscription.metadata?.userId;
          if (userId) {
            await storage.updateUser(userId, {
              subscriptionPlan: "basic",
              subscriptionStatus: "cancelled",
            });
            console.log(`✅ Subscription cancelled: user=${userId}`);
          }
        } else if (event.type === "invoice.payment_failed") {
          const invoice = event.data.object;
          const customerId = invoice.customer as string;
          const { stripe: getStripe } = await import("./stripe");
          const stripeClient = await getStripe();
          const customer = await stripeClient.customers.retrieve(customerId) as any;
          const userId = customer.metadata?.userId;
          if (userId) {
            await storage.updateUser(userId, { subscriptionStatus: "expired" });
            console.log(`⚠️ Payment failed: user=${userId}`);
          }
        }
      } catch (handleError: any) {
        console.error("Webhook event handling error:", handleError.message);
        // Still return 200 so Stripe doesn't retry
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ========== UPLOADS APIs ==========

  // Get all uploads for a user
  app.get(
    "/api/uploads",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const uploads = await storage.getUserUploads(req.user!.id);
        res.json(uploads);
      } catch (error) {
        console.error("Get uploads error:", error);
        res.status(500).json({ message: "Failed to get uploads" });
      }
    }
  );

  // Get biomarkers by upload ID
  app.get(
    "/api/biomarkers/:uploadId",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const user = req.user!;
        const biomarkers = await storage.getBiomarkersByUpload(
          req.params.uploadId
        );

        // Check subscription status - determine premium access
        const isTrialActive =
          user.subscriptionPlan === "trial" &&
          user.trialEndsAt &&
          new Date() < new Date(user.trialEndsAt);
        const isPaidActive = user.subscriptionStatus === "active";
        const isPremium =
          isPaidActive &&
          (user.subscriptionPlan === "premium_monthly" ||
            user.subscriptionPlan === "premium_annual");

        // Premium users with active subscription get all biomarkers
        if (isPremium) {
          return res.json({
            biomarkers,
            isLimited: false,
            totalCount: biomarkers.length,
            visibleCount: biomarkers.length,
          });
        }

        // Trial, basic, or inactive users see only 3 biomarkers
        const limitedBiomarkers = biomarkers.slice(0, 3);
        return res.json({
          biomarkers: limitedBiomarkers,
          isLimited: true,
          totalCount: biomarkers.length,
          visibleCount: 3,
        });
      } catch (error) {
        console.error("Get biomarkers by upload error:", error);
        res.status(500).json({ message: "Failed to get biomarkers" });
      }
    }
  );

  // ========== PROGRESS TRACKING APIs ==========

  // Get biomarker history (all biomarkers over time for trend charts)
  app.get(
    "/api/biomarkers/history",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const biomarkersList = await storage.getUserBiomarkers(req.user!.id);

        // Group biomarkers by name for trend analysis
        const history: Record<
          string,
          Array<{ value: string | null; date: Date | null; uploadId: string }>
        > = {};

        for (const biomarker of biomarkersList) {
          if (!history[biomarker.name]) {
            history[biomarker.name] = [];
          }
          history[biomarker.name].push({
            value: biomarker.value,
            date: biomarker.extractedAt,
            uploadId: biomarker.uploadId,
          });
        }

        res.json(history);
      } catch (error) {
        console.error("Get biomarker history error:", error);
        res.status(500).json({ message: "Failed to get biomarker history" });
      }
    }
  );

  // Get Performance Age history
  app.get(
    "/api/protocols/history",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const protocolsList = await storage.getUserProtocols(req.user!.id);

        const history = protocolsList.map((p) => ({
          id: p.id,
          performanceAge: p.performanceAge,
          date: p.generatedAt,
          uploadId: p.uploadId,
        }));

        res.json(history);
      } catch (error) {
        console.error("Get protocol history error:", error);
        res.status(500).json({ message: "Failed to get protocol history" });
      }
    }
  );

  // Goals CRUD
  app.get("/api/goals", authMiddleware, async (req: Request, res: Response) => {
    try {
      const goalsList = await storage.getUserGoals(req.user!.id);
      res.json(goalsList);
    } catch (error) {
      console.error("Get goals error:", error);
      res.status(500).json({ message: "Failed to get goals" });
    }
  });

  app.post(
    "/api/goals",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const {
          biomarkerName,
          targetValue,
          currentValue,
          unit,
          direction,
          targetDate,
        } = req.body;

        const goal = await storage.createGoal({
          userId: req.user!.id,
          biomarkerName,
          targetValue: targetValue.toString(),
          currentValue:
            currentValue && currentValue !== ""
              ? currentValue.toString()
              : undefined,
          unit,
          direction: direction || "lower",
          targetDate: targetDate ? new Date(targetDate) : undefined,
        });

        res.status(201).json(goal);
      } catch (error) {
        console.error("Create goal error:", error);
        res.status(500).json({ message: "Failed to create goal" });
      }
    }
  );

  app.patch(
    "/api/goals/:id",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.targetValue)
          updates.targetValue = updates.targetValue.toString();
        if (updates.currentValue)
          updates.currentValue = updates.currentValue.toString();
        if (updates.targetDate)
          updates.targetDate = new Date(updates.targetDate);

        const goal = await storage.updateGoal(id, updates);

        if (!goal) {
          return res.status(404).json({ message: "Goal not found" });
        }

        res.json(goal);
      } catch (error) {
        console.error("Update goal error:", error);
        res.status(500).json({ message: "Failed to update goal" });
      }
    }
  );

  app.delete(
    "/api/goals/:id",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        await storage.deleteGoal(req.params.id);
        res.json({ message: "Goal deleted" });
      } catch (error) {
        console.error("Delete goal error:", error);
        res.status(500).json({ message: "Failed to delete goal" });
      }
    }
  );

  // Reminders CRUD
  app.get(
    "/api/reminders",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const remindersList = await storage.getUserReminders(req.user!.id);
        res.json(remindersList);
      } catch (error) {
        console.error("Get reminders error:", error);
        res.status(500).json({ message: "Failed to get reminders" });
      }
    }
  );

  app.post(
    "/api/reminders",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const { type, reminderDate, message } = req.body;

        const reminder = await storage.createReminder({
          userId: req.user!.id,
          type: type || "retest",
          reminderDate: new Date(reminderDate),
          message,
        });

        res.json(reminder);
      } catch (error) {
        console.error("Create reminder error:", error);
        res.status(500).json({ message: "Failed to create reminder" });
      }
    }
  );

  app.delete(
    "/api/reminders/:id",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        await storage.deleteReminder(req.params.id);
        res.json({ message: "Reminder deleted" });
      } catch (error) {
        console.error("Delete reminder error:", error);
        res.status(500).json({ message: "Failed to delete reminder" });
      }
    }
  );

  // User Metrics (Questionnaire data)
  app.get(
    "/api/user-metrics",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const metrics = await storage.getUserMetrics(req.user!.id);
        res.json(metrics || null);
      } catch (error) {
        console.error("Get user metrics error:", error);
        res.status(500).json({ message: "Failed to get user metrics" });
      }
    }
  );

  app.post(
    "/api/user-metrics",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const {
          heightCm,
          weightKg,
          bodyFatPercent,
          age,
          gender,
          fitnessGoal,
          activityLevel,
          naturalOnly,
        } = req.body;

        // Calculate BMI: weight (kg) / height (m)^2
        const heightM = parseFloat(heightCm) / 100;
        const bmi = parseFloat(weightKg) / (heightM * heightM);

        const metrics = await storage.createOrUpdateUserMetrics({
          userId: req.user!.id,
          heightCm: heightCm.toString(),
          weightKg: weightKg.toString(),
          bodyFatPercent: bodyFatPercent
            ? bodyFatPercent.toString()
            : undefined,
          age: parseInt(age),
          gender,
          fitnessGoal,
          activityLevel: activityLevel || "moderate",
          naturalOnly: naturalOnly || false,
          bmi: bmi.toFixed(1),
        });

        res.status(201).json(metrics);
      } catch (error) {
        console.error("Create/update user metrics error:", error);
        res.status(500).json({ message: "Failed to save user metrics" });
      }
    }
  );

  // Get Stripe publishable key for frontend
  app.get("/api/stripe/config", async (req: Request, res: Response) => {
    try {
      const stripeReady = await isStripeConfigured();
      if (!stripeReady) {
        return res.json({ configured: false });
      }

      const { getStripePublishableKey } = await import("./stripeClient");
      const publishableKey = await getStripePublishableKey();
      res.json({ configured: true, publishableKey });
    } catch (error) {
      res.json({ configured: false });
    }
  });

  // Development-only: Set test subscription (for testing without Stripe)
  if (process.env.NODE_ENV !== "production") {
    app.post(
      "/api/dev/set-subscription",
      authMiddleware,
      async (req: Request, res: Response) => {
        try {
          const { plan } = req.body;
          const validPlans = [
            "none",
            "basic",
            "premium_monthly",
            "premium_annual",
          ];

          if (!validPlans.includes(plan)) {
            return res.status(400).json({ message: "Invalid plan" });
          }

          await storage.updateUser(req.user!.id, {
            subscriptionPlan: plan,
            subscriptionStatus: plan === "none" ? "inactive" : "active",
            renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            pdfUploadsThisMonth: 0,
          });

          res.json({ message: "Subscription updated", plan });
        } catch (error) {
          console.error("Dev set subscription error:", error);
          res.status(500).json({ message: "Failed to update subscription" });
        }
      }
    );
  }

  // Notifications API
  app.get(
    "/api/notifications",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const notifications = await storage.getNotifications(req.user!.id);
        res.json(notifications);
      } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({ message: "Failed to get notifications" });
      }
    }
  );

  app.patch(
    "/api/notifications/:id/read",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        await storage.markNotificationRead(req.params.id);
        res.json({ success: true });
      } catch (error) {
        console.error("Mark notification read error:", error);
        res
          .status(500)
          .json({ message: "Failed to mark notification as read" });
      }
    }
  );

  app.patch(
    "/api/notifications/read-all",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        await storage.markAllNotificationsRead(req.user!.id);
        res.json({ success: true });
      } catch (error) {
        console.error("Mark all notifications read error:", error);
        res
          .status(500)
          .json({ message: "Failed to mark all notifications as read" });
      }
    }
  );

  // AI Chat API
  app.post("/api/chat", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { message, context } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Check for red flags (emergency symptoms) before processing
      const { detectRedFlags, chatWithAI } = await import("./openai");
      const redFlagCheck = detectRedFlags(message);

      if (redFlagCheck.detected) {
        // Return emergency message instead of AI response
        return res.json({
          response: redFlagCheck.emergencyMessage,
          isEmergency: true,
        });
      }

      const response = await chatWithAI(message, context);
      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Referral API routes
  app.get(
    "/api/referrals/stats",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const stats = await storage.getReferralStats(req.user!.id);
        res.json(stats);
      } catch (error) {
        console.error("Get referral stats error:", error);
        res.status(500).json({ message: "Failed to get referral stats" });
      }
    }
  );

  app.get(
    "/api/referrals",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const referrals = await storage.getUserReferrals(req.user!.id);
        res.json(referrals);
      } catch (error) {
        console.error("Get referrals error:", error);
        res.status(500).json({ message: "Failed to get referrals" });
      }
    }
  );

  app.post(
    "/api/referrals/invite",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const { email } = req.body;
        if (!email) {
          return res.status(400).json({ message: "Email is required" });
        }

        const referral = await storage.createReferralInvite(
          req.user!.id,
          email
        );
        res.json(referral);
      } catch (error) {
        console.error("Create referral invite error:", error);
        res.status(500).json({ message: "Failed to create referral invite" });
      }
    }
  );

  // Feedback Reports API
  app.post(
    "/api/feedback",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const { category, description, sectionReported, protocolId } = req.body;

        if (!category || !description) {
          return res
            .status(400)
            .json({ message: "Category and description are required" });
        }

        const report = await storage.createFeedbackReport({
          userId: req.user!.id,
          category,
          description,
          sectionReported,
          protocolId,
        });

        res.json(report);
      } catch (error) {
        console.error("Create feedback report error:", error);
        res.status(500).json({ message: "Failed to submit feedback" });
      }
    }
  );

  // Weekly Check-ins API
  app.get(
    "/api/check-ins",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const checkIns = await storage.getUserCheckIns(req.user!.id);
        res.json(checkIns);
      } catch (error) {
        console.error("Get check-ins error:", error);
        res.status(500).json({ message: "Failed to get check-ins" });
      }
    }
  );

  app.get(
    "/api/check-ins/latest",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const checkIn = await storage.getLatestCheckIn(req.user!.id);
        res.json(checkIn || null);
      } catch (error) {
        console.error("Get latest check-in error:", error);
        res.status(500).json({ message: "Failed to get latest check-in" });
      }
    }
  );

  app.post(
    "/api/check-ins",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const {
          sleepQuality,
          energyLevel,
          moodScore,
          stressLevel,
          libido,
          trainingConsistency,
          notes,
        } = req.body;

        // Calculate start of current week (Monday)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - diffToMonday);
        weekStart.setHours(0, 0, 0, 0);

        const checkIn = await storage.createCheckIn({
          userId: req.user!.id,
          sleepQuality,
          energyLevel,
          moodScore,
          stressLevel,
          libido,
          trainingConsistency,
          notes,
          weekStartDate: weekStart,
        });

        res.json(checkIn);
      } catch (error) {
        console.error("Create check-in error:", error);
        res.status(500).json({ message: "Failed to create check-in" });
      }
    }
  );

  // WHOOP auto check-in
  app.post(
    "/api/check-ins/from-whoop",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const userId = req.user!.id;
        const connection = await storage.getWearableConnection(userId, "whoop");
        if (!connection) {
          return res.status(400).json({ message: "WHOOP not connected" });
        }

        // Fetch last 7 days of wearable metrics
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        const metrics = await storage.getWearableDailyMetrics(userId, "whoop", startDate, endDate);

        if (!metrics || metrics.length === 0) {
          return res.status(400).json({ message: "No WHOOP data available for the past 7 days. Please sync your device first." });
        }

        // Aggregate weekly averages
        const avg = (arr: (number | null | undefined)[]) => {
          const valid = arr.filter((v): v is number => v != null && v > 0);
          return valid.length > 0 ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
        };

        const avgSleepScore    = avg(metrics.map(m => m.sleepScore));
        const avgRecovery      = avg(metrics.map(m => m.recoveryScore));
        const avgHrv           = avg(metrics.map(m => m.hrvMs ? parseFloat(m.hrvMs.toString()) : null));
        const avgStrain        = avg(metrics.map(m => m.strain ? parseFloat(m.strain.toString()) : null));
        const avgSleepMinutes  = avg(metrics.map(m => m.sleepDurationMinutes));

        // Map to 1-10 scores
        const scale = (val: number | null, min: number, max: number): number => {
          if (val == null) return 5;
          return Math.min(10, Math.max(1, Math.round(((val - min) / (max - min)) * 9 + 1)));
        };

        const sleepQuality       = scale(avgSleepScore, 0, 100);
        const energyLevel        = scale(avgRecovery, 0, 100);
        // Higher HRV = lower stress
        const stressLevel        = avgHrv != null ? scale(100 - Math.min(avgHrv, 100), 0, 100) : 5;
        const trainingConsistency = scale(avgStrain, 0, 21);

        // AI interpretation
        const { chatWithAI } = await import("./openai");
        const summary = await chatWithAI(
          `You are a performance coach. Analyze this user's WHOOP data from the past 7 days and write a concise 2-3 sentence weekly check-in interpretation. Be specific, motivating, and actionable. Data: Sleep Score avg: ${avgSleepScore?.toFixed(0) ?? "N/A"}/100, Recovery avg: ${avgRecovery?.toFixed(0) ?? "N/A"}/100, HRV avg: ${avgHrv?.toFixed(0) ?? "N/A"}ms, Strain avg: ${avgStrain?.toFixed(1) ?? "N/A"}/21, Sleep duration avg: ${avgSleepMinutes ? Math.round(avgSleepMinutes / 60) + "h " + (Math.round(avgSleepMinutes) % 60) + "m" : "N/A"}.`,
          {}
        );

        res.json({
          whoopData: {
            sleepScore: avgSleepScore?.toFixed(0),
            recoveryScore: avgRecovery?.toFixed(0),
            hrv: avgHrv?.toFixed(0),
            strain: avgStrain?.toFixed(1),
            sleepHours: avgSleepMinutes ? (avgSleepMinutes / 60).toFixed(1) : null,
            daysRecorded: metrics.length,
          },
          suggested: {
            sleepQuality,
            energyLevel,
            stressLevel,
            trainingConsistency,
          },
          aiSummary: summary,
        });
      } catch (error) {
        console.error("WHOOP check-in error:", error);
        res.status(500).json({ message: "Failed to fetch WHOOP data" });
      }
    }
  );

  // Admin API routes
  app.get(
    "/api/admin/check",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const isAdmin = await storage.isAdmin(req.user!.id);
        res.json({ isAdmin });
      } catch (error) {
        console.error("Admin check error:", error);
        res.status(500).json({ message: "Failed to check admin status" });
      }
    }
  );

  app.get(
    "/api/admin/metrics",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const isAdmin = await storage.isAdmin(req.user!.id);
        if (!isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }

        const metrics = await storage.getUsageMetrics();
        res.json(metrics);
      } catch (error) {
        console.error("Get admin metrics error:", error);
        res.status(500).json({ message: "Failed to get metrics" });
      }
    }
  );

  app.get(
    "/api/admin/feedback",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const isAdmin = await storage.isAdmin(req.user!.id);
        if (!isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }

        const status = req.query.status as string | undefined;
        const reports = await storage.getFeedbackReports(status);
        res.json(reports);
      } catch (error) {
        console.error("Get feedback reports error:", error);
        res.status(500).json({ message: "Failed to get feedback reports" });
      }
    }
  );

  app.patch(
    "/api/admin/feedback/:id",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const isAdmin = await storage.isAdmin(req.user!.id);
        if (!isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }

        const { status, adminNotes } = req.body;
        const updateData: any = { status };
        if (adminNotes) updateData.adminNotes = adminNotes;
        if (status === "resolved") updateData.resolvedAt = new Date();

        const report = await storage.updateFeedbackReport(
          req.params.id,
          updateData
        );
        res.json(report);
      } catch (error) {
        console.error("Update feedback report error:", error);
        res.status(500).json({ message: "Failed to update feedback report" });
      }
    }
  );

  // Biomarker Dictionary API (Admin)
  app.get(
    "/api/admin/biomarker-dictionary",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const isAdmin = await storage.isAdmin(req.user!.id);
        if (!isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }

        const dictionary = await storage.getBiomarkerDictionary();
        res.json(dictionary);
      } catch (error) {
        console.error("Get biomarker dictionary error:", error);
        res.status(500).json({ message: "Failed to get biomarker dictionary" });
      }
    }
  );

  app.post(
    "/api/admin/biomarker-dictionary",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const isAdmin = await storage.isAdmin(req.user!.id);
        if (!isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }

        const {
          name,
          aliases,
          category,
          unit,
          optimalRangeLow,
          optimalRangeHigh,
          description,
        } = req.body;

        if (!name || !category || !unit) {
          return res
            .status(400)
            .json({ message: "Name, category, and unit are required" });
        }

        const entry = await storage.createBiomarkerDictionaryEntry({
          name,
          aliases,
          category,
          unit,
          optimalRangeLow,
          optimalRangeHigh,
          description,
        });

        res.json(entry);
      } catch (error) {
        console.error("Create biomarker dictionary entry error:", error);
        res
          .status(500)
          .json({ message: "Failed to create biomarker dictionary entry" });
      }
    }
  );

  app.patch(
    "/api/admin/biomarker-dictionary/:id",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const isAdmin = await storage.isAdmin(req.user!.id);
        if (!isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }

        const entry = await storage.updateBiomarkerDictionaryEntry(
          req.params.id,
          req.body
        );
        res.json(entry);
      } catch (error) {
        console.error("Update biomarker dictionary entry error:", error);
        res
          .status(500)
          .json({ message: "Failed to update biomarker dictionary entry" });
      }
    }
  );

  app.delete(
    "/api/admin/biomarker-dictionary/:id",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const isAdmin = await storage.isAdmin(req.user!.id);
        if (!isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }

        await storage.deleteBiomarkerDictionaryEntry(req.params.id);
        res.json({ success: true });
      } catch (error) {
        console.error("Delete biomarker dictionary entry error:", error);
        res
          .status(500)
          .json({ message: "Failed to delete biomarker dictionary entry" });
      }
    }
  );

  // Audit Logs API (Admin)
  app.get(
    "/api/admin/audit-logs",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const isAdmin = await storage.isAdmin(req.user!.id);
        if (!isAdmin) {
          return res.status(403).json({ message: "Admin access required" });
        }

        const limit = parseInt(req.query.limit as string) || 100;
        const logs = await storage.getAuditLogs(limit);
        res.json(logs);
      } catch (error) {
        console.error("Get audit logs error:", error);
        res.status(500).json({ message: "Failed to get audit logs" });
      }
    }
  );

  // Account Management
  app.get(
    "/api/account/export",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const user = req.user!;
        const uploads = await storage.getUserUploads(user.id);
        const protocols = await storage.getUserProtocols(user.id);
        const biomarkers = await storage.getUserBiomarkers(user.id);
        const checkIns = await storage.getUserCheckIns(user.id);
        const goals = await storage.getUserGoals(user.id);
        const userMetrics = await storage.getUserMetrics(user.id);

        const exportData = {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            subscriptionPlan: user.subscriptionPlan,
            createdAt: user.createdAt,
          },
          uploads: uploads.map((u) => ({
            fileName: u.fileName,
            uploadedAt: u.uploadedAt,
            status: u.status,
          })),
          biomarkers,
          protocols: protocols.map((p) => ({
            performanceAge: p.performanceAge,
            generatedAt: p.generatedAt,
            notes: p.notes,
          })),
          checkIns,
          goals,
          userMetrics,
          exportedAt: new Date().toISOString(),
        };

        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="humanupgrade-export.json"'
        );
        res.json(exportData);
      } catch (error) {
        console.error("Export account data error:", error);
        res.status(500).json({ message: "Failed to export account data" });
      }
    }
  );

  app.delete(
    "/api/account",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const { confirmEmail } = req.body;

        if (confirmEmail !== req.user!.email) {
          return res
            .status(400)
            .json({ message: "Email confirmation does not match" });
        }

        // For now, we'll just mark the account as deleted by clearing sensitive data
        // In production, you'd want proper cascading deletes or soft delete
        await storage.updateUser(req.user!.id, {
          email: `deleted_${Date.now()}@deleted.local`,
          password: "deleted",
          name: "Deleted User",
          subscriptionPlan: "none",
          subscriptionStatus: "inactive",
        });

        clearSessionCookie(res);
        res.json({ success: true, message: "Account deleted successfully" });
      } catch (error) {
        console.error("Delete account error:", error);
        res.status(500).json({ message: "Failed to delete account" });
      }
    }
  );

  // ========== WEARABLE INTEGRATION APIs ==========

  // Get all wearable connections for user
  app.get(
    "/api/integrations/connections",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const connections = await storage.getUserWearableConnections(
          req.user!.id
        );
        res.json(connections);
      } catch (error) {
        console.error("Get wearable connections error:", error);
        res.status(500).json({ message: "Failed to get wearable connections" });
      }
    }
  );

  // Oura OAuth - Initiate connection (redirects to Oura)
  app.get(
    "/api/integrations/oura/connect",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const state = `${req.user!.id}_${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}`;
        const authUrl = getOuraAuthUrl(state);
        res.redirect(authUrl);
      } catch (error) {
        console.error("Oura connect error:", error);
        res.redirect("/integrations?error=oura_init_failed");
      }
    }
  );

  // Oura OAuth - Callback
  app.get(
    "/api/integrations/oura/callback",
    async (req: Request, res: Response) => {
      try {
        const { code, state } = req.query;
        if (!code || !state) {
          return res.redirect("/integrations?error=missing_params");
        }

        const userId = (state as string).split("_")[0];
        const tokens = await exchangeOuraCode(code as string);

        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

        const existing = await storage.getWearableConnection(userId, "oura");
        if (existing) {
          await storage.updateWearableConnection(existing.id, {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt,
            status: "connected",
          });
        } else {
          await storage.createWearableConnection({
            userId,
            provider: "oura",
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt,
            status: "connected",
          });
        }

        res.redirect("/integrations?success=oura");
      } catch (error) {
        console.error("Oura callback error:", error);
        res.redirect("/integrations?error=oura_failed");
      }
    }
  );

  // Oura - Sync data
  app.post(
    "/api/integrations/oura/sync",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const connection = await storage.getWearableConnection(
          req.user!.id,
          "oura"
        );
        if (!connection || connection.status !== "connected") {
          return res.status(400).json({ message: "Oura not connected" });
        }

        const endDate = new Date().toISOString().split("T")[0];
        const startDate = connection.lastSyncedAt
          ? connection.lastSyncedAt.toISOString().split("T")[0]
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0];

        const recordsProcessed = await syncOuraData(
          req.user!.id,
          connection.accessToken!,
          startDate,
          endDate
        );
        res.json({ success: true, recordsProcessed });
      } catch (error) {
        console.error("Oura sync error:", error);
        res.status(500).json({ message: "Failed to sync Oura data" });
      }
    }
  );

  // WHOOP OAuth - Initiate connection (redirects to WHOOP)
  app.get(
    "/api/integrations/whoop/connect",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const state = `${req.user!.id}_${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}`;
        const authUrl = getWhoopAuthUrl(state);
        res.redirect(authUrl);
      } catch (error) {
        console.error("WHOOP connect error:", error);
        res.redirect("/integrations?error=whoop_init_failed");
      }
    }
  );

  // WHOOP OAuth - Callback
  app.get(
    "/api/integrations/whoop/callback",
    async (req: Request, res: Response) => {
      try {
        const { code, state } = req.query;
        if (!code || !state) {
          return res.redirect("/integrations?error=missing_params");
        }

        const userId = (state as string).split("_")[0];
        const tokens = await exchangeWhoopCode(code as string);

        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

        const existing = await storage.getWearableConnection(userId, "whoop");
        if (existing) {
          await storage.updateWearableConnection(existing.id, {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt,
            status: "connected",
          });
        } else {
          await storage.createWearableConnection({
            userId,
            provider: "whoop",
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt,
            status: "connected",
          });
        }

        res.redirect("/integrations?success=whoop");
      } catch (error) {
        console.error("WHOOP callback error:", error);
        res.redirect("/integrations?error=whoop_failed");
      }
    }
  );

  // WHOOP - Sync data
  app.post(
    "/api/integrations/whoop/sync",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const connection = await storage.getWearableConnection(
          req.user!.id,
          "whoop"
        );
        if (!connection || connection.status !== "connected") {
          return res.status(400).json({ message: "WHOOP not connected" });
        }

        const endDate = new Date().toISOString().split("T")[0];
        const startDate = connection.lastSyncedAt
          ? connection.lastSyncedAt.toISOString().split("T")[0]
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0];

        const recordsProcessed = await syncWhoopData(
          req.user!.id,
          connection.accessToken!,
          startDate,
          endDate
        );
        res.json({ success: true, recordsProcessed });
      } catch (error) {
        console.error("WHOOP sync error:", error);
        res.status(500).json({ message: "Failed to sync WHOOP data" });
      }
    }
  );

  // Apple Health - Ingest daily data (for iOS app)
  app.post(
    "/api/integrations/apple-health/ingest-daily",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const {
          date,
          sleepDurationMinutes,
          hrvMs,
          restingHr,
          steps,
          calories,
          activityScore,
          rawPayload,
        } = req.body;

        if (!date) {
          return res.status(400).json({ message: "Date is required" });
        }

        await storage.upsertWearableDailyMetrics({
          userId: req.user!.id,
          provider: "apple_health",
          date: new Date(date),
          sleepDurationMinutes,
          hrvMs: hrvMs?.toString(),
          restingHr: restingHr?.toString(),
          steps,
          calories: calories?.toString(),
          activityScore,
          rawPayload,
        });

        // Update or create Apple Health connection
        const existing = await storage.getWearableConnection(
          req.user!.id,
          "apple_health"
        );
        if (existing) {
          await storage.updateWearableConnection(existing.id, {
            lastSyncedAt: new Date(),
          });
        } else {
          await storage.createWearableConnection({
            userId: req.user!.id,
            provider: "apple_health",
            status: "connected",
            lastSyncedAt: new Date(),
          });
        }

        res.json({ success: true });
      } catch (error) {
        console.error("Apple Health ingest error:", error);
        res.status(500).json({ message: "Failed to ingest Apple Health data" });
      }
    }
  );

  // Apple Health - Config for iOS app
  app.get(
    "/api/integrations/apple-health/config",
    authMiddleware,
    async (req: Request, res: Response) => {
      res.json({
        metrics: [
          "sleepDurationMinutes",
          "hrvMs",
          "restingHr",
          "steps",
          "calories",
          "activityScore",
        ],
        syncFrequency: "daily",
        version: "1.0.0",
      });
    }
  );

  // Disconnect wearable
  app.delete(
    "/api/integrations/:provider/disconnect",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const provider = req.params.provider as
          | "oura"
          | "whoop"
          | "apple_health";
        if (!["oura", "whoop", "apple_health"].includes(provider)) {
          return res.status(400).json({ message: "Invalid provider" });
        }

        await storage.deleteWearableConnection(req.user!.id, provider);
        res.json({ success: true });
      } catch (error) {
        console.error("Disconnect wearable error:", error);
        res.status(500).json({ message: "Failed to disconnect wearable" });
      }
    }
  );

  // Get wearable insights (aggregated trends) - Premium only
  app.get(
    "/api/wearables/insights",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const user = req.user!;
        const isPremium =
          user.subscriptionStatus === "active" &&
          (user.subscriptionPlan === "premium_monthly" ||
            user.subscriptionPlan === "premium_annual");

        if (!isPremium) {
          return res
            .status(403)
            .json({
              message: "Premium subscription required for wearable insights",
            });
        }

        const metrics = await storage.getLatestWearableMetrics(
          req.user!.id,
          14
        );
        const insights = calculateWearableInsights(metrics);
        res.json(insights);
      } catch (error) {
        console.error("Get wearable insights error:", error);
        res.status(500).json({ message: "Failed to get wearable insights" });
      }
    }
  );

  // Get wearable daily metrics - Premium only
  app.get(
    "/api/wearables/metrics",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const user = req.user!;
        const isPremium =
          user.subscriptionStatus === "active" &&
          (user.subscriptionPlan === "premium_monthly" ||
            user.subscriptionPlan === "premium_annual");

        if (!isPremium) {
          return res
            .status(403)
            .json({
              message: "Premium subscription required for wearable metrics",
            });
        }

        const days = parseInt(req.query.days as string) || 7;
        const metrics = await storage.getLatestWearableMetrics(
          req.user!.id,
          days
        );
        res.json(metrics);
      } catch (error) {
        console.error("Get wearable metrics error:", error);
        res.status(500).json({ message: "Failed to get wearable metrics" });
      }
    }
  );

  // Generate daily routine based on wearable data
  app.post(
    "/api/wearables/generate-routine",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        // Check premium status
        const user = req.user!;
        const isPremium =
          user.subscriptionStatus === "active" &&
          (user.subscriptionPlan === "premium_monthly" ||
            user.subscriptionPlan === "premium_annual");

        if (!isPremium) {
          return res
            .status(403)
            .json({
              message: "Premium subscription required for daily routines",
            });
        }

        const metrics = await storage.getLatestWearableMetrics(user.id, 7);
        if (metrics.length === 0) {
          return res
            .status(400)
            .json({
              message: "No wearable data available. Connect a device first.",
            });
        }

        const insights = calculateWearableInsights(metrics);
        const routine = await generateDailyRoutine(metrics, insights, user);

        // Save the routine
        const savedRoutine = await storage.createDailyRoutine({
          userId: user.id,
          date: new Date(),
          ...routine,
        });

        res.json(savedRoutine);
      } catch (error) {
        console.error("Generate daily routine error:", error);
        res.status(500).json({ message: "Failed to generate daily routine" });
      }
    }
  );

  // Get latest daily routine
  app.get(
    "/api/wearables/routine",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const routine = await storage.getLatestDailyRoutine(req.user!.id);
        res.json(routine || null);
      } catch (error) {
        console.error("Get daily routine error:", error);
        res.status(500).json({ message: "Failed to get daily routine" });
      }
    }
  );

  // Delete all wearable data for a provider (privacy)
  app.delete(
    "/api/wearables/data/:provider",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const provider = req.params.provider as
          | "oura"
          | "whoop"
          | "apple_health"
          | "all";

        if (provider === "all") {
          await storage.deleteUserWearableData(req.user!.id);
        } else if (["oura", "whoop", "apple_health"].includes(provider)) {
          await storage.deleteUserWearableData(req.user!.id, provider);
        } else {
          return res.status(400).json({ message: "Invalid provider" });
        }

        res.json({ success: true });
      } catch (error) {
        console.error("Delete wearable data error:", error);
        res.status(500).json({ message: "Failed to delete wearable data" });
      }
    }
  );

  // =====================================================
  // PARTNER/AFFILIATE ROUTES
  // =====================================================

  // Get all partners, optionally filtered by type
  app.get("/api/partners", async (req: Request, res: Response) => {
    try {
      const type = req.query.type as
        | "supplement_brand"
        | "fitness_influencer"
        | "peptide_provider"
        | undefined;
      const partnerList = await storage.getPartners(type);
      res.json(partnerList);
    } catch (error) {
      console.error("Get partners error:", error);
      res.status(500).json({ message: "Failed to get partners" });
    }
  });

  // Get a specific partner with their offers
  app.get("/api/partners/:id", async (req: Request, res: Response) => {
    try {
      const partner = await storage.getPartner(req.params.id);
      if (!partner) {
        return res.status(404).json({ message: "Partner not found" });
      }
      const offers = await storage.getPartnerOffers(partner.id);
      res.json({ ...partner, offers });
    } catch (error) {
      console.error("Get partner error:", error);
      res.status(500).json({ message: "Failed to get partner" });
    }
  });

  // Get partner offers filtered by tags (for recommendations)
  app.get(
    "/api/partners/offers/matching",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const goalTags = req.query.goals
          ? (req.query.goals as string).split(",")
          : undefined;
        const biomarkerTags = req.query.biomarkers
          ? (req.query.biomarkers as string).split(",")
          : undefined;

        const offers = await storage.getOffersByTags(goalTags, biomarkerTags);
        res.json(offers);
      } catch (error) {
        console.error("Get matching offers error:", error);
        res.status(500).json({ message: "Failed to get matching offers" });
      }
    }
  );

  // Get contextual recommendations based on user's biomarkers and goals
  app.get(
    "/api/partners/recommendations",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const userId = req.user!.id;

        // Get user's latest biomarkers to find deficiencies
        const biomarkers = await storage.getUserBiomarkers(userId);
        const deficientBiomarkers = biomarkers
          .filter(
            (b) =>
              b.status === "low" ||
              b.status === "high" ||
              b.status === "critical"
          )
          .map((b) => b.name.toLowerCase().replace(/\s+/g, "_"))
          .slice(0, 5); // Limit to top 5 issues

        // Get user's fitness goal from metrics
        const metrics = await storage.getUserMetrics(userId);
        const goalTags = metrics?.fitnessGoal ? [metrics.fitnessGoal] : [];

        // Fetch matching offers
        const recommendations = await storage.getOffersByTags(
          goalTags,
          deficientBiomarkers
        );

        // Limit recommendations and add context
        const limitedRecs = recommendations.slice(0, 6).map((rec) => ({
          ...rec,
          matchReason:
            deficientBiomarkers.length > 0
              ? `Based on your biomarker profile`
              : goalTags.length > 0
              ? `Matches your ${metrics?.fitnessGoal?.replace("_", " ")} goal`
              : "Popular recommendation",
        }));

        res.json(limitedRecs);
      } catch (error) {
        console.error("Get recommendations error:", error);
        res.status(500).json({ message: "Failed to get recommendations" });
      }
    }
  );

  // Track partner affiliate click
  app.post("/api/partners/click", async (req: Request, res: Response) => {
    try {
      const { partnerId, offerId, context, biomarkerContext } = req.body;

      if (!partnerId) {
        return res.status(400).json({ message: "Partner ID required" });
      }

      // Get user ID if authenticated
      let userId: string | undefined;
      const token = req.cookies?.session;
      if (token) {
        const session = await storage.getSessionByToken(token);
        if (session) {
          userId = session.userId;
        }
      }

      await storage.trackPartnerClick({
        userId: userId || null,
        partnerId,
        offerId: offerId || null,
        context: context || "directory",
        biomarkerContext: biomarkerContext || null,
      });

      // Get partner to return affiliate URL
      const partner = await storage.getPartner(partnerId);

      res.json({
        success: true,
        affiliateUrl: partner?.affiliateUrl || partner?.websiteUrl,
        promoCode: partner?.promoCode,
      });
    } catch (error) {
      console.error("Track partner click error:", error);
      res.status(500).json({ message: "Failed to track click" });
    }
  });

  // =====================================================
  // SUPPLEMENT REMINDERS & PUSH NOTIFICATIONS
  // =====================================================

  // Get all supplement reminders for user
  app.get(
    "/api/reminders/supplements",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const userId = req.user!.id;
        const reminders = await storage.getSupplementReminders(userId);
        res.json(reminders);
      } catch (error) {
        console.error("Get supplement reminders error:", error);
        res.status(500).json({ message: "Failed to get reminders" });
      }
    }
  );

  // Create a new supplement reminder
  app.post(
    "/api/reminders/supplements",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const userId = req.user!.id;

        // Validate with Zod schema
        const validationSchema = z.object({
          supplementName: z.string().min(1, "Supplement name is required"),
          dosage: z.string().nullable().optional(),
          timing: z.enum([
            "morning",
            "afternoon",
            "evening",
            "bedtime",
            "with_meals",
          ]),
          time: z
            .string()
            .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
          daysOfWeek: z.array(z.string()).nullable().optional(),
          notes: z.string().nullable().optional(),
        });

        const parsed = validationSchema.safeParse(req.body);
        if (!parsed.success) {
          return res
            .status(400)
            .json({ message: parsed.error.errors[0].message });
        }

        const { supplementName, dosage, timing, time, daysOfWeek, notes } =
          parsed.data;

        const reminder = await storage.createSupplementReminder({
          userId,
          supplementName,
          dosage: dosage || null,
          timing,
          time,
          daysOfWeek: daysOfWeek || null,
          notes: notes || null,
          isActive: true,
        });

        res.status(201).json(reminder);
      } catch (error) {
        console.error("Create supplement reminder error:", error);
        res.status(500).json({ message: "Failed to create reminder" });
      }
    }
  );

  // Update a supplement reminder
  app.patch(
    "/api/reminders/supplements/:id",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        // Validate with partial Zod schema
        const validationSchema = z.object({
          supplementName: z.string().min(1).optional(),
          dosage: z.string().nullable().optional(),
          timing: z
            .enum(["morning", "afternoon", "evening", "bedtime", "with_meals"])
            .optional(),
          time: z
            .string()
            .regex(/^\d{2}:\d{2}$/)
            .optional(),
          daysOfWeek: z.array(z.string()).nullable().optional(),
          notes: z.string().nullable().optional(),
          isActive: z.boolean().optional(),
        });

        const parsed = validationSchema.safeParse(req.body);
        if (!parsed.success) {
          return res
            .status(400)
            .json({ message: parsed.error.errors[0].message });
        }

        const reminder = await storage.updateSupplementReminder(
          id,
          parsed.data
        );
        if (!reminder) {
          return res.status(404).json({ message: "Reminder not found" });
        }

        res.json(reminder);
      } catch (error) {
        console.error("Update supplement reminder error:", error);
        res.status(500).json({ message: "Failed to update reminder" });
      }
    }
  );

  // Delete a supplement reminder
  app.delete(
    "/api/reminders/supplements/:id",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        await storage.deleteSupplementReminder(id);
        res.json({ success: true });
      } catch (error) {
        console.error("Delete supplement reminder error:", error);
        res.status(500).json({ message: "Failed to delete reminder" });
      }
    }
  );

  // Get user notification settings
  app.get(
    "/api/notifications/settings",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const userId = req.user!.id;
        let settings = await storage.getUserNotificationSettings(userId);

        // Return default settings if none exist
        if (!settings) {
          settings = {
            id: "",
            userId,
            pushEnabled: true,
            supplementRemindersEnabled: true,
            protocolUpdatesEnabled: true,
            wearableInsightsEnabled: true,
            weeklyReportEnabled: true,
            pushToken: null,
            deviceType: null,
            updatedAt: null,
          };
        }

        res.json(settings);
      } catch (error) {
        console.error("Get notification settings error:", error);
        res
          .status(500)
          .json({ message: "Failed to get notification settings" });
      }
    }
  );

  // Update user notification settings
  app.patch(
    "/api/notifications/settings",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const userId = req.user!.id;
        const updates = req.body;

        const settings = await storage.upsertUserNotificationSettings({
          userId,
          ...updates,
        });

        res.json(settings);
      } catch (error) {
        console.error("Update notification settings error:", error);
        res
          .status(500)
          .json({ message: "Failed to update notification settings" });
      }
    }
  );

  // Register push token for mobile notifications
  app.post(
    "/api/notifications/register-token",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const userId = req.user!.id;
        const { pushToken, deviceType } = req.body;

        if (!pushToken) {
          return res.status(400).json({ message: "Push token is required" });
        }

        const settings = await storage.upsertUserNotificationSettings({
          userId,
          pushToken,
          deviceType: deviceType || "unknown",
        });

        res.json({ success: true, settings });
      } catch (error) {
        console.error("Register push token error:", error);
        res.status(500).json({ message: "Failed to register push token" });
      }
    }
  );

  // =====================================================
  // GAMIFICATION ROUTES
  // =====================================================

  // Get today's upgrade score
  app.get(
    "/api/gamification/daily-score",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const userId = req.user!.id;
        const today = new Date();

        let score = await storage.getDailyScore(userId, today);

        if (!score) {
          const wearableMetrics = await storage.getLatestWearableMetrics(
            userId,
            1
          );
          const checkIn = await storage.getLatestCheckIn(userId);

          const calculatedScore = calculateDailyScore(
            wearableMetrics[0],
            checkIn
          );

          score = await storage.upsertDailyScore({
            userId,
            date: today,
            score: calculatedScore.total,
            drivers: calculatedScore.drivers,
            sleepComponent: calculatedScore.sleep,
            activityComponent: calculatedScore.activity,
            recoveryComponent: calculatedScore.recovery,
            habitsComponent: calculatedScore.habits,
            dataSource:
              wearableMetrics.length > 0
                ? "wearable"
                : checkIn
                ? "checkin"
                : "estimate",
          });
        }

        res.json(score);
      } catch (error) {
        console.error("Get daily score error:", error);
        res.status(500).json({ message: "Failed to get daily score" });
      }
    }
  );

  // Get score history
  app.get(
    "/api/gamification/score-history",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const userId = req.user!.id;
        const days = parseInt(req.query.days as string) || 7;

        const scores = await storage.getDailyScores(userId, days);
        res.json(scores);
      } catch (error) {
        console.error("Get score history error:", error);
        res.status(500).json({ message: "Failed to get score history" });
      }
    }
  );

  // Get today's protocol (3 action items)
  app.get(
    "/api/gamification/daily-protocol",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const userId = req.user!.id;
        const today = new Date();

        let protocol = await storage.getDailyProtocol(userId, today);

        if (!protocol) {
          const wearableMetrics = await storage.getLatestWearableMetrics(
            userId,
            1
          );
          const latestProtocol = await storage.getLatestProtocol(userId);

          const items = generateDailyProtocolItems(
            wearableMetrics[0],
            latestProtocol
          );

          protocol = await storage.upsertDailyProtocol({
            userId,
            date: today,
            items,
            completed: [false, false, false],
          });
        }

        res.json(protocol);
      } catch (error) {
        console.error("Get daily protocol error:", error);
        res.status(500).json({ message: "Failed to get daily protocol" });
      }
    }
  );

  // Update daily protocol completion
  app.patch(
    "/api/gamification/daily-protocol/:id",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { completed } = req.body;

        if (!Array.isArray(completed)) {
          return res
            .status(400)
            .json({ message: "Completed must be an array of booleans" });
        }

        const protocol = await storage.updateDailyProtocolCompletion(
          id,
          completed
        );
        if (!protocol) {
          return res.status(404).json({ message: "Protocol not found" });
        }

        const allCompleted = completed.every(Boolean);
        if (allCompleted) {
          await storage.addXp(req.user!.id, 50);
          await storage.incrementStreak(req.user!.id);
        }

        res.json(protocol);
      } catch (error) {
        console.error("Update daily protocol error:", error);
        res.status(500).json({ message: "Failed to update protocol" });
      }
    }
  );

  // Get user progress (streaks, level, XP)
  app.get(
    "/api/gamification/progress",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const userId = req.user!.id;

        let progress = await storage.getUserProgress(userId);

        if (!progress) {
          progress = await storage.updateUserProgress(userId, {
            level: "novus",
            points: 0,
            currentStreak: 0,
            longestStreak: 0,
          });
        }

        res.json(progress);
      } catch (error) {
        console.error("Get user progress error:", error);
        res.status(500).json({ message: "Failed to get user progress" });
      }
    }
  );

  // Get latest weekly report
  app.get(
    "/api/gamification/weekly-report",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const userId = req.user!.id;

        const report = await storage.getLatestWeeklyReport(userId);
        res.json(report || null);
      } catch (error) {
        console.error("Get weekly report error:", error);
        res.status(500).json({ message: "Failed to get weekly report" });
      }
    }
  );

  // Get specific weekly report by ID
  app.get(
    "/api/weekly-reports/:id",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const userId = req.user!.id;

        const report = await storage.getWeeklyReportById(id, userId);
        if (!report) {
          return res.status(404).json({ message: "Report not found" });
        }

        res.json(report);
      } catch (error) {
        console.error("Get weekly report by ID error:", error);
        res.status(500).json({ message: "Failed to get weekly report" });
      }
    }
  );

  // Mark weekly report as viewed
  app.patch(
    "/api/gamification/weekly-report/:id/viewed",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        const report = await storage.markWeeklyReportViewed(id);
        if (!report) {
          return res.status(404).json({ message: "Report not found" });
        }

        res.json(report);
      } catch (error) {
        console.error("Mark weekly report viewed error:", error);
        res.status(500).json({ message: "Failed to mark report as viewed" });
      }
    }
  );

  // Get cohort benchmark data
  app.get(
    "/api/gamification/benchmark",
    authMiddleware,
    async (req: Request, res: Response) => {
      try {
        const userId = req.user!.id;
        const user = await storage.getUser(userId);

        const cohortKey = buildCohortKey(user);
        let cohortStats = await storage.getCohortStats(cohortKey);

        if (!cohortStats) {
          cohortStats = await storage.upsertCohortStats({
            cohortKey,
            ageRange: "30-39",
            gender: "male",
            activityLevel: "active",
            sampleSize: 1,
            metrics: {
              avgScore: 75,
              avgSleepHours: 7.2,
              avgHrv: 45,
              avgSteps: 8500,
              avgProtocolCompletion: 68,
            },
          });
        }

        const userScore = await storage.getDailyScore(userId, new Date());
        const userProgress = await storage.getUserProgress(userId);

        res.json({
          cohort: cohortStats,
          userScore: userScore?.score || 0,
          userLevel: userProgress?.level || "novus",
          percentile: calculatePercentile(
            userScore?.score || 0,
            cohortStats.metrics as any
          ),
        });
      } catch (error) {
        console.error("Get benchmark error:", error);
        res.status(500).json({ message: "Failed to get benchmark data" });
      }
    }
  );
}

// Helper functions for gamification
function calculateDailyScore(
  wearableMetrics: any,
  checkIn: any
): {
  total: number;
  sleep: number;
  activity: number;
  recovery: number;
  habits: number;
  drivers: any[];
} {
  let sleep = 15,
    activity = 15,
    recovery = 15,
    habits = 15;
  const drivers: any[] = [];

  if (wearableMetrics) {
    if (wearableMetrics.sleepDurationMinutes) {
      const hours = wearableMetrics.sleepDurationMinutes / 60;
      sleep = Math.min(25, Math.round((hours / 8) * 25));
      if (hours >= 7) {
        drivers.push({
          name: "Sleep",
          impact: "positive",
          value: hours,
          description: `${hours.toFixed(1)} hours of sleep`,
        });
      }
    }
    if (wearableMetrics.steps) {
      activity = Math.min(25, Math.round((wearableMetrics.steps / 10000) * 25));
      if (wearableMetrics.steps >= 8000) {
        drivers.push({
          name: "Activity",
          impact: "positive",
          value: wearableMetrics.steps,
          description: `${wearableMetrics.steps.toLocaleString()} steps`,
        });
      }
    }
    if (wearableMetrics.recoveryScore || wearableMetrics.readinessScore) {
      const recoveryVal =
        wearableMetrics.recoveryScore || wearableMetrics.readinessScore;
      recovery = Math.min(25, Math.round((recoveryVal / 100) * 25));
      if (recoveryVal >= 70) {
        drivers.push({
          name: "Recovery",
          impact: "positive",
          value: recoveryVal,
          description: `${recoveryVal}% recovery score`,
        });
      }
    }
  }

  if (checkIn) {
    habits = Math.min(25, 20);
    drivers.push({
      name: "Check-in",
      impact: "positive",
      value: 1,
      description: "Daily check-in completed",
    });
  }

  const total = sleep + activity + recovery + habits;

  return {
    total,
    sleep,
    activity,
    recovery,
    habits,
    drivers: drivers.slice(0, 3),
  };
}

function generateDailyProtocolItems(
  wearableMetrics: any,
  latestProtocol: any
): any[] {
  const items = [];

  let sleepRec = "Aim for 7-8 hours of quality sleep tonight";
  if (wearableMetrics?.sleepDurationMinutes) {
    const hours = wearableMetrics.sleepDurationMinutes / 60;
    if (hours < 7) {
      sleepRec = "Prioritize sleep recovery - aim for 8+ hours tonight";
    } else if (hours >= 8) {
      sleepRec = "Maintain your excellent sleep schedule";
    }
  }
  items.push({ id: "sleep", type: "sleep", text: sleepRec, completed: false });

  let trainingRec = "Complete a 30-minute workout or 10,000 steps";
  if (wearableMetrics?.recoveryScore && wearableMetrics.recoveryScore < 50) {
    trainingRec = "Active recovery day - light stretching or walking";
  } else if (
    wearableMetrics?.strain &&
    parseFloat(wearableMetrics.strain) > 15
  ) {
    trainingRec = "Rest day recommended - focus on mobility work";
  }
  items.push({
    id: "training",
    type: "training",
    text: trainingRec,
    completed: false,
  });

  let nutritionRec = "Follow your personalized nutrition protocol";
  if (latestProtocol?.recommendations) {
    const recs = latestProtocol.recommendations as any;
    if (recs.supplements && recs.supplements.length > 0) {
      nutritionRec = `Take your supplements: ${recs.supplements
        .slice(0, 2)
        .map((s: any) => s.name || s)
        .join(", ")}`;
    }
  }
  items.push({
    id: "nutrition",
    type: "nutrition",
    text: nutritionRec,
    completed: false,
  });

  return items;
}

function buildCohortKey(user: any): string {
  const ageRange = "30-39";
  const gender = "male";
  const activityLevel = "active";
  return `${gender}_${ageRange}_${activityLevel}`;
}

function calculatePercentile(
  userScore: number,
  cohortMetrics: { avgScore: number }
): number {
  if (!cohortMetrics || !cohortMetrics.avgScore) return 50;

  const diff = userScore - cohortMetrics.avgScore;
  const percentile = 50 + (diff / cohortMetrics.avgScore) * 30;

  return Math.min(99, Math.max(1, Math.round(percentile)));
}
