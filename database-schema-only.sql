--
-- PostgreSQL database dump
--

\restrict ctFaEkgkBByU2OjsySMiEqiHycrlsEr8cTpn8hOBY8IUg5VJWyIu36DxmQRryxK

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36) NOT NULL,
    role text DEFAULT 'admin'::text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36) NOT NULL,
    action text NOT NULL,
    input_snapshot_hash text,
    input_snapshot jsonb,
    rules_output jsonb,
    ai_output jsonb,
    model_used text,
    tokens_used integer,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: biomarker_dictionary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.biomarker_dictionary (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    aliases text[],
    category text NOT NULL,
    unit text NOT NULL,
    optimal_range_low numeric(10,4),
    optimal_range_high numeric(10,4),
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: biomarkers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.biomarkers (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    upload_id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    name text NOT NULL,
    value numeric(10,4),
    unit text,
    reference_range_low numeric(10,4),
    reference_range_high numeric(10,4),
    status text,
    category text,
    extracted_at timestamp without time zone DEFAULT now()
);


--
-- Name: check_ins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.check_ins (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36) NOT NULL,
    sleep_quality integer,
    energy_level integer,
    mood_score integer,
    stress_level integer,
    libido integer,
    training_consistency integer,
    notes text,
    week_start_date timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: cohort_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cohort_stats (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    cohort_key text NOT NULL,
    age_range text NOT NULL,
    gender text NOT NULL,
    activity_level text NOT NULL,
    sample_size integer DEFAULT 0,
    metrics jsonb NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: daily_protocols; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_protocols (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36) NOT NULL,
    date timestamp without time zone NOT NULL,
    items jsonb NOT NULL,
    completed jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: daily_routines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_routines (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36) NOT NULL,
    date timestamp without time zone NOT NULL,
    morning_routine jsonb,
    evening_routine jsonb,
    exercise_recommendation jsonb,
    nutrition_guidance jsonb,
    sleep_optimization jsonb,
    recovery_protocol jsonb,
    insights jsonb,
    flags jsonb,
    generated_at timestamp without time zone DEFAULT now()
);


--
-- Name: daily_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_scores (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36) NOT NULL,
    date timestamp without time zone NOT NULL,
    score integer NOT NULL,
    drivers jsonb,
    sleep_component integer,
    activity_component integer,
    recovery_component integer,
    habits_component integer,
    data_source text DEFAULT 'mixed'::text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: feedback_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feedback_reports (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36) NOT NULL,
    protocol_id character varying(36),
    category text NOT NULL,
    description text NOT NULL,
    section_reported text,
    status text DEFAULT 'pending'::text,
    admin_notes text,
    resolved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goals (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36) NOT NULL,
    biomarker_name text NOT NULL,
    target_value numeric(10,4) NOT NULL,
    current_value numeric(10,4),
    unit text,
    direction text DEFAULT 'lower'::text,
    target_date timestamp without time zone,
    status text DEFAULT 'active'::text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36) NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    link text,
    read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: partner_clicks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partner_clicks (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36),
    partner_id character varying(36) NOT NULL,
    offer_id character varying(36),
    context text,
    biomarker_context text[],
    clicked_at timestamp without time zone DEFAULT now()
);


--
-- Name: partner_offers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partner_offers (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    partner_id character varying(36) NOT NULL,
    product_name text NOT NULL,
    description text,
    image_url text,
    affiliate_url text,
    price text,
    goal_tags text[],
    biomarker_tags text[],
    cta_copy text DEFAULT 'Shop Now'::text,
    is_premium_only boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    discount_percent integer
);


--
-- Name: partners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partners (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    description text,
    logo_url text,
    website_url text,
    affiliate_url text,
    promo_code text,
    promo_discount text,
    regions text[],
    is_vetted boolean DEFAULT false,
    is_premium_only boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_featured boolean DEFAULT false
);


