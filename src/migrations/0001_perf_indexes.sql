-- Performance indexes for foreign-key / hot-filter columns.
-- Applied 2026-06-17. Postgres does NOT auto-index FK columns, so every
-- per-user query (dashboard, biomarkers, progress, protocol, etc.) was doing
-- a sequential scan. These remove that latent bottleneck at scale.
--
-- NOTE: deploy does not run `drizzle-kit push`, so these survive deploys.
-- If you ever run `npm run db:push`, mirror these in shared/schema.ts first,
-- otherwise push will DROP them (it reconciles the DB to the schema).

CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_user_created ON uploads(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_biomarkers_user_id ON biomarkers(user_id);
CREATE INDEX IF NOT EXISTS idx_biomarkers_user_name ON biomarkers(user_id, name);
CREATE INDEX IF NOT EXISTS idx_biomarkers_upload ON biomarkers(upload_id);
CREATE INDEX IF NOT EXISTS idx_protocols_user_id ON protocols(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_metrics_user_id ON user_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_prestige_user_id ON user_prestige(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_scores_user_id ON daily_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_scores_user_date ON daily_scores(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_protocols_user_id ON daily_protocols(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_routines_user_id ON daily_routines(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_user_id ON weekly_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_supplement_reminders_user_id ON supplement_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notification_settings_user_id ON user_notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_wearable_connections_user_id ON wearable_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_wearable_daily_metrics_user_id ON wearable_daily_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_wdm_user_date ON wearable_daily_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_wearable_sync_logs_user_id ON wearable_sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_clicks_user_id ON partner_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_partner_offers_partner ON partner_offers(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_offers_active ON partner_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_partners_active ON partners(is_active);
CREATE INDEX IF NOT EXISTS idx_cohort_stats_key ON cohort_stats(cohort_key);
