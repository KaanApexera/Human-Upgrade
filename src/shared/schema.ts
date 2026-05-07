import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
  jsonb,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table with subscription info
export const users = pgTable("users", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  preferredLanguage: text("preferred_language").default("en"), // en, de, fr, es, tr, zh, ja
  subscriptionPlan: text("subscription_plan").default("none"), // none, basic, premium_monthly, premium_annual, trial
  subscriptionStatus: text("subscription_status").default("inactive"), // active, inactive, expired, cancelled, trial
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  renewalDate: timestamp("renewal_date"),
  pdfUploadsThisMonth: integer("pdf_uploads_this_month").default(0),
  lastUploadReset: timestamp("last_upload_reset").default(sql`now()`),
  trialStartDate: timestamp("trial_start_date"),
  trialEndsAt: timestamp("trial_ends_at"),
  hasUsedTrial: boolean("has_used_trial").default(false),
  googleId: text("google_id").unique(),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const usersRelations = relations(users, ({ many }) => ({
  uploads: many(uploads),
  protocols: many(protocols),
}));

// PDF uploads table
export const uploads = pgTable("uploads", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  pageCount: integer("page_count"),
  uploadedAt: timestamp("uploaded_at").default(sql`now()`),
  status: text("status").default("pending"), // pending, processing, completed, failed
  extractedText: text("extracted_text"),
  ocrUsed: boolean("ocr_used").default(false),
});

export const uploadsRelations = relations(uploads, ({ one, many }) => ({
  user: one(users, { fields: [uploads.userId], references: [users.id] }),
  biomarkers: many(biomarkers),
  protocols: many(protocols),
}));

// Extracted biomarkers
export const biomarkers = pgTable("biomarkers", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  uploadId: varchar("upload_id", { length: 36 })
    .notNull()
    .references(() => uploads.id),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  value: decimal("value", { precision: 10, scale: 4 }),
  unit: text("unit"),
  referenceRangeLow: decimal("reference_range_low", {
    precision: 10,
    scale: 4,
  }),
  referenceRangeHigh: decimal("reference_range_high", {
    precision: 10,
    scale: 4,
  }),
  status: text("status"), // normal, low, high, critical
  category: text("category"), // hormone, metabolic, inflammation, vitamin, mineral, etc.
  extractedAt: timestamp("extracted_at").default(sql`now()`),
});

export const biomarkersRelations = relations(biomarkers, ({ one }) => ({
  upload: one(uploads, {
    fields: [biomarkers.uploadId],
    references: [uploads.id],
  }),
  user: one(users, { fields: [biomarkers.userId], references: [users.id] }),
}));

// Generated protocols
export const protocols = pgTable("protocols", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  uploadId: varchar("upload_id", { length: 36 }).references(() => uploads.id),
  performanceAge: integer("performance_age"),
  peptideReadiness: jsonb("peptide_readiness"),
  hormoneStatus: jsonb("hormone_status"),
  metabolicStatus: jsonb("metabolic_status"),
  inflammation: jsonb("inflammation"),
  morningRoutine: jsonb("morning_routine"),
  eveningRoutine: jsonb("evening_routine"),
  supplementProtocol: jsonb("supplement_protocol"),
  workoutPlan: jsonb("workout_plan"),
  fitnessProtocol: jsonb("fitness_protocol"),
  lifestyleGuidance: jsonb("lifestyle_guidance"),
  risks: jsonb("risks"),
  notes: text("notes"),
  expertiseLevel: text("expertise_level").default("beginner"), // beginner, optimal, advanced
  dosAndDonts: jsonb("dos_and_donts"), // Printable optimization guidelines
  cycleRecommendations: jsonb("cycle_recommendations"), // Peptide/TRT cycle recommendations
  generatedAt: timestamp("generated_at").default(sql`now()`),
});

