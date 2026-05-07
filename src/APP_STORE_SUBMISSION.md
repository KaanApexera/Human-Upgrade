# App Store Submission Guide for Human Upgrade OS

This guide walks you through submitting Human Upgrade OS to the Apple App Store and Google Play Store.

## Prerequisites

### Developer Accounts Required
1. **Apple Developer Account**: $99/year - https://developer.apple.com/programs/enroll/
2. **Google Play Developer Account**: $25 one-time - https://play.google.com/console/signup

### Development Environment (for building native apps)
- **macOS** with Xcode 14+ (required for iOS)
- Android Studio (for Android)
- Node.js 18+
- CocoaPods (iOS dependency manager)

---

## Project Configuration Complete

The following has been configured for you:

### PWA Manifest (`client/public/manifest.json`)
- App name: Human Upgrade OS
- Theme color: #DC2626 (red)
- Background: #141414 (charcoal)
- Display: standalone (fullscreen app experience)

### App Icons (All Sizes)
Located in `client/public/icons/`:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

### Splash Screens
Located in `client/public/splash/`:
- All major iOS device sizes covered

### Capacitor Configuration (`capacitor.config.ts`)
- App ID: `com.humanupgrade.os`
- Web directory: `dist/public`
- iOS and Android schemes configured

---

## Build Steps

### Step 1: Build the Web App
```bash
npm run build
```

### Step 2: Initialize Native Projects (First Time Only)
```bash
# Add iOS platform
npx cap add ios

# Add Android platform
npx cap add android
```

### Step 3: Sync Web Assets to Native Projects
```bash
npx cap sync
```

### Step 4: Open in Native IDEs

**For iOS (requires Mac with Xcode):**
```bash
npx cap open ios
```

**For Android:**
```bash
npx cap open android
```

---

## iOS App Store Submission

### In Xcode:
1. Select your development team in Signing & Capabilities
2. Set the Bundle Identifier to `com.humanupgrade.os`
3. Configure app icons in Assets.xcassets (auto-populated from your icons)
4. Set version number (1.0.0) and build number (1)
5. Archive the app: Product → Archive
6. Upload to App Store Connect

### App Store Connect Requirements:
- App name: Human Upgrade OS
- Subtitle: Health Optimization Platform
- Category: Health & Fitness
- Privacy Policy URL (required)
- Screenshots for all device sizes:
  - iPhone 6.5" (1242 × 2688)
  - iPhone 5.5" (1242 × 2208)
  - iPad Pro 12.9" (2048 × 2732)
- App description (up to 4000 characters)
- Keywords (up to 100 characters)
- Age Rating: 17+ (Medical/Health Information)

### iOS Review Guidelines to Consider:
- **In-App Purchases**: Apple requires 30% commission on digital subscriptions. Consider:
  - Option A: Implement Apple In-App Purchases
  - Option B: Don't include subscription in iOS app, direct users to website
  - Option C: Use "reader app" exception (unlikely to apply)
- Health data claims must be substantiated
- User data privacy disclosures required

---

## Google Play Store Submission

### In Android Studio:
1. Generate signed APK or App Bundle
2. Configure signing key (keep this secure!)
3. Set version code and version name
4. Build release: Build → Generate Signed Bundle/APK

### Play Console Requirements:
- App name: Human Upgrade OS
- Short description (80 characters max)
- Full description (4000 characters max)
- Screenshots:
  - Phone (16:9 or 9:16)
  - 7" tablet
  - 10" tablet
- Feature graphic (1024 × 500)
- App icon (512 × 512) ✓ Already created
- Category: Health & Fitness
- Content rating questionnaire
- Privacy Policy URL (required)
- Data safety form (what data you collect)

### Google Play Policies to Consider:
- Health app disclosure requirements
- Subscription billing must use Google Play Billing for in-app purchases
- Data collection transparency

---

## Required Legal Documents

### Privacy Policy (Required by Both Stores)
Create a privacy policy page at `/privacy` that covers:
- What data you collect (email, health documents, biomarker data)
- How data is processed (OCR, AI analysis)
- Third-party services (OpenAI, Stripe)
- Data retention and deletion policies
- User rights (GDPR, CCPA if applicable)

### Terms of Service
Create terms at `/terms` covering:
- Service description
- Medical disclaimer (not medical advice)
- Subscription terms
- Liability limitations

---

## App Store Assets Checklist

### iOS (App Store)
- [ ] 1024x1024 App Icon (no transparency, no rounded corners)
- [ ] Screenshots for iPhone 6.5", 5.5"
- [ ] Screenshots for iPad 12.9" (if universal app)
- [ ] App Preview videos (optional, 15-30 seconds)
- [ ] Privacy Policy URL
- [ ] Support URL
- [ ] Marketing URL (optional)

### Android (Google Play)
- [ ] 512x512 App Icon ✓
- [ ] Feature Graphic 1024x500
- [ ] Phone screenshots (2-8 images)
- [ ] Tablet screenshots (if supporting tablets)
- [ ] Privacy Policy URL
- [ ] Short description
- [ ] Full description

---

## Testing Before Submission

### TestFlight (iOS)
1. Upload build to App Store Connect
2. Add internal testers
3. Distribute via TestFlight

### Google Play Internal Testing
1. Upload signed APK/Bundle
2. Create internal testing track
3. Add tester email addresses

---

## Estimated Timeline

1. **Developer Account Setup**: 1-2 days
2. **Native App Build**: 1 day
3. **Asset Creation**: 1-2 days
4. **iOS Review**: 1-7 days (usually 24-48 hours)
5. **Android Review**: 1-3 days

---

## Important Notes

### Subscription Handling
Your current Stripe integration works for web. For native apps:
- **iOS**: Apple In-App Purchase required for digital goods/services
- **Android**: Google Play Billing required for in-app purchases

Consider launching with:
1. Free trial in app
2. Subscription purchase via web browser redirect
3. Stripe Customer Portal for management

### Health App Considerations
- Both stores have additional review for health-related apps
- Avoid medical claims without evidence
- Include disclaimers that this is not medical advice
- May require "Medical" category approval

---

## Commands Reference

```bash
# Build web app
npm run build

# Sync to native platforms
npx cap sync

# Open iOS project
npx cap open ios

# Open Android project
npx cap open android

# Run on iOS simulator
npx cap run ios

# Run on Android emulator
npx cap run android
```

---

## Support

For Capacitor-specific issues: https://capacitorjs.com/docs
For iOS development: https://developer.apple.com/documentation/
For Android development: https://developer.android.com/docs
