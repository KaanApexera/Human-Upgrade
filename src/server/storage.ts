import { 
  users, uploads, biomarkers, protocols, sessions, goals, reminders, userMetrics, notifications, referrals,
  auditLogs, feedbackReports, checkIns, biomarkerDictionary, adminUsers,
  wearableConnections, wearableDailyMetrics, wearableSyncLogs, dailyRoutines,
  partners, partnerOffers, partnerClicks,
  supplementReminders, userNotificationSettings,
  dailyScores, dailyProtocols, weeklyReports, cohortStats, userPrestige,
  type User, type InsertUser,
  type Upload, type InsertUpload,
  type Biomarker, type InsertBiomarker,
  type Protocol, type InsertProtocol,
  type Session, type InsertSession,
  type Goal, type InsertGoal,
  type Reminder, type InsertReminder,
  type UserMetrics, type InsertUserMetrics,
  type AuditLog, type InsertAuditLog,
  type FeedbackReport, type InsertFeedbackReport,
  type CheckIn, type InsertCheckIn,
  type BiomarkerDictionaryEntry, type InsertBiomarkerDictionaryEntry,
  type AdminUser,
  type WearableConnection, type InsertWearableConnection,
  type WearableDailyMetrics, type InsertWearableDailyMetrics,
  type WearableSyncLog, type InsertWearableSyncLog,
  type DailyRoutine, type InsertDailyRoutine,
  type WearableProvider,
  type Partner, type InsertPartner,
  type PartnerOffer, type InsertPartnerOffer,
  type PartnerClick, type InsertPartnerClick,
  type PartnerType,
  type SupplementReminder, type InsertSupplementReminder,
  type UserNotificationSettings, type InsertUserNotificationSettings,
  type DailyScore, type InsertDailyScore,
  type DailyProtocol, type InsertDailyProtocol,
  type WeeklyReport, type InsertWeeklyReport,
  type CohortStats, type InsertCohortStats,
  type UserPrestige,
} from "@shared/schema";