export const protocolsRelations = relations(protocols, ({ one }) => ({
  user: one(users, { fields: [protocols.userId], references: [users.id] }),
  upload: one(uploads, {
    fields: [protocols.uploadId],
    references: [uploads.id],
  }),
}));

// User goals for biomarkers
export const goals = pgTable("goals", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  biomarkerName: text("biomarker_name").notNull(),
  targetValue: decimal("target_value", { precision: 10, scale: 4 }).notNull(),
  currentValue: decimal("current_value", { precision: 10, scale: 4 }),
  unit: text("unit"),
  direction: text("direction").default("lower"), // lower, higher, maintain
  targetDate: timestamp("target_date"),
  status: text("status").default("active"), // active, achieved, abandoned
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
}));

// Retest reminders
export const reminders = pgTable("reminders", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  type: text("type").default("retest"), // retest, goal_check, protocol_update
  reminderDate: timestamp("reminder_date").notNull(),
  message: text("message"),
  sent: boolean("sent").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const remindersRelations = relations(reminders, ({ one }) => ({
  user: one(users, { fields: [reminders.userId], references: [users.id] }),
}));

// In-app notifications
export const notifications = pgTable("notifications", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(), // retest_reminder, protocol_update, goal_achieved, subscription, system
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"), // optional link to navigate to
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

// Sessions for auth
export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

// User body metrics for personalized protocols
export const userMetrics = pgTable("user_metrics", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  heightCm: decimal("height_cm", { precision: 5, scale: 1 }).notNull(),
  weightKg: decimal("weight_kg", { precision: 5, scale: 1 }).notNull(),
  bodyFatPercent: decimal("body_fat_percent", { precision: 4, scale: 1 }),
  age: integer("age").notNull(),
  gender: text("gender").notNull(), // male, female
  fitnessGoal: text("fitness_goal").notNull(), // muscle_gain, fat_loss, body_recomp, longevity
  activityLevel: text("activity_level").default("moderate"), // sedentary, light, moderate, active, very_active
  naturalOnly: boolean("natural_only").default(false), // No peptides, TRT, or PEDs
  bmi: decimal("bmi", { precision: 4, scale: 1 }),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const userMetricsRelations = relations(userMetrics, ({ one }) => ({
  user: one(users, { fields: [userMetrics.userId], references: [users.id] }),
}));

// Referral codes and tracking
export const referrals = pgTable("referrals", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  referralCode: text("referral_code").notNull().unique(),
  referredEmail: text("referred_email"),
  referredUserId: varchar("referred_user_id", { length: 36 }).references(
    () => users.id
  ),
  status: text("status").default("pending"), // pending, signed_up, subscribed, credited
  creditAmount: decimal("credit_amount", { precision: 10, scale: 2 }).default(
    "0"
  ),
  createdAt: timestamp("created_at").default(sql`now()`),
  convertedAt: timestamp("converted_at"),
});

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer",
  }),
  referredUser: one(users, {
    fields: [referrals.referredUserId],
    references: [users.id],
    relationName: "referred",
  }),
}));

