import { useState } from 'react';
import { ArrowLeft, FileText, Shield, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function LegalPages() {
  const [currentPage, setCurrentPage] = useState('home');

  const HomePage = () => (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <img src="/ms.png" alt="Mechanic Setu" className="h-10 w-10 object-contain" />
            <span className="text-xl font-semibold">Mechanic Setu</span>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-normal mb-12">Legal Information</h1>
        
        <div className="grid gap-4">
          <Card 
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setCurrentPage('terms')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Terms and Conditions</CardTitle>
                    <CardDescription className="mt-1">
                      Rules and guidelines for using Mechanic Setu
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setCurrentPage('privacy')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Shield className="text-green-600 dark:text-green-400 h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Privacy Policy</CardTitle>
                    <CardDescription className="mt-1">
                      How we collect, use, and protect your data
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>
        </div>
      </main>

      <footer className="border-t mt-24">
        <div className="container max-w-5xl mx-auto px-6 py-8">
          <p className="text-sm text-muted-foreground">© 2025 Mechanic Setu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );

  const TermsPage = () => (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container max-w-4xl mx-auto px-6 py-6">
          <Button
            variant="ghost"
            onClick={() => setCurrentPage('home')}
            className="mb-4 -ml-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <img src="/ms.png" alt="Mechanic Setu" className="h-10 w-10 object-contain" />
            <span className="text-xl font-semibold">Mechanic Setu</span>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-6 py-12 pb-24">
        <h1 className="text-4xl md:text-5xl font-normal mb-3">Terms and Conditions</h1>
        <p className="text-muted-foreground mb-12">Effective date: October 5, 2025</p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-foreground/90 leading-relaxed mb-8">
            Welcome to Mechanic Setu. By accessing or using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.
          </p>

          <Separator className="my-8" />

          <h2 className="text-2xl font-normal mt-12 mb-4">1. Definitions</h2>
          <p className="text-foreground/90 leading-relaxed mb-4">
            <strong className="font-semibold">Platform</strong> refers to Mechanic Setu, including its mobile applications, website, and backend systems.
          </p>
          <p className="text-foreground/90 leading-relaxed mb-4">
            <strong className="font-semibold">User</strong> refers to any individual requesting roadside assistance through our platform.
          </p>
          <p className="text-foreground/90 leading-relaxed mb-4">
            <strong className="font-semibold">Mechanic</strong> refers to verified service providers registered on the platform who offer roadside assistance.
          </p>
          <p className="text-foreground/90 leading-relaxed mb-4">
            <strong className="font-semibold">Admin</strong> refers to platform operators responsible for managing users, mechanics, and data.
          </p>

          <h2 className="text-2xl font-normal mt-12 mb-4">2. Eligibility</h2>
          <p className="text-foreground/90 leading-relaxed">
            Users must be 18 years or older to use this platform. If you are under 18, you must have guardian consent. Mechanics must complete our verification process and receive admin approval before accepting service requests.
          </p>

          <h2 className="text-2xl font-normal mt-12 mb-4">3. Service Limitations</h2>
          <p className="text-foreground/90 leading-relaxed mb-4">
            Mechanic Setu connects users with mechanics but does not guarantee service outcomes. We are not liable for:
          </p>
          <ul className="text-foreground/90 leading-relaxed mb-4 ml-6 space-y-2 list-disc">
            <li>Delays caused by traffic, weather conditions, or mechanic availability</li>
            <li>Quality or completeness of repairs performed</li>
            <li>Any damage that may occur during service provision</li>
          </ul>
          <p className="text-foreground/90 leading-relaxed">
            All services are provided by independent mechanics.
          </p>

          <h2 className="text-2xl font-normal mt-12 mb-4">4. Booking and Cancellation</h2>
          <p className="text-foreground/90 leading-relaxed">
            Users may cancel service requests at any time before a mechanic is assigned. Once assigned, cancellation may affect the mechanic's availability. Repeated cancellations or no-shows may result in account restrictions or suspension to ensure fair service for all users.
          </p>

          <h2 className="text-2xl font-normal mt-12 mb-4">5. Payments</h2>
          <p className="text-foreground/90 leading-relaxed">
            Currently, all payments are made directly to the mechanic via cash or UPI. Mechanic Setu does not process payments or mediate payment disputes at this stage. Users and mechanics are responsible for agreeing on service costs before work begins.
          </p>

          <h2 className="text-2xl font-normal mt-12 mb-4">6. Ratings and Reviews</h2>
          <p className="text-foreground/90 leading-relaxed">
            We encourage honest feedback to maintain service quality. All reviews must be respectful and truthful. Admin reserves the right to remove reviews that are defamatory, abusive, fraudulent, or violate our community guidelines.
          </p>

          <h2 className="text-2xl font-normal mt-12 mb-4">7. Intellectual Property</h2>
          <p className="text-foreground/90 leading-relaxed">
            All content, branding, logos, design elements, and source code related to Mechanic Setu are owned by the platform. Unauthorized reproduction, distribution, or commercial use is strictly prohibited and may result in legal action.
          </p>

          <h2 className="text-2xl font-normal mt-12 mb-4">8. Account Termination</h2>
          <p className="text-foreground/90 leading-relaxed mb-4">
            We reserve the right to suspend or terminate accounts that violate these terms. Grounds for termination include but are not limited to:
          </p>
          <ul className="text-foreground/90 leading-relaxed mb-4 ml-6 space-y-2 list-disc">
            <li>Fraudulent activity</li>
            <li>Misuse of the platform</li>
            <li>Safety violations</li>
            <li>Harassment</li>
            <li>Providing false information during registration</li>
          </ul>

          <h2 className="text-2xl font-normal mt-12 mb-4">9. Terms Updates</h2>
          <p className="text-foreground/90 leading-relaxed">
            As Mechanic Setu evolves with new features such as insurance integration, subscription models, or in-app payments, these terms may be updated. We will notify users of significant changes. Continued use of the platform after updates constitutes acceptance of the revised terms.
          </p>

          <Card className="mt-12 bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Questions or Concerns?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90">
                If you have any questions about these Terms and Conditions, please contact us through the app or email us at support@mechanicsetu.com
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );

  const PrivacyPage = () => (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container max-w-4xl mx-auto px-6 py-6">
          <Button
            variant="ghost"
            onClick={() => setCurrentPage('home')}
            className="mb-4 -ml-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <img src="/ms.png" alt="Mechanic Setu" className="h-10 w-10 object-contain" />
            <span className="text-xl font-semibold">Mechanic Setu</span>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-6 py-12 pb-24">
        <h1 className="text-4xl md:text-5xl font-normal mb-3">Privacy Policy</h1>
        <p className="text-muted-foreground mb-12">Effective date: October 5, 2025</p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-foreground/90 leading-relaxed mb-8">
            At Mechanic Setu, we take your privacy seriously. This policy explains how we collect, use, protect, and share your personal information when you use our platform.
          </p>

          <Separator className="my-8" />

          <h2 className="text-2xl font-normal mt-12 mb-4">1. Information We Collect</h2>
          
          <h3 className="text-xl font-medium mt-6 mb-3">User Information</h3>
          <p className="text-foreground/90 leading-relaxed">
            We collect your name, phone number, location data, service history, and preferences to provide you with efficient roadside assistance.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">Mechanic Information</h3>
          <p className="text-foreground/90 leading-relaxed">
            For mechanics, we collect name, phone number, shop details, service area, verification documents, and ratings to maintain service quality.
          </p>

          <h3 className="text-xl font-medium mt-6 mb-3">Device Information</h3>
          <p className="text-foreground/90 leading-relaxed">
            We automatically collect IP address, browser type, device model, operating system, and GPS coordinates during active sessions.
          </p>

          <h2 className="text-2xl font-normal mt-12 mb-4">2. Why We Collect Your Data</h2>
          <p className="text-foreground/90 leading-relaxed mb-4">
            We collect information to:
          </p>
          <ul className="text-foreground/90 leading-relaxed mb-4 ml-6 space-y-2 list-disc">
            <li>Match users with nearby mechanics efficiently</li>
            <li>Improve service quality and response times</li>
            <li>Maintain platform safety and accountability</li>
            <li>Analyze usage patterns for better features</li>
            <li>Ensure reliable communication between users and mechanics</li>
          </ul>

          <h2 className="text-2xl font-normal mt-12 mb-4">3. How We Use Your Information</h2>
          <p className="text-foreground/90 leading-relaxed">
            Location data is accessed only during active service requests and is not tracked continuously. Contact information is shared exclusively between the assigned user and mechanic for that specific service. Admin uses aggregated, anonymized data for operational analytics and platform improvements. We never sell your data to third parties.
          </p>

          <h2 className="text-2xl font-normal mt-12 mb-4">4. Data Retention</h2>
          <p className="text-foreground/90 leading-relaxed">
            Service history and related data are retained for 6 months to provide operational insights and improve our services. After this period, data is automatically anonymized. Users may request complete deletion of their account and all associated personal data at any time through the app settings or by contacting support.
          </p>

          <h2 className="text-2xl font-normal mt-12 mb-4">5. Security Measures</h2>
          <p className="text-foreground/90 leading-relaxed mb-4">
            We implement industry-standard security practices including:
          </p>
          <ul className="text-foreground/90 leading-relaxed mb-4 ml-6 space-y-2 list-disc">
            <li>Data encryption in transit and at rest</li>
            <li>Secure access controls and authentication</li>
            <li>Regular security audits</li>
            <li>Protected backend systems</li>
          </ul>
          <p className="text-foreground/90 leading-relaxed">
            No sensitive financial data is currently stored on our platform. However, no system is 100% secure, and we encourage users to protect their account credentials.
          </p>

          <h2 className="text-2xl font-normal mt-12 mb-4">6. Third-Party Services</h2>
          <p className="text-foreground/90 leading-relaxed mb-4">
            We use trusted third-party services:
          </p>
          <ul className="text-foreground/90 leading-relaxed mb-4 ml-6 space-y-2 list-disc">
            <li>MapBox for location and mapping services</li>
            <li>Razorpay (planned) for secure payment processing</li>
            <li>Analytics tools for service improvement</li>
          </ul>
          <p className="text-foreground/90 leading-relaxed">
            These partners are bound by strict data protection agreements. We do not sell data to advertisers or external vendors.
          </p>

          <h2 className="text-2xl font-normal mt-12 mb-4">7. Your Rights</h2>
          <p className="text-foreground/90 leading-relaxed mb-4">
            You have the right to:
          </p>
          <ul className="text-foreground/90 leading-relaxed mb-4 ml-6 space-y-2 list-disc">
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your account and data</li>
            <li>Withdraw consent for data processing</li>
            <li>Lodge complaints through the app or via email</li>
            <li>Receive a copy of your data in a portable format</li>
          </ul>

          <h2 className="text-2xl font-normal mt-12 mb-4">8. Children's Privacy</h2>
          <p className="text-foreground/90 leading-relaxed">
            Mechanic Setu is not intended for users under 13 years of age. We do not knowingly collect personal information from children. If we discover that a child under 13 has provided us with personal data, we will promptly delete it.
          </p>

          <h2 className="text-2xl font-normal mt-12 mb-4">9. Policy Updates</h2>
          <p className="text-foreground/90 leading-relaxed">
            We may update this privacy policy as we introduce new features or comply with regulatory changes. Users will be notified of significant changes via in-app notifications, email, or website announcements. The updated policy will include the effective date, and continued use constitutes acceptance.
          </p>

          <Card className="mt-12 bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Your Privacy Matters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90">
                We are committed to protecting your personal information. If you have privacy concerns or wish to exercise your rights, please contact us at privacy@mechanicsetu.com
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );

  if (currentPage === 'terms') return <TermsPage />;
  if (currentPage === 'privacy') return <PrivacyPage />;
  return <HomePage />;
}