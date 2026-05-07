import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Privacy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-8"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <h1 className="text-4xl font-bold mb-8" data-testid="text-title">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none space-y-8">
          <p className="text-muted-foreground">
            Last updated: December 2025
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Human Upgrade OS ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our health optimization platform and mobile applications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium mb-3">2.1 Personal Information</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Email address (for account creation and communication)</li>
              <li>Password (encrypted and securely stored)</li>
              <li>Payment information (processed securely through Stripe)</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6">2.2 Health Information</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Uploaded documents (blood work PDFs, lab results, health screenings)</li>
              <li>Extracted biomarker data from your documents</li>
              <li>Generated health protocols and recommendations</li>
              <li>Performance Age calculations</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6">2.3 Usage Information</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Device information and browser type</li>
              <li>IP address and approximate location</li>
              <li>App usage patterns and feature interactions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>To provide and maintain our health optimization services</li>
              <li>To analyze your biomarkers and generate personalized protocols</li>
              <li>To calculate your Performance Age and health metrics</li>
              <li>To process payments and manage your subscription</li>
              <li>To communicate with you about your account and services</li>
              <li>To improve our platform and develop new features</li>
              <li>To ensure security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. How We Process Your Documents</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you upload health documents, we use advanced text extraction and optical character recognition (OCR) technology to read the content. This extracted text is then analyzed to identify and extract biomarker values. Your documents are processed securely and are not shared with third parties except as described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the following third-party services to operate our platform:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>OpenAI:</strong> For biomarker analysis and protocol generation. Your extracted biomarker data (not original documents) may be processed by OpenAI's systems.</li>
              <li><strong>Stripe:</strong> For secure payment processing. We do not store your credit card information.</li>
              <li><strong>Cloud Hosting:</strong> Your data is stored on secure cloud servers with encryption.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal and health information. This includes encryption of data in transit and at rest, secure password hashing, and regular security audits. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information and health data for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time by contacting us. Upon account deletion, we will remove your data within 30 days, except where we are required to retain it for legal purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent for data processing</li>
              <li>Object to certain processing activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="text-muted-foreground mt-4">
              Email: info@apexeraapp.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