// User prestige levels and gamification
export const userPrestige = pgTable("user_prestige", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  level: text("level").default("novus"), // novus, initiate, adept, elite, apex
  points: integer("points").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastCheckIn: timestamp("last_check_in"),
  achievements: text("achievements").array(),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const userPrestigeRelations = relations(userPrestige, ({ one }) => ({
  user: one(users, { fields: [userPrestige.userId], references: [users.id] }),
}));

// Audit logs for AI protocol generations
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(), // protocol_generated, biomarker_extracted, chat_response
  inputSnapshotHash: text("input_snapshot_hash"), // SHA-256 hash of input data
  inputSnapshot: jsonb("input_snapshot"), // Sanitized input data
  rulesOutput: jsonb("rules_output"), // Rule engine decisions
  aiOutput: jsonb("ai_output"), // AI-generated content
  modelUsed: text("model_used"), // e.g., gpt-5
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

// Feedback reports for "Report an Issue" feature
export const feedbackReports = pgTable("feedback_reports", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  protocolId: varchar("protocol_id", { length: 36 }).references(
    () => protocols.id
  ),
  category: text("category").notNull(), // inaccurate, harmful, confusing, other
  description: text("description").notNull(),
  sectionReported: text("section_reported"), // e.g., supplements, peptides, workout
  status: text("status").default("pending"), // pending, reviewed, resolved, dismissed
  adminNotes: text("admin_notes"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const feedbackReportsRelations = relations(
  feedbackReports,
  ({ one }) => ({
    user: one(users, {
      fields: [feedbackReports.userId],
      references: [users.id],
    }),
    protocol: one(protocols, {
      fields: [feedbackReports.protocolId],
      references: [protocols.id],
    }),
  })
);

// Weekly check-ins for subjective health tracking
export const checkIns = pgTable("check_ins", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  sleepQuality: integer("sleep_quality"), // 1-10
  energyLevel: integer("energy_level"), // 1-10
  moodScore: integer("mood_score"), // 1-10
  stressLevel: integer("stress_level"), // 1-10
  libido: integer("libido"), // 1-10
  trainingConsistency: integer("training_consistency"), // 1-10
  notes: text("notes"),
  weekStartDate: timestamp("week_start_date").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  user: one(users, { fields: [checkIns.userId], references: [users.id] }),
}));

// Biomarker dictionary for admin management
export const biomarkerDictionary = pgTable("biomarker_dictionary", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  aliases: text("aliases").array(), // Alternative names
  category: text("category").notNull(), // lipids, glucose, inflammation, liver, kidney, thyroid, cbc
  unit: text("unit").notNull(),
  optimalRangeLow: decimal("optimal_range_low", { precision: 10, scale: 4 }),
  optimalRangeHigh: decimal("optimal_range_high", { precision: 10, scale: 4 }),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Admin role for users
export const adminUsers = pgTable("admin_users", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id)
    .unique(),
  role: text("role").default("admin"), // admin, super_admin
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const adminUsersRelations = relations(adminUsers, ({ one }) => ({
  user: one(users, { fields: [adminUsers.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
});

export const insertUploadSchema = createInsertSchema(uploads).pick({
  userId: true,
  fileName: true,
  filePath: true,
  fileSize: true,
});

export const insertBiomarkerSchema = createInsertSchema(biomarkers).pick({
  uploadId: true,
  userId: true,
  name: true,
  value: true,
  unit: true,
  referenceRangeLow: true,
  referenceRangeHigh: true,
  status: true,
  category: true,
});

export const insertProtocolSchema = createInsertSchema(protocols).omit({
  id: true,
  generatedAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  userId: true,
  token: true,
  expiresAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  userId: true,
  biomarkerName: true,
  targetValue: true,
  currentValue: true,
  unit: true,
  direction: true,
  targetDate: true,
});

export const insertReminderSchema = createInsertSchema(reminders).pick({
  userId: true,
  type: true,
  reminderDate: true,
  message: true,
});

export const insertUserMetricsSchema = createInsertSchema(userMetrics).pick({
  userId: true,
  heightCm: true,
  weightKg: true,
  bodyFatPercent: true,
  age: true,
  gender: true,
  fitnessGoal: true,
  activityLevel: true,
  naturalOnly: true,
  bmi: true,
});

export const insertUserPrestigeSchema = createInsertSchema(userPrestige).pick({
  userId: true,
  level: true,
  points: true,
  currentStreak: true,
  longestStreak: true,
  lastCheckIn: true,
  achievements: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).pick({
  userId: true,
  action: true,
  inputSnapshotHash: true,
  inputSnapshot: true,
  rulesOutput: true,
  aiOutput: true,
  modelUsed: true,
  tokensUsed: true,
});

export const insertFeedbackReportSchema = createInsertSchema(
  feedbackReports
).pick({
  userId: true,
  protocolId: true,
  category: true,
  description: true,
  sectionReported: true,
});

export const insertCheckInSchema = createInsertSchema(checkIns).pick({
  userId: true,
  sleepQuality: true,
  energyLevel: true,
  moodScore: true,
  stressLevel: true,
  libido: true,
  trainingConsistency: true,
  notes: true,
  weekStartDate: true,
});

export const insertBiomarkerDictionarySchema = createInsertSchema(
  biomarkerDictionary
).pick({
  name: true,
  aliases: true,
  category: true,
  unit: true,
  optimalRangeLow: true,
  optimalRangeHigh: true,
  description: true,
  isActive: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = z.infer<typeof insertUploadSchema>;
export type Biomarker = typeof biomarkers.$inferSelect;
export type InsertBiomarker = z.infer<typeof insertBiomarkerSchema>;
export type Protocol = typeof protocols.$inferSelect;
export type InsertProtocol = z.infer<typeof insertProtocolSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type UserMetrics = typeof userMetrics.$inferSelect;
export type InsertUserMetrics = z.infer<typeof insertUserMetricsSchema>;
export type UserPrestige = typeof userPrestige.$inferSelect;
export type InsertUserPrestige = z.infer<typeof insertUserPrestigeSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type FeedbackReport = typeof feedbackReports.$inferSelect;
export type InsertFeedbackReport = z.infer<typeof insertFeedbackReportSchema>;
export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type BiomarkerDictionaryEntry = typeof biomarkerDictionary.$inferSelect;
export type InsertBiomarkerDictionaryEntry = z.infer<
  typeof insertBiomarkerDictionarySchema
>;
export type AdminUser = typeof adminUsers.$inferSelect;

// Prestige level types
export type PrestigeLevel = "novus" | "initiate" | "adept" | "elite" | "apex";

// Subscription plan types
export type SubscriptionPlan =
  | "none"
  | "basic"
  | "premium_monthly"
  | "premium_annual";
export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "expired"
  | "cancelled";

// Protocol section types for frontend
export interface PeptideProtocol {
  name: string;
  dosage: string;
  timing: string;
  frequency: string;
  duration: string;
  risks: string[];
  contraindications: string[];
  levels: {
    beginner: string;
    optimal: string;
    advanced: string;
  };
}

export interface RoutineItem {
  time: string;
  action: string;
  details: string;
  priority: "high" | "medium" | "low";
}

export interface SupplementItem {
  name: string;
  dosage: string;
  timing: string;
  purpose: string;
  notes?: string;
}

export interface WorkoutItem {
  day: string;
  type: string;
  exercises: string[];
  duration: string;
  intensity: string;
}

export interface RiskItem {
  category: string;
  level: "low" | "moderate" | "high" | "critical";
  description: string;
  recommendation: string;
}

// Do's and Don'ts for printable guidelines
export interface DosAndDonts {
  dos: {
    category: string;
    items: string[];
    priority: "high" | "medium" | "low";
  }[];
  donts: {
    category: string;
    items: string[];
    severity: "critical" | "important" | "caution";
  }[];
  generatedAt: string;
}

// Peptide/TRT cycle recommendations
export interface CycleRecommendations {
  peptideCycles: {
    name: string;
    purpose: string;
    dosage: string;
    frequency: string;
    timing: string;
    cycleLength: string;
    notes: string[];
  }[];
  trtProtocol: {
    compound: string;
    dosage: string;
    frequency: string;
    timing: string;
    cycleLength: string;
    pctRequired: boolean;
    pctProtocol?: string;
    monitoring: string[];
  } | null;
  safetyGuidelines: string[];
  bloodworkMonitoring: {
    marker: string;
    frequency: string;
    targetRange: string;
  }[];
  disclaimer: string;
  generatedAt: string;
}

// =====================================================
// WEARABLE DEVICE INTEGRATION TABLES
// =====================================================

// Wearable device connections (Oura, WHOOP, Apple Health)
export const wearableConnections = pgTable("wearable_connections", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  provider: text("provider").notNull(), // 'oura', 'whoop', 'apple_health'
  accessToken: text("access_token"), // encrypted in production
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  status: text("status").default("connected"), // 'connected', 'disconnected', 'error'
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const wearableConnectionsRelations = relations(
  wearableConnections,
  ({ one }) => ({
    user: one(users, {
      fields: [wearableConnections.userId],
      references: [users.id],
    }),
  })
);

export const insertWearableConnectionSchema = createInsertSchema(
  wearableConnections
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWearableConnection = z.infer<
  typeof insertWearableConnectionSchema
>;
export type WearableConnection = typeof wearableConnections.$inferSelect;

// Daily metrics from wearable devices
export const wearableDailyMetrics = pgTable("wearable_daily_metrics", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  provider: text("provider").notNull(), // 'oura', 'whoop', 'apple_health'
  date: timestamp("date").notNull(),
  sleepDurationMinutes: integer("sleep_duration_minutes"),
  sleepScore: integer("sleep_score"),
  readinessScore: integer("readiness_score"), // Oura readiness
  recoveryScore: integer("recovery_score"), // WHOOP recovery
  hrvMs: decimal("hrv_ms", { precision: 10, scale: 2 }),
  restingHr: decimal("resting_hr", { precision: 10, scale: 2 }),
  steps: integer("steps"),
  calories: decimal("calories", { precision: 10, scale: 2 }),
  activityScore: integer("activity_score"),
  strain: decimal("strain", { precision: 10, scale: 2 }), // WHOOP strain
  rawPayload: jsonb("raw_payload"), // Full original provider payload
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const wearableDailyMetricsRelations = relations(
  wearableDailyMetrics,
  ({ one }) => ({
    user: one(users, {
      fields: [wearableDailyMetrics.userId],
      references: [users.id],
    }),
  })
);

export const insertWearableDailyMetricsSchema = createInsertSchema(
  wearableDailyMetrics
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWearableDailyMetrics = z.infer<
  typeof insertWearableDailyMetricsSchema
>;
export type WearableDailyMetrics = typeof wearableDailyMetrics.$inferSelect;

// Sync logs for wearable data
export const wearableSyncLogs = pgTable("wearable_sync_logs", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  provider: text("provider").notNull(),
  syncStartedAt: timestamp("sync_started_at").default(sql`now()`),
  syncFinishedAt: timestamp("sync_finished_at"),
  status: text("status").default("pending"), // 'pending', 'success', 'partial', 'error'
  errorMessage: text("error_message"),
  recordsProcessed: integer("records_processed").default(0),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const wearableSyncLogsRelations = relations(
  wearableSyncLogs,
  ({ one }) => ({
    user: one(users, {
      fields: [wearableSyncLogs.userId],
      references: [users.id],
    }),
  })
);

export const insertWearableSyncLogSchema = createInsertSchema(
  wearableSyncLogs
).omit({
  id: true,
  createdAt: true,
});

export type InsertWearableSyncLog = z.infer<typeof insertWearableSyncLogSchema>;
export type WearableSyncLog = typeof wearableSyncLogs.$inferSelect;

// AI-generated daily routines based on wearable data
export const dailyRoutines = pgTable("daily_routines", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  date: timestamp("date").notNull(),
  morningRoutine: jsonb("morning_routine"),
  eveningRoutine: jsonb("evening_routine"),
  exerciseRecommendation: jsonb("exercise_recommendation"),
  nutritionGuidance: jsonb("nutrition_guidance"),
  sleepOptimization: jsonb("sleep_optimization"),
  recoveryProtocol: jsonb("recovery_protocol"),
  insights: jsonb("insights"), // Key observations from wearable data
  flags: jsonb("flags"), // Recovery flags, movement priority, etc.
  generatedAt: timestamp("generated_at").default(sql`now()`),
});

export const dailyRoutinesRelations = relations(dailyRoutines, ({ one }) => ({
  user: one(users, { fields: [dailyRoutines.userId], references: [users.id] }),
}));

export const insertDailyRoutineSchema = createInsertSchema(dailyRoutines).omit({
  id: true,
  generatedAt: true,
});

export type InsertDailyRoutine = z.infer<typeof insertDailyRoutineSchema>;
export type DailyRoutine = typeof dailyRoutines.$inferSelect;

// Wearable provider types
export type WearableProvider = "oura" | "whoop" | "apple_health";

// Wearable insights interface for dashboard
export interface WearableInsights {
  sleepTrend: {
    average: number;
    trend: "improving" | "stable" | "declining";
    lastWeek: number[];
  };
  hrvTrend: {
    average: number;
    trend: "improving" | "stable" | "declining";
    lastWeek: number[];
  };
  restingHrTrend: {
    average: number;
    trend: "improving" | "stable" | "declining";
    lastWeek: number[];
  };
  activityTrend: {
    averageSteps: number;
    trend: "improving" | "stable" | "declining";
    lastWeek: number[];
  };
  recoveryStatus: "optimal" | "good" | "moderate" | "low";
  flags: string[];
}

// =====================================================
// PARTNER/AFFILIATE MARKETING TABLES
// =====================================================

// Partner brands, influencers, and providers
export const partners = pgTable("partners", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'supplement_brand', 'fitness_influencer', 'peptide_provider'
  description: text("description"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  affiliateUrl: text("affiliate_url"), // Base affiliate/tracking URL
  promoCode: text("promo_code"),
  promoDiscount: text("promo_discount"), // e.g., "15% off" or "$10 off"
  regions: text("regions").array(), // Allowed regions/countries
  isVetted: boolean("is_vetted").default(false), // Compliance verified
  isFeatured: boolean("is_featured").default(false), // Show prominently
  isPremiumOnly: boolean("is_premium_only").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const partnersRelations = relations(partners, ({ many }) => ({
  offers: many(partnerOffers),
}));

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;

// Partner product/service offers with targeting tags
export const partnerOffers = pgTable("partner_offers", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  partnerId: varchar("partner_id", { length: 36 })
    .notNull()
    .references(() => partners.id),
  productName: text("product_name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  affiliateUrl: text("affiliate_url"), // Specific product affiliate link
  price: text("price"), // Display price like "$29.99"
  discountPercent: integer("discount_percent"), // e.g., 15 for 15% off
  goalTags: text("goal_tags").array(), // e.g., ['muscle_gain', 'fat_loss', 'longevity']
  biomarkerTags: text("biomarker_tags").array(), // e.g., ['vitamin_d', 'testosterone', 'inflammation']
  ctaCopy: text("cta_copy").default("Shop Now"), // Button text
  isPremiumOnly: boolean("is_premium_only").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const partnerOffersRelations = relations(partnerOffers, ({ one }) => ({
  partner: one(partners, {
    fields: [partnerOffers.partnerId],
    references: [partners.id],
  }),
}));

export const insertPartnerOfferSchema = createInsertSchema(partnerOffers).omit({
  id: true,
  createdAt: true,
});

export type InsertPartnerOffer = z.infer<typeof insertPartnerOfferSchema>;
export type PartnerOffer = typeof partnerOffers.$inferSelect;

// Track affiliate clicks and conversions
export const partnerClicks = pgTable("partner_clicks", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  partnerId: varchar("partner_id", { length: 36 })
    .notNull()
    .references(() => partners.id),
  offerId: varchar("offer_id", { length: 36 }).references(
    () => partnerOffers.id
  ),
  context: text("context"), // 'dashboard', 'protocol', 'directory', 'recommendation'
  biomarkerContext: text("biomarker_context").array(), // Which biomarkers triggered this recommendation
  clickedAt: timestamp("clicked_at").default(sql`now()`),
});

export const partnerClicksRelations = relations(partnerClicks, ({ one }) => ({
  user: one(users, { fields: [partnerClicks.userId], references: [users.id] }),
  partner: one(partners, {
    fields: [partnerClicks.partnerId],
    references: [partners.id],
  }),
  offer: one(partnerOffers, {
    fields: [partnerClicks.offerId],
    references: [partnerOffers.id],
  }),
}));

export const insertPartnerClickSchema = createInsertSchema(partnerClicks).omit({
  id: true,
  clickedAt: true,
});

export type InsertPartnerClick = z.infer<typeof insertPartnerClickSchema>;
export type PartnerClick = typeof partnerClicks.$inferSelect;

// Partner types
export type PartnerType =
  | "supplement_brand"
  | "fitness_influencer"
  | "peptide_provider";

// =====================================================
// SUPPLEMENT REMINDERS (Push Notifications)
// =====================================================

// Supplement reminders for push notifications
export const supplementReminders = pgTable("supplement_reminders", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  supplementName: text("supplement_name").notNull(),
  dosage: text("dosage"),
  timing: text("timing").notNull(), // 'morning', 'afternoon', 'evening', 'bedtime', 'with_meals'
  time: text("time").notNull(), // HH:MM format (24h)
  daysOfWeek: text("days_of_week").array(), // ['monday', 'tuesday', etc.] or null for daily
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const supplementRemindersRelations = relations(
  supplementReminders,
  ({ one }) => ({
    user: one(users, {
      fields: [supplementReminders.userId],
      references: [users.id],
    }),
  })
);

export const insertSupplementReminderSchema = createInsertSchema(
  supplementReminders
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSupplementReminder = z.infer<
  typeof insertSupplementReminderSchema
>;
export type SupplementReminder = typeof supplementReminders.$inferSelect;

// User notification preferences for mobile push
export const userNotificationSettings = pgTable("user_notification_settings", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id)
    .unique(),
  pushEnabled: boolean("push_enabled").default(true),
  supplementRemindersEnabled: boolean("supplement_reminders_enabled").default(
    true
  ),
  protocolUpdatesEnabled: boolean("protocol_updates_enabled").default(true),
  wearableInsightsEnabled: boolean("wearable_insights_enabled").default(true),
  weeklyReportEnabled: boolean("weekly_report_enabled").default(true),
  pushToken: text("push_token"), // FCM or APNS token
  deviceType: text("device_type"), // 'ios', 'android', 'web'
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const userNotificationSettingsRelations = relations(
  userNotificationSettings,
  ({ one }) => ({
    user: one(users, {
      fields: [userNotificationSettings.userId],
      references: [users.id],
    }),
  })
);

export const insertUserNotificationSettingsSchema = createInsertSchema(
  userNotificationSettings
).omit({
  id: true,
  updatedAt: true,
});

export type InsertUserNotificationSettings = z.infer<
  typeof insertUserNotificationSettingsSchema
>;
export type UserNotificationSettings =
  typeof userNotificationSettings.$inferSelect;

// =====================================================
// DAILY UPGRADE SCORE & GAMIFICATION
// =====================================================

// Daily Upgrade Score (0-100)
export const dailyScores = pgTable("daily_scores", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  date: timestamp("date").notNull(),
  score: integer("score").notNull(), // 0-100
  drivers: jsonb("drivers"), // Top 3 drivers for the score
  sleepComponent: integer("sleep_component"), // 0-25
  activityComponent: integer("activity_component"), // 0-25
  recoveryComponent: integer("recovery_component"), // 0-25
  habitsComponent: integer("habits_component"), // 0-25
  dataSource: text("data_source").default("mixed"), // 'wearable', 'checkin', 'mixed', 'estimate'
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const dailyScoresRelations = relations(dailyScores, ({ one }) => ({
  user: one(users, { fields: [dailyScores.userId], references: [users.id] }),
}));

export const insertDailyScoreSchema = createInsertSchema(dailyScores).omit({
  id: true,
  createdAt: true,
});

export type InsertDailyScore = z.infer<typeof insertDailyScoreSchema>;
export type DailyScore = typeof dailyScores.$inferSelect;

// Today's Protocol (3 daily action items)
export const dailyProtocols = pgTable("daily_protocols", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  date: timestamp("date").notNull(),
  items: jsonb("items").notNull(), // Array of 3 items: sleep, training, nutrition
  completed: jsonb("completed").default("[]"), // Array of booleans for completion status
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const dailyProtocolsRelations = relations(dailyProtocols, ({ one }) => ({
  user: one(users, { fields: [dailyProtocols.userId], references: [users.id] }),
}));

export const insertDailyProtocolSchema = createInsertSchema(
  dailyProtocols
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDailyProtocol = z.infer<typeof insertDailyProtocolSchema>;
export type DailyProtocol = typeof dailyProtocols.$inferSelect;

// Weekly Human Upgrade Report
export const weeklyReports = pgTable("weekly_reports", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id),
  weekStartDate: timestamp("week_start_date").notNull(),
  content: jsonb("content").notNull(), // Full report content
  scoreTrend: jsonb("score_trend"), // Weekly score data
  sleepTrend: jsonb("sleep_trend"),
  hrvTrend: jsonb("hrv_trend"),
  habitsConsistency: integer("habits_consistency"), // 0-100
  keyWins: jsonb("key_wins"), // Array of accomplishments
  nextWeekFocus: jsonb("next_week_focus"), // Priorities for next week
  viewedAt: timestamp("viewed_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const weeklyReportsRelations = relations(weeklyReports, ({ one }) => ({
  user: one(users, { fields: [weeklyReports.userId], references: [users.id] }),
}));

export const insertWeeklyReportSchema = createInsertSchema(weeklyReports).omit({
  id: true,
  createdAt: true,
});

export type InsertWeeklyReport = z.infer<typeof insertWeeklyReportSchema>;
export type WeeklyReport = typeof weeklyReports.$inferSelect;

// Anonymous Cohort Stats for Benchmarking
export const cohortStats = pgTable("cohort_stats", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  cohortKey: text("cohort_key").notNull().unique(), // e.g., "male_30-39_active"
  ageRange: text("age_range").notNull(), // "18-29", "30-39", "40-49", "50+"
  gender: text("gender").notNull(), // "male", "female"
  activityLevel: text("activity_level").notNull(), // "sedentary", "moderate", "active"
  sampleSize: integer("sample_size").default(0),
  metrics: jsonb("metrics").notNull(), // Aggregated anonymous metrics
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertCohortStatsSchema = createInsertSchema(cohortStats).omit({
  id: true,
  updatedAt: true,
});

export type InsertCohortStats = z.infer<typeof insertCohortStatsSchema>;
export type CohortStats = typeof cohortStats.$inferSelect;

// Daily Protocol Item interface
export interface DailyProtocolItem {
  id: string;
  type: "sleep" | "training" | "nutrition";
  text: string;
  completed: boolean;
}

// Score Driver interface
export interface ScoreDriver {
  name: string;
  impact: "positive" | "negative" | "neutral";
  value: number;
  description: string;
}

// Weekly Report Content interface
export interface WeeklyReportContent {
  summary: string;
  scoreTrend: {
    values: number[];
    average: number;
    change: number;
  };
  highlights: string[];
  improvements: string[];
  recommendations: string[];
}

// Cohort Metrics interface
export interface CohortMetrics {
  avgScore: number;
  avgSleepHours: number;
  avgHrv: number;
  avgSteps: number;
  avgProtocolCompletion: number;
}