--
-- Name: protocols; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.protocols (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36) NOT NULL,
    upload_id character varying(36),
    performance_age integer,
    peptide_readiness jsonb,
    hormone_status jsonb,
    metabolic_status jsonb,
    inflammation jsonb,
    morning_routine jsonb,
    evening_routine jsonb,
    supplement_protocol jsonb,
    workout_plan jsonb,
    risks jsonb,
    notes text,
    expertise_level text DEFAULT 'beginner'::text,
    generated_at timestamp without time zone DEFAULT now(),
    fitness_protocol jsonb,
    lifestyle_guidance jsonb,
    dos_and_donts jsonb,
    cycle_recommendations jsonb
);


--
-- Name: referrals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referrals (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    referrer_id character varying(36) NOT NULL,
    referral_code text NOT NULL,
    referred_email text,
    referred_user_id character varying(36),
    status text DEFAULT 'pending'::text,
    credit_amount numeric(10,2) DEFAULT '0'::numeric,
    created_at timestamp without time zone DEFAULT now(),
    converted_at timestamp without time zone
);


--
-- Name: reminders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reminders (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36) NOT NULL,
    type text DEFAULT 'retest'::text,
    reminder_date timestamp without time zone NOT NULL,
    message text,
    sent boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36) NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: supplement_reminders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supplement_reminders (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36) NOT NULL,
    supplement_name text NOT NULL,
    dosage text,
    timing text NOT NULL,
    "time" text NOT NULL,
    days_of_week text[],
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: uploads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.uploads (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36) NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer,
    page_count integer,
    uploaded_at timestamp without time zone DEFAULT now(),
    status text DEFAULT 'pending'::text,
    extracted_text text,
    ocr_used boolean DEFAULT false
);


--
-- Name: user_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_metrics (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36) NOT NULL,
    height_cm numeric(5,1) NOT NULL,
    weight_kg numeric(5,1) NOT NULL,
    body_fat_percent numeric(4,1),
    age integer NOT NULL,
    gender text NOT NULL,
    fitness_goal text NOT NULL,
    activity_level text DEFAULT 'moderate'::text,
    bmi numeric(4,1),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    natural_only boolean DEFAULT false
);


--
-- Name: user_notification_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_notification_settings (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36) NOT NULL,
    push_enabled boolean DEFAULT true,
    supplement_reminders_enabled boolean DEFAULT true,
    protocol_updates_enabled boolean DEFAULT true,
    wearable_insights_enabled boolean DEFAULT true,
    weekly_report_enabled boolean DEFAULT true,
    push_token text,
    device_type text,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: user_prestige; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_prestige (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36) NOT NULL,
    level text DEFAULT 'novus'::text,
    points integer DEFAULT 0,
    current_streak integer DEFAULT 0,
    longest_streak integer DEFAULT 0,
    last_check_in timestamp without time zone,
    achievements text[],
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text,
    avatar_url text,
    subscription_plan text DEFAULT 'none'::text,
    subscription_status text DEFAULT 'inactive'::text,
    stripe_customer_id text,
    stripe_subscription_id text,
    renewal_date timestamp without time zone,
    pdf_uploads_this_month integer DEFAULT 0,
    last_upload_reset timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    trial_start_date timestamp without time zone,
    trial_ends_at timestamp without time zone,
    has_used_trial boolean DEFAULT false,
    preferred_language text DEFAULT 'en'::text,
    google_id text
);