type Notification = typeof notifications.$inferSelect;
type InsertNotification = typeof notifications.$inferInsert;
type Referral = typeof referrals.$inferSelect;
import { db } from "./db";
import { eq, desc, and, gte, lte, or, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  
  // Sessions
  createSession(userId: string): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;
  
  // Uploads
  createUpload(upload: InsertUpload): Promise<Upload>;
  getUpload(id: string): Promise<Upload | undefined>;
  getUserUploads(userId: string): Promise<Upload[]>;
  updateUpload(id: string, data: Partial<Upload>): Promise<Upload | undefined>;
  
  // Biomarkers
  createBiomarkers(biomarkerList: InsertBiomarker[]): Promise<Biomarker[]>;
  getBiomarkersByUpload(uploadId: string): Promise<Biomarker[]>;
  getUserBiomarkers(userId: string): Promise<Biomarker[]>;
  
  // Protocols
  createProtocol(protocol: InsertProtocol): Promise<Protocol>;
  getLatestProtocol(userId: string): Promise<Protocol | undefined>;
  getUserProtocols(userId: string): Promise<Protocol[]>;
  updateProtocol(id: string, data: Partial<Protocol>): Promise<Protocol | undefined>;
  
  // Goals
  createGoal(goal: InsertGoal): Promise<Goal>;
  getUserGoals(userId: string): Promise<Goal[]>;
  updateGoal(id: string, data: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<void>;
  
  // Reminders
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  getUserReminders(userId: string): Promise<Reminder[]>;
  updateReminder(id: string, data: Partial<Reminder>): Promise<Reminder | undefined>;
  deleteReminder(id: string): Promise<void>;
  
  // User Metrics
  createOrUpdateUserMetrics(metrics: InsertUserMetrics): Promise<UserMetrics>;
  getUserMetrics(userId: string): Promise<UserMetrics | undefined>;
  
  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(data: Omit<InsertNotification, "id">): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;
  
  // Referrals
  getReferralStats(userId: string): Promise<{
    totalReferrals: number;
    convertedReferrals: number;
    pendingReferrals: number;
    totalCredits: number;
    referralCode: string;
  }>;
  getUserReferrals(userId: string): Promise<Referral[]>;
  createReferralInvite(userId: string, email: string): Promise<Referral>;
  
  // Audit Logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  
  // Feedback Reports
  createFeedbackReport(report: InsertFeedbackReport): Promise<FeedbackReport>;
  getFeedbackReports(status?: string): Promise<FeedbackReport[]>;
  updateFeedbackReport(id: string, data: Partial<FeedbackReport>): Promise<FeedbackReport | undefined>;
  
  // Check-ins
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  getUserCheckIns(userId: string): Promise<CheckIn[]>;
  getLatestCheckIn(userId: string): Promise<CheckIn | undefined>;
  
  // Biomarker Dictionary
  getBiomarkerDictionary(): Promise<BiomarkerDictionaryEntry[]>;
  createBiomarkerDictionaryEntry(entry: InsertBiomarkerDictionaryEntry): Promise<BiomarkerDictionaryEntry>;
  updateBiomarkerDictionaryEntry(id: string, data: Partial<BiomarkerDictionaryEntry>): Promise<BiomarkerDictionaryEntry | undefined>;
  deleteBiomarkerDictionaryEntry(id: string): Promise<void>;
  
  // Admin
  promoteToAdmin(email: string): Promise<{ success: boolean; message: string }>;
  verifyAllUsers(): Promise<void>;
  isAdmin(userId: string): Promise<boolean>;
  getUsageMetrics(): Promise<{
    totalUsers: number;
    activeSubscriptions: number;
    totalUploads: number;
    totalProtocols: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    planBreakdown: { trial: number; basic: number; premium_monthly: number; premium_annual: number };
    recentUsers: { id: string; name: string; email: string; plan: string; status: string; createdAt: Date | null }[];
  }>;
  
  // Wearable Connections
  getWearableConnection(userId: string, provider: WearableProvider): Promise<WearableConnection | undefined>;
  getUserWearableConnections(userId: string): Promise<WearableConnection[]>;
  createWearableConnection(connection: InsertWearableConnection): Promise<WearableConnection>;
  updateWearableConnection(id: string, data: Partial<WearableConnection>): Promise<WearableConnection | undefined>;
  deleteWearableConnection(userId: string, provider: WearableProvider): Promise<void>;
  
  // Wearable Daily Metrics
  upsertWearableDailyMetrics(metrics: InsertWearableDailyMetrics): Promise<WearableDailyMetrics>;
  getWearableDailyMetrics(userId: string, startDate: Date, endDate: Date): Promise<WearableDailyMetrics[]>;
  getLatestWearableMetrics(userId: string, days?: number): Promise<WearableDailyMetrics[]>;
  deleteUserWearableData(userId: string, provider?: WearableProvider): Promise<void>;
  
  // Wearable Sync Logs
  createWearableSyncLog(log: InsertWearableSyncLog): Promise<WearableSyncLog>;
  updateWearableSyncLog(id: string, data: Partial<WearableSyncLog>): Promise<WearableSyncLog | undefined>;
  
  // Daily Routines
  createDailyRoutine(routine: InsertDailyRoutine): Promise<DailyRoutine>;
  getDailyRoutine(userId: string, date: Date): Promise<DailyRoutine | undefined>;
  getLatestDailyRoutine(userId: string): Promise<DailyRoutine | undefined>;
  
  // Partners
  getPartners(type?: PartnerType): Promise<Partner[]>;
  getPartner(id: string): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: string, data: Partial<Partner>): Promise<Partner | undefined>;
  
  // Partner Offers
  getPartnerOffers(partnerId?: string): Promise<PartnerOffer[]>;
  getOffersByTags(goalTags?: string[], biomarkerTags?: string[]): Promise<(PartnerOffer & { partner: Partner })[]>;
  createPartnerOffer(offer: InsertPartnerOffer): Promise<PartnerOffer>;
  
  // Partner Clicks
  trackPartnerClick(click: InsertPartnerClick): Promise<PartnerClick>;
  getPartnerClickStats(partnerId: string): Promise<{ totalClicks: number; uniqueUsers: number }>;
  
  // Supplement Reminders
  getSupplementReminders(userId: string): Promise<SupplementReminder[]>;
  createSupplementReminder(reminder: InsertSupplementReminder): Promise<SupplementReminder>;
  updateSupplementReminder(id: string, data: Partial<SupplementReminder>): Promise<SupplementReminder | undefined>;
  deleteSupplementReminder(id: string): Promise<void>;
  
  // User Notification Settings
  getUserNotificationSettings(userId: string): Promise<UserNotificationSettings | undefined>;
  upsertUserNotificationSettings(settings: InsertUserNotificationSettings): Promise<UserNotificationSettings>;
  
  // Daily Scores
  getDailyScore(userId: string, date: Date): Promise<DailyScore | undefined>;
  getDailyScores(userId: string, days: number): Promise<DailyScore[]>;
  upsertDailyScore(score: InsertDailyScore): Promise<DailyScore>;
  
  // Daily Protocols (3 bullet items)
  getDailyProtocol(userId: string, date: Date): Promise<DailyProtocol | undefined>;
  upsertDailyProtocol(protocol: InsertDailyProtocol): Promise<DailyProtocol>;
  updateDailyProtocolCompletion(id: string, completed: boolean[]): Promise<DailyProtocol | undefined>;
  
  // Weekly Reports
  getWeeklyReport(userId: string, weekStartDate: Date): Promise<WeeklyReport | undefined>;
  getLatestWeeklyReport(userId: string): Promise<WeeklyReport | undefined>;
  getWeeklyReportById(id: string, userId: string): Promise<WeeklyReport | undefined>;
  createWeeklyReport(report: InsertWeeklyReport): Promise<WeeklyReport>;
  markWeeklyReportViewed(id: string): Promise<WeeklyReport | undefined>;
  
  // Cohort Stats (Benchmarking)
  getCohortStats(cohortKey: string): Promise<CohortStats | undefined>;
  upsertCohortStats(stats: InsertCohortStats): Promise<CohortStats>;
  
  // User Progress (existing prestige table enhanced)
  getUserProgress(userId: string): Promise<UserPrestige | undefined>;
  updateUserProgress(userId: string, data: Partial<UserPrestige>): Promise<UserPrestige | undefined>;
  incrementStreak(userId: string): Promise<UserPrestige | undefined>;
  addXp(userId: string, xp: number): Promise<UserPrestige | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.passwordResetToken, token));
    return user || undefined;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.emailVerificationToken, token));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const now = new Date();
    const trialEnds = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
        subscriptionPlan: "trial",
        subscriptionStatus: "trial",
        trialStartDate: now,
        trialEndsAt: trialEnds,
        hasUsedTrial: true,
        pdfUploadsThisMonth: 0,
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Sessions
  async createSession(userId: string): Promise<Session> {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const [session] = await db
      .insert(sessions)
      .values({
        userId,
        token,
        expiresAt,
      })
      .returning();
    return session;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.token, token), gte(sessions.expiresAt, new Date())));
    return session || undefined;
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  // Uploads
  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const [upload] = await db
      .insert(uploads)
      .values(insertUpload)
      .returning();
    return upload;
  }

  async getUpload(id: string): Promise<Upload | undefined> {
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, id));
    return upload || undefined;
  }

  async getUserUploads(userId: string): Promise<Upload[]> {
    return db
      .select()
      .from(uploads)
      .where(eq(uploads.userId, userId))
      .orderBy(desc(uploads.uploadedAt));
  }

  async updateUpload(id: string, data: Partial<Upload>): Promise<Upload | undefined> {
    const [upload] = await db
      .update(uploads)
      .set(data)
      .where(eq(uploads.id, id))
      .returning();
    return upload || undefined;
  }

  // Biomarkers
  async createBiomarkers(biomarkerList: InsertBiomarker[]): Promise<Biomarker[]> {
    if (biomarkerList.length === 0) return [];
    return db.insert(biomarkers).values(biomarkerList).returning();
  }

  async getBiomarkersByUpload(uploadId: string): Promise<Biomarker[]> {
    return db
      .select()
      .from(biomarkers)
      .where(eq(biomarkers.uploadId, uploadId));
  }

  async getUserBiomarkers(userId: string): Promise<Biomarker[]> {
    return db
      .select()
      .from(biomarkers)
      .where(eq(biomarkers.userId, userId))
      .orderBy(desc(biomarkers.extractedAt));
  }

  // Protocols
  async createProtocol(insertProtocol: InsertProtocol): Promise<Protocol> {
    const [protocol] = await db
      .insert(protocols)
      .values(insertProtocol)
      .returning();
    return protocol;
  }

  async getLatestProtocol(userId: string): Promise<Protocol | undefined> {
    const [protocol] = await db
      .select()
      .from(protocols)
      .where(eq(protocols.userId, userId))
      .orderBy(desc(protocols.generatedAt))
      .limit(1);
    return protocol || undefined;
  }

  async getUserProtocols(userId: string): Promise<Protocol[]> {
    return db
      .select()
      .from(protocols)
      .where(eq(protocols.userId, userId))
      .orderBy(desc(protocols.generatedAt));
  }

  async updateProtocol(id: string, data: Partial<Protocol>): Promise<Protocol | undefined> {
    const [protocol] = await db
      .update(protocols)
      .set(data)
      .where(eq(protocols.id, id))
      .returning();
    return protocol || undefined;
  }

  // Goals
  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const [goal] = await db.insert(goals).values(insertGoal).returning();
    return goal;
  }

  async getUserGoals(userId: string): Promise<Goal[]> {
    return db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt));
  }

  async updateGoal(id: string, data: Partial<Goal>): Promise<Goal | undefined> {
    const [goal] = await db
      .update(goals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(goals.id, id))
      .returning();
    return goal || undefined;
  }

  async deleteGoal(id: string): Promise<void> {
    await db.delete(goals).where(eq(goals.id, id));
  }

  // Reminders
  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const [reminder] = await db.insert(reminders).values(insertReminder).returning();
    return reminder;
  }

  async getUserReminders(userId: string): Promise<Reminder[]> {
    return db
      .select()
      .from(reminders)
      .where(eq(reminders.userId, userId))
      .orderBy(desc(reminders.reminderDate));
  }

  async updateReminder(id: string, data: Partial<Reminder>): Promise<Reminder | undefined> {
    const [reminder] = await db
      .update(reminders)
      .set(data)
      .where(eq(reminders.id, id))
      .returning();
    return reminder || undefined;
  }

  async deleteReminder(id: string): Promise<void> {
    await db.delete(reminders).where(eq(reminders.id, id));
  }

  // User Metrics
  async createOrUpdateUserMetrics(metrics: InsertUserMetrics): Promise<UserMetrics> {
    // Check if user already has metrics
    const existing = await this.getUserMetrics(metrics.userId);
    
    if (existing) {
      // Update existing metrics
      const [updated] = await db
        .update(userMetrics)
        .set({ ...metrics, updatedAt: new Date() })
        .where(eq(userMetrics.userId, metrics.userId))
        .returning();
      return updated;
    } else {
      // Create new metrics
      const [created] = await db
        .insert(userMetrics)
        .values(metrics)
        .returning();
      return created;
    }
  }

  async getUserMetrics(userId: string): Promise<UserMetrics | undefined> {
    const [metrics] = await db
      .select()
      .from(userMetrics)
      .where(eq(userMetrics.userId, userId))
      .orderBy(desc(userMetrics.updatedAt))
      .limit(1);
    return metrics || undefined;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async createNotification(data: Omit<InsertNotification, "id">): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(data).returning();
    return notification;
  }

  async markNotificationRead(id: string): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
  }

  async getReferralStats(userId: string): Promise<{
    totalReferrals: number;
    convertedReferrals: number;
    pendingReferrals: number;
    totalCredits: number;
    referralCode: string;
  }> {
    const userReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    const totalReferrals = userReferrals.length;
    const convertedReferrals = userReferrals.filter(r => r.status === "credited" || r.status === "subscribed").length;
    const pendingReferrals = userReferrals.filter(r => r.status === "pending" || r.status === "signed_up").length;
    const totalCredits = userReferrals.reduce((sum, r) => sum + parseFloat(r.creditAmount || "0"), 0);

    const existingCode = userReferrals.find(r => r.referralCode)?.referralCode;
    const referralCode = existingCode || `HU${userId.slice(0, 8).toUpperCase()}`;

    return { totalReferrals, convertedReferrals, pendingReferrals, totalCredits, referralCode };
  }

  async getUserReferrals(userId: string): Promise<Referral[]> {
    return db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt));
  }

  async createReferralInvite(userId: string, email: string): Promise<Referral> {
    const referralCode = `HU${userId.slice(0, 8).toUpperCase()}`;
    const [referral] = await db
      .insert(referrals)
      .values({
        referrerId: userId,
        referralCode,
        referredEmail: email,
        status: "pending",
      })
      .returning();
    return referral;
  }

  // Audit Logs
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [auditLog] = await db.insert(auditLogs).values(log).returning();
    return auditLog;
  }

  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  // Feedback Reports
  async createFeedbackReport(report: InsertFeedbackReport): Promise<FeedbackReport> {
    const [feedbackReport] = await db.insert(feedbackReports).values(report).returning();
    return feedbackReport;
  }

  async getFeedbackReports(status?: string): Promise<FeedbackReport[]> {
    if (status) {
      return db
        .select()
        .from(feedbackReports)
        .where(eq(feedbackReports.status, status))
        .orderBy(desc(feedbackReports.createdAt));
    }
    return db
      .select()
      .from(feedbackReports)
      .orderBy(desc(feedbackReports.createdAt));
  }

  async updateFeedbackReport(id: string, data: Partial<FeedbackReport>): Promise<FeedbackReport | undefined> {
    const [report] = await db
      .update(feedbackReports)
      .set(data)
      .where(eq(feedbackReports.id, id))
      .returning();
    return report || undefined;
  }

  // Check-ins
  async createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn> {
    const [check] = await db.insert(checkIns).values(checkIn).returning();
    return check;
  }

  async getUserCheckIns(userId: string): Promise<CheckIn[]> {
    return db
      .select()
      .from(checkIns)
      .where(eq(checkIns.userId, userId))
      .orderBy(desc(checkIns.createdAt));
  }

  async getLatestCheckIn(userId: string): Promise<CheckIn | undefined> {
    const [checkIn] = await db
      .select()
      .from(checkIns)
      .where(eq(checkIns.userId, userId))
      .orderBy(desc(checkIns.createdAt))
      .limit(1);
    return checkIn || undefined;
  }

  // Biomarker Dictionary
  async getBiomarkerDictionary(): Promise<BiomarkerDictionaryEntry[]> {
    return db
      .select()
      .from(biomarkerDictionary)
      .orderBy(biomarkerDictionary.category, biomarkerDictionary.name);
  }

  async createBiomarkerDictionaryEntry(entry: InsertBiomarkerDictionaryEntry): Promise<BiomarkerDictionaryEntry> {
    const [dictEntry] = await db.insert(biomarkerDictionary).values(entry).returning();
    return dictEntry;
  }

  async updateBiomarkerDictionaryEntry(id: string, data: Partial<BiomarkerDictionaryEntry>): Promise<BiomarkerDictionaryEntry | undefined> {
    const [entry] = await db
      .update(biomarkerDictionary)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(biomarkerDictionary.id, id))
      .returning();
    return entry || undefined;
  }

  async deleteBiomarkerDictionaryEntry(id: string): Promise<void> {
    await db.delete(biomarkerDictionary).where(eq(biomarkerDictionary.id, id));
  }

  async verifyAllUsers(): Promise<void> {
    await db.update(users).set({ emailVerified: true });
  }

  async promoteToAdmin(email: string): Promise<{ success: boolean; message: string }> {
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user[0]) return { success: false, message: "User not found" };
    const existing = await db.select().from(adminUsers).where(eq(adminUsers.userId, user[0].id)).limit(1);
    if (existing[0]) return { success: true, message: "Already an admin" };
    await db.insert(adminUsers).values({ userId: user[0].id, role: "super_admin" });
    return { success: true, message: `${email} is now super_admin` };
  }

  // Admin
  async isAdmin(userId: string): Promise<boolean> {
    // Check adminUsers table
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.userId, userId));
    if (admin) return true;

    // Check ADMIN_EMAIL env var fallback (set on Railway)
    if (process.env.ADMIN_EMAIL) {
      const user = await this.getUser(userId);
      if (user?.email === process.env.ADMIN_EMAIL) return true;
    }

    // If no admins are configured, grant access to the earliest registered user (app owner)
    const allAdmins = await db.select().from(adminUsers);
    if (allAdmins.length === 0) {
      const [oldest] = await db.select().from(users).orderBy(users.createdAt).limit(1);
      if (oldest?.id === userId) return true;
    }

    return false;
  }

  async getUsageMetrics(): Promise<{
    totalUsers: number;
    activeSubscriptions: number;
    totalUploads: number;
    totalProtocols: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    planBreakdown: { trial: number; basic: number; premium_monthly: number; premium_annual: number };
    recentUsers: { id: string; name: string; email: string; plan: string; status: string; createdAt: Date | null }[];
  }> {
    const allUsers = await db.select().from(users);
    const allUploads = await db.select().from(uploads);
    const allProtocols = await db.select().from(protocols);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalUsers = allUsers.length;
    const activeSubscriptions = allUsers.filter(u =>
      u.subscriptionStatus === "active" || u.subscriptionStatus === "trial"
    ).length;
    const totalUploads = allUploads.length;
    const totalProtocols = allProtocols.length;

    const newUsersToday = allUsers.filter(u => u.createdAt && new Date(u.createdAt) >= todayStart).length;
    const newUsersThisWeek = allUsers.filter(u => u.createdAt && new Date(u.createdAt) >= weekStart).length;

    const planBreakdown = {
      trial: allUsers.filter(u => u.subscriptionPlan === "trial").length,
      basic: allUsers.filter(u => u.subscriptionPlan === "basic").length,
      premium_monthly: allUsers.filter(u => u.subscriptionPlan === "premium_monthly").length,
      premium_annual: allUsers.filter(u => u.subscriptionPlan === "premium_annual").length,
    };

    const recentUsers = allUsers
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
      .slice(0, 20)
      .map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        plan: u.subscriptionPlan ?? "trial",
        status: u.subscriptionStatus ?? "trial",
        createdAt: u.createdAt,
      }));

    return { totalUsers, activeSubscriptions, totalUploads, totalProtocols, newUsersToday, newUsersThisWeek, planBreakdown, recentUsers };
  }

  // Wearable Connections
  async getWearableConnection(userId: string, provider: WearableProvider): Promise<WearableConnection | undefined> {
    const [connection] = await db
      .select()
      .from(wearableConnections)
      .where(and(
        eq(wearableConnections.userId, userId),
        eq(wearableConnections.provider, provider)
      ));
    return connection || undefined;
  }

  async getUserWearableConnections(userId: string): Promise<WearableConnection[]> {
    return db
      .select()
      .from(wearableConnections)
      .where(eq(wearableConnections.userId, userId));
  }

  async createWearableConnection(connection: InsertWearableConnection): Promise<WearableConnection> {
    const [conn] = await db.insert(wearableConnections).values(connection).returning();
    return conn;
  }

  async updateWearableConnection(id: string, data: Partial<WearableConnection>): Promise<WearableConnection | undefined> {
    const [conn] = await db
      .update(wearableConnections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(wearableConnections.id, id))
      .returning();
    return conn || undefined;
  }

  async deleteWearableConnection(userId: string, provider: WearableProvider): Promise<void> {
    await db
      .delete(wearableConnections)
      .where(and(
        eq(wearableConnections.userId, userId),
        eq(wearableConnections.provider, provider)
      ));
  }

  // Wearable Daily Metrics
  async upsertWearableDailyMetrics(metrics: InsertWearableDailyMetrics): Promise<WearableDailyMetrics> {
    const existing = await db
      .select()
      .from(wearableDailyMetrics)
      .where(and(
        eq(wearableDailyMetrics.userId, metrics.userId),
        eq(wearableDailyMetrics.provider, metrics.provider),
        eq(wearableDailyMetrics.date, metrics.date)
      ));

    if (existing.length > 0) {
      const [updated] = await db
        .update(wearableDailyMetrics)
        .set({ ...metrics, updatedAt: new Date() })
        .where(eq(wearableDailyMetrics.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(wearableDailyMetrics).values(metrics).returning();
      return created;
    }
  }

  async getWearableDailyMetrics(userId: string, startDate: Date, endDate: Date): Promise<WearableDailyMetrics[]> {
    return db
      .select()
      .from(wearableDailyMetrics)
      .where(and(
        eq(wearableDailyMetrics.userId, userId),
        gte(wearableDailyMetrics.date, startDate),
        lte(wearableDailyMetrics.date, endDate)
      ))
      .orderBy(desc(wearableDailyMetrics.date));
  }

  async getLatestWearableMetrics(userId: string, days: number = 7): Promise<WearableDailyMetrics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return db
      .select()
      .from(wearableDailyMetrics)
      .where(and(
        eq(wearableDailyMetrics.userId, userId),
        gte(wearableDailyMetrics.date, startDate)
      ))
      .orderBy(desc(wearableDailyMetrics.date));
  }

  async deleteUserWearableData(userId: string, provider?: WearableProvider): Promise<void> {
    if (provider) {
      await db
        .delete(wearableDailyMetrics)
        .where(and(
          eq(wearableDailyMetrics.userId, userId),
          eq(wearableDailyMetrics.provider, provider)
        ));
    } else {
      await db
        .delete(wearableDailyMetrics)
        .where(eq(wearableDailyMetrics.userId, userId));
    }
  }

  // Wearable Sync Logs
  async createWearableSyncLog(log: InsertWearableSyncLog): Promise<WearableSyncLog> {
    const [syncLog] = await db.insert(wearableSyncLogs).values(log).returning();
    return syncLog;
  }

  async updateWearableSyncLog(id: string, data: Partial<WearableSyncLog>): Promise<WearableSyncLog | undefined> {
    const [log] = await db
      .update(wearableSyncLogs)
      .set(data)
      .where(eq(wearableSyncLogs.id, id))
      .returning();
    return log || undefined;
  }

  // Daily Routines
  async createDailyRoutine(routine: InsertDailyRoutine): Promise<DailyRoutine> {
    const [r] = await db.insert(dailyRoutines).values(routine).returning();
    return r;
  }

  async getDailyRoutine(userId: string, date: Date): Promise<DailyRoutine | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [routine] = await db
      .select()
      .from(dailyRoutines)
      .where(and(
        eq(dailyRoutines.userId, userId),
        gte(dailyRoutines.date, startOfDay),
        lte(dailyRoutines.date, endOfDay)
      ));
    return routine || undefined;
  }

  async getLatestDailyRoutine(userId: string): Promise<DailyRoutine | undefined> {
    const [routine] = await db
      .select()
      .from(dailyRoutines)
      .where(eq(dailyRoutines.userId, userId))
      .orderBy(desc(dailyRoutines.date))
      .limit(1);
    return routine || undefined;
  }

  // Partners
  async getPartners(type?: PartnerType): Promise<Partner[]> {
    if (type) {
      return db
        .select()
        .from(partners)
        .where(and(eq(partners.type, type), eq(partners.isActive, true)))
        .orderBy(partners.name);
    }
    return db
      .select()
      .from(partners)
      .where(eq(partners.isActive, true))
      .orderBy(partners.name);
  }

  async getPartner(id: string): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner || undefined;
  }

  async createPartner(partner: InsertPartner): Promise<Partner> {
    const [p] = await db.insert(partners).values(partner).returning();
    return p;
  }

  async updatePartner(id: string, data: Partial<Partner>): Promise<Partner | undefined> {
    const [partner] = await db
      .update(partners)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(partners.id, id))
      .returning();
    return partner || undefined;
  }

  // Partner Offers
  async getPartnerOffers(partnerId?: string): Promise<PartnerOffer[]> {
    if (partnerId) {
      return db
        .select()
        .from(partnerOffers)
        .where(and(eq(partnerOffers.partnerId, partnerId), eq(partnerOffers.isActive, true)));
    }
    return db
      .select()
      .from(partnerOffers)
      .where(eq(partnerOffers.isActive, true));
  }

  async getOffersByTags(goalTags?: string[], biomarkerTags?: string[]): Promise<(PartnerOffer & { partner: Partner })[]> {
    const allOffers = await db
      .select({
        offer: partnerOffers,
        partner: partners,
      })
      .from(partnerOffers)
      .innerJoin(partners, eq(partnerOffers.partnerId, partners.id))
      .where(and(eq(partnerOffers.isActive, true), eq(partners.isActive, true)));

    return allOffers
      .filter(({ offer }) => {
        const offerGoalTags = offer.goalTags || [];
        const offerBiomarkerTags = offer.biomarkerTags || [];
        
        const matchesGoal = !goalTags || goalTags.length === 0 || 
          goalTags.some(tag => offerGoalTags.includes(tag));
        const matchesBiomarker = !biomarkerTags || biomarkerTags.length === 0 || 
          biomarkerTags.some(tag => offerBiomarkerTags.includes(tag));
        
        return matchesGoal || matchesBiomarker;
      })
      .map(({ offer, partner }) => ({ ...offer, partner }));
  }

  async createPartnerOffer(offer: InsertPartnerOffer): Promise<PartnerOffer> {
    const [o] = await db.insert(partnerOffers).values(offer).returning();
    return o;
  }

  // Partner Clicks
  async trackPartnerClick(click: InsertPartnerClick): Promise<PartnerClick> {
    const [c] = await db.insert(partnerClicks).values(click).returning();
    return c;
  }

  async getPartnerClickStats(partnerId: string): Promise<{ totalClicks: number; uniqueUsers: number }> {
    const clicks = await db
      .select()
      .from(partnerClicks)
      .where(eq(partnerClicks.partnerId, partnerId));
    
    const uniqueUsers = new Set(clicks.map(c => c.userId).filter(Boolean)).size;
    
    return {
      totalClicks: clicks.length,
      uniqueUsers,
    };
  }

  // Supplement Reminders
  async getSupplementReminders(userId: string): Promise<SupplementReminder[]> {
    return db
      .select()
      .from(supplementReminders)
      .where(eq(supplementReminders.userId, userId))
      .orderBy(supplementReminders.time);
  }

  async createSupplementReminder(reminder: InsertSupplementReminder): Promise<SupplementReminder> {
    const [r] = await db.insert(supplementReminders).values(reminder).returning();
    return r;
  }

  async updateSupplementReminder(id: string, data: Partial<SupplementReminder>): Promise<SupplementReminder | undefined> {
    const [reminder] = await db
      .update(supplementReminders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(supplementReminders.id, id))
      .returning();
    return reminder || undefined;
  }

  async deleteSupplementReminder(id: string): Promise<void> {
    await db.delete(supplementReminders).where(eq(supplementReminders.id, id));
  }

  // User Notification Settings
  async getUserNotificationSettings(userId: string): Promise<UserNotificationSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userNotificationSettings)
      .where(eq(userNotificationSettings.userId, userId));
    return settings || undefined;
  }

  async upsertUserNotificationSettings(settings: InsertUserNotificationSettings): Promise<UserNotificationSettings> {
    const existing = await this.getUserNotificationSettings(settings.userId);
    
    if (existing) {
      const [updated] = await db
        .update(userNotificationSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(userNotificationSettings.userId, settings.userId))
        .returning();
      return updated;
    }
    
    const [created] = await db
      .insert(userNotificationSettings)
      .values(settings)
      .returning();
    return created;
  }

  // Daily Scores
  async getDailyScore(userId: string, date: Date): Promise<DailyScore | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const [score] = await db
      .select()
      .from(dailyScores)
      .where(and(
        eq(dailyScores.userId, userId),
        gte(dailyScores.date, startOfDay),
        lte(dailyScores.date, endOfDay)
      ));
    return score || undefined;
  }

  async getDailyScores(userId: string, days: number): Promise<DailyScore[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    
    return db
      .select()
      .from(dailyScores)
      .where(and(
        eq(dailyScores.userId, userId),
        gte(dailyScores.date, startDate)
      ))
      .orderBy(desc(dailyScores.date));
  }

  async upsertDailyScore(score: InsertDailyScore): Promise<DailyScore> {
    const existing = await this.getDailyScore(score.userId, score.date);
    
    if (existing) {
      const [updated] = await db
        .update(dailyScores)
        .set(score)
        .where(eq(dailyScores.id, existing.id))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(dailyScores).values(score).returning();
    return created;
  }

  // Daily Protocols
  async getDailyProtocol(userId: string, date: Date): Promise<DailyProtocol | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const [protocol] = await db
      .select()
      .from(dailyProtocols)
      .where(and(
        eq(dailyProtocols.userId, userId),
        gte(dailyProtocols.date, startOfDay),
        lte(dailyProtocols.date, endOfDay)
      ));
    return protocol || undefined;
  }

  async upsertDailyProtocol(protocol: InsertDailyProtocol): Promise<DailyProtocol> {
    const existing = await this.getDailyProtocol(protocol.userId, protocol.date);
    
    if (existing) {
      const [updated] = await db
        .update(dailyProtocols)
        .set({ ...protocol, updatedAt: new Date() })
        .where(eq(dailyProtocols.id, existing.id))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(dailyProtocols).values(protocol).returning();
    return created;
  }

  async updateDailyProtocolCompletion(id: string, completed: boolean[]): Promise<DailyProtocol | undefined> {
    const [protocol] = await db
      .update(dailyProtocols)
      .set({ completed, updatedAt: new Date() })
      .where(eq(dailyProtocols.id, id))
      .returning();
    return protocol || undefined;
  }

  // Weekly Reports
  async getWeeklyReport(userId: string, weekStartDate: Date): Promise<WeeklyReport | undefined> {
    const startOfWeek = new Date(weekStartDate);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(weekStartDate);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    
    const [report] = await db
      .select()
      .from(weeklyReports)
      .where(and(
        eq(weeklyReports.userId, userId),
        gte(weeklyReports.weekStartDate, startOfWeek),
        lte(weeklyReports.weekStartDate, endOfWeek)
      ));
    return report || undefined;
  }

  async getLatestWeeklyReport(userId: string): Promise<WeeklyReport | undefined> {
    const [report] = await db
      .select()
      .from(weeklyReports)
      .where(eq(weeklyReports.userId, userId))
      .orderBy(desc(weeklyReports.weekStartDate))
      .limit(1);
    return report || undefined;
  }

  async getWeeklyReportById(id: string, userId: string): Promise<WeeklyReport | undefined> {
    const [report] = await db
      .select()
      .from(weeklyReports)
      .where(and(eq(weeklyReports.id, id), eq(weeklyReports.userId, userId)));
    return report || undefined;
  }

  async createWeeklyReport(report: InsertWeeklyReport): Promise<WeeklyReport> {
    const [created] = await db.insert(weeklyReports).values(report).returning();
    return created;
  }

  async markWeeklyReportViewed(id: string): Promise<WeeklyReport | undefined> {
    const [report] = await db
      .update(weeklyReports)
      .set({ viewedAt: new Date() })
      .where(eq(weeklyReports.id, id))
      .returning();
    return report || undefined;
  }

  // Cohort Stats
  async getCohortStats(cohortKey: string): Promise<CohortStats | undefined> {
    const [stats] = await db
      .select()
      .from(cohortStats)
      .where(eq(cohortStats.cohortKey, cohortKey));
    return stats || undefined;
  }

  async upsertCohortStats(stats: InsertCohortStats): Promise<CohortStats> {
    const existing = await this.getCohortStats(stats.cohortKey);
    
    if (existing) {
      const [updated] = await db
        .update(cohortStats)
        .set({ ...stats, updatedAt: new Date() })
        .where(eq(cohortStats.cohortKey, stats.cohortKey))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(cohortStats).values(stats).returning();
    return created;
  }

  // User Progress
  async getUserProgress(userId: string): Promise<UserPrestige | undefined> {
    const [progress] = await db
      .select()
      .from(userPrestige)
      .where(eq(userPrestige.userId, userId));
    return progress || undefined;
  }

  async updateUserProgress(userId: string, data: Partial<UserPrestige>): Promise<UserPrestige | undefined> {
    const existing = await this.getUserProgress(userId);
    
    if (!existing) {
      const [created] = await db
        .insert(userPrestige)
        .values({ userId, ...data, updatedAt: new Date() })
        .returning();
      return created;
    }
    
    const [updated] = await db
      .update(userPrestige)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userPrestige.userId, userId))
      .returning();
    return updated || undefined;
  }

  async incrementStreak(userId: string): Promise<UserPrestige | undefined> {
    const existing = await this.getUserProgress(userId);
    const now = new Date();
    
    if (!existing) {
      const [created] = await db
        .insert(userPrestige)
        .values({ 
          userId, 
          currentStreak: 1, 
          longestStreak: 1, 
          lastCheckIn: now,
          updatedAt: now 
        })
        .returning();
      return created;
    }
    
    const newStreak = (existing.currentStreak || 0) + 1;
    const longestStreak = Math.max(newStreak, existing.longestStreak || 0);
    
    const [updated] = await db
      .update(userPrestige)
      .set({ 
        currentStreak: newStreak, 
        longestStreak, 
        lastCheckIn: now,
        updatedAt: now 
      })
      .where(eq(userPrestige.userId, userId))
      .returning();
    return updated || undefined;
  }

  async addXp(userId: string, xp: number): Promise<UserPrestige | undefined> {
    const existing = await this.getUserProgress(userId);
    const now = new Date();
    
    if (!existing) {
      const [created] = await db
        .insert(userPrestige)
        .values({ 
          userId, 
          points: xp, 
          level: 'novus',
          updatedAt: now 
        })
        .returning();
      return created;
    }
    
    const newPoints = (existing.points || 0) + xp;
    const newLevel = this.calculateLevel(newPoints);
    
    const [updated] = await db
      .update(userPrestige)
      .set({ 
        points: newPoints, 
        level: newLevel,
        updatedAt: now 
      })
      .where(eq(userPrestige.userId, userId))
      .returning();
    return updated || undefined;
  }

  private calculateLevel(points: number): string {
    if (points >= 5000) return 'apex';
    if (points >= 2500) return 'elite';
    if (points >= 1000) return 'adept';
    if (points >= 250) return 'initiate';
    return 'novus';
  }
}

export const storage = new DatabaseStorage();
