import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Terms() {
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

        <h1 className="text-4xl font-bold mb-8" data-testid="text-title">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none space-y-8">
          <p className="text-muted-foreground">
            Last updated: December 2025
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Human Upgrade OS ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Human Upgrade OS is a health optimization platform that analyzes biomarker data from uploaded documents and generates personalized health protocols. The Service includes biomarker extraction, Performance Age calculation, and recommendations for supplements, lifestyle modifications, and wellness strategies.
            </p>
          </section>

          <section className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-destructive">3. Medical Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>IMPORTANT: Human Upgrade OS is NOT a medical service and does NOT provide medical advice, diagnosis, or treatment.</strong>
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>The information provided by our Service is for informational and educational purposes only.</li>
              <li>Our protocols and recommendations are NOT substitutes for professional medical advice, diagnosis, or treatment.</li>
              <li>Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</li>
              <li>Never disregard professional medical advice or delay in seeking it because of something you have read on Human Upgrade OS.</li>
              <li>If you think you may have a medical emergency, call your doctor or emergency services immediately.</li>
              <li>We do not recommend or endorse any specific tests, physicians, products, procedures, opinions, or other information that may be mentioned on our Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Maintaining the confidentiality of your account and password</li>
              <li>Restricting access to your computer or device</li>
              <li>All activities that occur under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Subscription and Payment</h2>
            
            <h3 className="text-xl font-medium mb-3">5.1 Subscription Plans</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We offer the following subscription plans:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Basic Plan:</strong> $39/month - Limited features, 1 document upload per month</li>
              <li><strong>Premium Monthly:</strong> $49/month - Full access, unlimited uploads</li>
              <li><strong>Premium Annual:</strong> $359/year - Full access, unlimited uploads, best value</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6">5.2 Free Trial</h3>
            <p className="text-muted-foreground leading-relaxed">
              New users receive a 7-day free trial with limited access to premium features. After the trial period, you must subscribe to continue using premium features.
            </p>

            <h3 className="text-xl font-medium mb-3 mt-6">5.3 Billing</h3>
            <p className="text-muted-foreground leading-relaxed">
              Subscriptions are billed in advance on a recurring basis (monthly or annually, depending on your plan). You authorize us to charge your payment method on file for all applicable fees.
            </p>

            <h3 className="text-xl font-medium mb-3 mt-6">5.4 Cancellation</h3>
            <p className="text-muted-foreground leading-relaxed">
              You may cancel your subscription at any time through your account settings or by contacting us. Cancellation will take effect at the end of your current billing period. No refunds will be issued for partial periods.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Upload documents that do not belong to you without authorization</li>
              <li>Upload content that is illegal, harmful, or violates others' rights</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the Service for any commercial purpose without our consent</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Reverse engineer or attempt to extract source code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Human Upgrade OS and its licensors. The Service is protected by copyright, trademark, and other laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. User Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of any documents and data you upload to the Service. By uploading content, you grant us a limited license to process, analyze, and store your content solely for the purpose of providing the Service to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, HUMAN UPGRADE OS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>Your use or inability to use the Service</li>
              <li>Any unauthorized access to or use of our servers</li>
              <li>Any errors or omissions in any content</li>
              <li>Any health decisions made based on information from our Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT ANY INFORMATION PROVIDED WILL BE ACCURATE OR RELIABLE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to defend, indemnify, and hold harmless Human Upgrade OS and its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us at:
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