--
-- Name: wearable_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wearable_connections (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36) NOT NULL,
    provider text NOT NULL,
    access_token text,
    refresh_token text,
    expires_at timestamp without time zone,
    status text DEFAULT 'connected'::text,
    last_synced_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: wearable_daily_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wearable_daily_metrics (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36) NOT NULL,
    provider text NOT NULL,
    date timestamp without time zone NOT NULL,
    sleep_duration_minutes integer,
    sleep_score integer,
    readiness_score integer,
    recovery_score integer,
    hrv_ms numeric(10,2),
    resting_hr numeric(10,2),
    steps integer,
    calories numeric(10,2),
    activity_score integer,
    strain numeric(10,2),
    raw_payload jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: wearable_sync_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wearable_sync_logs (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36),
    provider text NOT NULL,
    sync_started_at timestamp without time zone DEFAULT now(),
    sync_finished_at timestamp without time zone,
    status text DEFAULT 'pending'::text,
    error_message text,
    records_processed integer DEFAULT 0,
    meta jsonb,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: weekly_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weekly_reports (
    id character varying(36) DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(36) NOT NULL,
    week_start_date timestamp without time zone NOT NULL,
    content jsonb NOT NULL,
    score_trend jsonb,
    sleep_trend jsonb,
    hrv_trend jsonb,
    habits_consistency integer,
    key_wins jsonb,
    next_week_focus jsonb,
    viewed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_user_id_unique UNIQUE (user_id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: biomarker_dictionary biomarker_dictionary_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biomarker_dictionary
    ADD CONSTRAINT biomarker_dictionary_name_unique UNIQUE (name);


--
-- Name: biomarker_dictionary biomarker_dictionary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biomarker_dictionary
    ADD CONSTRAINT biomarker_dictionary_pkey PRIMARY KEY (id);


--
-- Name: biomarkers biomarkers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biomarkers
    ADD CONSTRAINT biomarkers_pkey PRIMARY KEY (id);


--
-- Name: check_ins check_ins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.check_ins
    ADD CONSTRAINT check_ins_pkey PRIMARY KEY (id);


--
-- Name: cohort_stats cohort_stats_cohort_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cohort_stats
    ADD CONSTRAINT cohort_stats_cohort_key_unique UNIQUE (cohort_key);


--
-- Name: cohort_stats cohort_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cohort_stats
    ADD CONSTRAINT cohort_stats_pkey PRIMARY KEY (id);


--
-- Name: daily_protocols daily_protocols_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_protocols
    ADD CONSTRAINT daily_protocols_pkey PRIMARY KEY (id);


--
-- Name: daily_routines daily_routines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_routines
    ADD CONSTRAINT daily_routines_pkey PRIMARY KEY (id);


--
-- Name: daily_scores daily_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_scores
    ADD CONSTRAINT daily_scores_pkey PRIMARY KEY (id);


--
-- Name: feedback_reports feedback_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback_reports
    ADD CONSTRAINT feedback_reports_pkey PRIMARY KEY (id);


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: partner_clicks partner_clicks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_clicks
    ADD CONSTRAINT partner_clicks_pkey PRIMARY KEY (id);


--
-- Name: partner_offers partner_offers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_offers
    ADD CONSTRAINT partner_offers_pkey PRIMARY KEY (id);


--
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


--
-- Name: protocols protocols_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.protocols
    ADD CONSTRAINT protocols_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_referral_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referral_code_unique UNIQUE (referral_code);


--
-- Name: reminders reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_unique UNIQUE (token);


--
-- Name: supplement_reminders supplement_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplement_reminders
    ADD CONSTRAINT supplement_reminders_pkey PRIMARY KEY (id);


--
-- Name: uploads uploads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploads
    ADD CONSTRAINT uploads_pkey PRIMARY KEY (id);


--
-- Name: user_metrics user_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_metrics
    ADD CONSTRAINT user_metrics_pkey PRIMARY KEY (id);


--
-- Name: user_notification_settings user_notification_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notification_settings
    ADD CONSTRAINT user_notification_settings_pkey PRIMARY KEY (id);


--
-- Name: user_notification_settings user_notification_settings_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notification_settings
    ADD CONSTRAINT user_notification_settings_user_id_unique UNIQUE (user_id);


--
-- Name: user_prestige user_prestige_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_prestige
    ADD CONSTRAINT user_prestige_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_google_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_unique UNIQUE (google_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wearable_connections wearable_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wearable_connections
    ADD CONSTRAINT wearable_connections_pkey PRIMARY KEY (id);


--
-- Name: wearable_daily_metrics wearable_daily_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wearable_daily_metrics
    ADD CONSTRAINT wearable_daily_metrics_pkey PRIMARY KEY (id);


--
-- Name: wearable_sync_logs wearable_sync_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wearable_sync_logs
    ADD CONSTRAINT wearable_sync_logs_pkey PRIMARY KEY (id);


--
-- Name: weekly_reports weekly_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_reports
    ADD CONSTRAINT weekly_reports_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: audit_logs audit_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: biomarkers biomarkers_upload_id_uploads_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biomarkers
    ADD CONSTRAINT biomarkers_upload_id_uploads_id_fk FOREIGN KEY (upload_id) REFERENCES public.uploads(id);


--
-- Name: biomarkers biomarkers_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biomarkers
    ADD CONSTRAINT biomarkers_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: check_ins check_ins_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.check_ins
    ADD CONSTRAINT check_ins_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: daily_protocols daily_protocols_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_protocols
    ADD CONSTRAINT daily_protocols_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: daily_routines daily_routines_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_routines
    ADD CONSTRAINT daily_routines_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: daily_scores daily_scores_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_scores
    ADD CONSTRAINT daily_scores_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: feedback_reports feedback_reports_protocol_id_protocols_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback_reports
    ADD CONSTRAINT feedback_reports_protocol_id_protocols_id_fk FOREIGN KEY (protocol_id) REFERENCES public.protocols(id);


--
-- Name: feedback_reports feedback_reports_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback_reports
    ADD CONSTRAINT feedback_reports_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: goals goals_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: partner_clicks partner_clicks_offer_id_partner_offers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_clicks
    ADD CONSTRAINT partner_clicks_offer_id_partner_offers_id_fk FOREIGN KEY (offer_id) REFERENCES public.partner_offers(id);


--
-- Name: partner_clicks partner_clicks_partner_id_partners_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_clicks
    ADD CONSTRAINT partner_clicks_partner_id_partners_id_fk FOREIGN KEY (partner_id) REFERENCES public.partners(id);


--
-- Name: partner_clicks partner_clicks_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_clicks
    ADD CONSTRAINT partner_clicks_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: partner_offers partner_offers_partner_id_partners_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_offers
    ADD CONSTRAINT partner_offers_partner_id_partners_id_fk FOREIGN KEY (partner_id) REFERENCES public.partners(id);


--
-- Name: protocols protocols_upload_id_uploads_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.protocols
    ADD CONSTRAINT protocols_upload_id_uploads_id_fk FOREIGN KEY (upload_id) REFERENCES public.uploads(id);


--
-- Name: protocols protocols_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.protocols
    ADD CONSTRAINT protocols_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: referrals referrals_referred_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referred_user_id_users_id_fk FOREIGN KEY (referred_user_id) REFERENCES public.users(id);


--
-- Name: referrals referrals_referrer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referrer_id_users_id_fk FOREIGN KEY (referrer_id) REFERENCES public.users(id);


--
-- Name: reminders reminders_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminders
    ADD CONSTRAINT reminders_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: sessions sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: supplement_reminders supplement_reminders_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplement_reminders
    ADD CONSTRAINT supplement_reminders_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: uploads uploads_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploads
    ADD CONSTRAINT uploads_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_metrics user_metrics_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_metrics
    ADD CONSTRAINT user_metrics_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_notification_settings user_notification_settings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notification_settings
    ADD CONSTRAINT user_notification_settings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_prestige user_prestige_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_prestige
    ADD CONSTRAINT user_prestige_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: wearable_connections wearable_connections_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wearable_connections
    ADD CONSTRAINT wearable_connections_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: wearable_daily_metrics wearable_daily_metrics_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wearable_daily_metrics
    ADD CONSTRAINT wearable_daily_metrics_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: wearable_sync_logs wearable_sync_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wearable_sync_logs
    ADD CONSTRAINT wearable_sync_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: weekly_reports weekly_reports_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_reports
    ADD CONSTRAINT weekly_reports_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict ctFaEkgkBByU2OjsySMiEqiHycrlsEr8cTpn8hOBY8IUg5VJWyIu36DxmQRryxK

