# Human Upgrade OS

## Overview

Human Upgrade OS is a health optimization platform designed to analyze biomarker data from uploaded documents (PDFs and images) and generate personalized health protocols. Its core purpose is to provide users with insights into their health, calculate a "Performance Age," and offer tailored recommendations for peptides, hormones, supplements, and lifestyle routines to enhance well-being and longevity. The platform aims to be an essential tool for individuals seeking to proactively manage and upgrade their health based on scientific data.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query
- **UI Components**: shadcn/ui built on Radix UI, styled with Tailwind CSS (dark mode only)
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful JSON API with cookie-based session authentication
- **File Handling**: Multer for PDF/image uploads, stored locally
- **Document Processing**: pdf-parse for PDF text, Tesseract.js for OCR (images, scanned documents) supporting 11 languages.
- **Analysis Engine**: OpenAI GPT for biomarker extraction and protocol generation.

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: `shared/schema.ts`
- **Key Tables**: users, sessions, uploads, biomarkers, protocols, wearable_connections, wearable_daily_metrics, wearable_sync_logs, daily_routines, partners, partner_offers, partner_clicks.

### Wearable Device Integration
- **Supported Devices**: Oura Ring (OAuth), WHOOP (OAuth), Apple Health (REST ingestion for iOS app)
- **Data Types**: Sleep duration, HRV, resting HR, steps, calories, activity/recovery scores
- **Sync Strategy**: OAuth token exchange for Oura/WHOOP, REST API for Apple Health data ingestion from iOS app
- **Smart Routines**: Personalized daily routines generated based on sleep, HRV, and recovery data (Premium only)
- **Privacy Controls**: Users can disconnect devices and delete all wearable data from Settings page
- **Routes**: `/integrations` page for device connections, `/api/wearables/*` for data endpoints

### Partner/Affiliate Marketing System
- **Partner Types**: Supplement brands, fitness influencers, peptide providers
- **Smart Recommendations**: Matches partner offers to user biomarkers (deficiencies) and fitness goals
- **Click Tracking**: Records affiliate clicks with context and biomarker snapshot
- **FTC Compliance**: Affiliate disclosure badges on all partner cards and recommendations
- **Routes**: `/partners` page for directory browsing, `/api/partners/*` for data endpoints

### Authentication
- **Method**: Cookie-based sessions with bcrypt password hashing.

### Subscription System
- **Provider**: Stripe integration via Replit connectors.
- **Plans**: Basic, Premium Monthly, Premium Annual, and a 7-day free trial for new users.
- **Features**: Checkout sessions, billing portal, webhook handling, and paywall enforcement.

### Peptide Knowledge Base
- **File**: `server/peptideKnowledge.ts`
- **Categories**: Muscle Growth, Recovery/Injury Repair, Longevity/Anti-Aging, Cognitive/Neuro, Sleep Optimization, Fat Loss/Metabolic, Hormonal Balance, Energy/Vitality
- **Integration**: Automatically injected into protocol generation and health assistant chat
- **Goal Matching**: Maps user fitness goals to appropriate peptide recommendations
- **Stacks**: Wolverine Stack (BPC-157 + TB-500), Glow Stack, KLOW Stack, CJC-1295 + Ipamorelin

### Gamification System
- **Daily Upgrade Score**: 0-100 score based on sleep, activity, recovery, habits (stored in daily_scores table)
- **Today's Protocol**: 3 daily action items with completion checkboxes, awards 50 XP on full completion
- **Streak & Level System**: 5 tiers (Novus→Initiate→Adept→Elite→Apex), XP thresholds at 250/1000/2500/5000
- **Anonymous Benchmarking**: User percentile ranking vs. demographic cohort (age, gender, activity level)
- **Weekly Reports**: Summary of weekly performance with trends, key wins, focus areas
- **Routes**: Gamification widgets on Dashboard, `/reports/:id` for full weekly report view

### UI/UX Decisions
- **Branding**: Deep black-violet, dark charcoal, white, and red accents.
- **Typography**: Montserrat (headings), Inter (body).
- **Theme**: Dark mode only, futuristic biotech aesthetic.
- **Key Features**: Dashboard with gamification widgets + 14 metric cards (e.g., Performance Age™, Vital Energy Index), Health Assistant, Compare Reports, Progress Tracking, Pre-Upload Questionnaire for fitness goals, and a Referral Program.
- **Safety Features**: "Red Flags Guard" for emergency detection, Audit Logging, and a "Report Issue" feature.
- **Internationalization**: Multi-language support (7 languages) with a language switcher and preference persistence.
- **Mobile Readiness**: PWA manifest, iOS splash screens, and Capacitor configuration for native wrappers.

## External Dependencies

### Third-Party Services
- **OpenAI API**: For biomarker analysis and health protocol generation.
- **Stripe**: For subscription payment processing and management.
- **Tesseract.js**: For client-side OCR processing of documents.

### Database
- **PostgreSQL**: The primary database for all application data.

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: ORM and migrations.
- `@tanstack/react-query`: Server state management.
- `openai`: OpenAI API client.
- `pdf-parse`: PDF text extraction.
- `tesseract.js`: OCR processing.
- `stripe` / `stripe-replit-sync`: Stripe integration.
- `bcrypt`: Password hashing.
- `multer`: File upload handling.
- `react-i18next`: Internationalization framework.