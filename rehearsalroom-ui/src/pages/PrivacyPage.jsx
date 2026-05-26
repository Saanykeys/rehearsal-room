import logo from "../assets/rehearsalroom-logo.png";

const EFFECTIVE_DATE = "May 26, 2026";
const CONTACT_EMAIL = "saanykeys@gmail.com";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <a href="/" className="flex items-center gap-2 sm:gap-3">
            <img src={logo} alt="Rehearsal Room" className="h-8 w-8 rounded-xl object-cover" />
            <span className="text-sm font-black uppercase tracking-[0.3em] text-amber-300">
              Rehearsal Room
            </span>
          </a>
          <a
            href="/"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/15"
          >
            ← Back to Home
          </a>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Header */}
        <div className="mb-10">
          <span className="inline-block rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-amber-300">
            Legal
          </span>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">Privacy Policy</h1>
          <p className="mt-3 text-slate-400">
            Effective Date: <span className="text-slate-300 font-medium">{EFFECTIVE_DATE}</span>
          </p>
          <p className="mt-2 text-slate-400">
            This Privacy Policy describes how Rehearsal Room ("we," "us," or "our") collects, uses,
            and protects your personal information when you use our website and services located at{" "}
            <a href="https://rehearsal-room.vercel.app" className="text-amber-400 hover:underline">
              rehearsal-room.vercel.app
            </a>{" "}
            (the "Service").
          </p>
        </div>

        <div className="space-y-10 text-slate-300 leading-relaxed">

          {/* 1 */}
          <Section title="1. Information We Collect">
            <p>We collect the following categories of information when you use our Service:</p>
            <SubSection title="Information you provide directly">
              <ul className="mt-2 space-y-1 list-disc list-inside text-slate-400">
                <li><strong className="text-slate-300">Account information:</strong> Full name, email address, and password (stored as a one-way hash — we never store your plain-text password).</li>
                <li><strong className="text-slate-300">Organization information:</strong> Your church or organization name when you register as a Music Director.</li>
                <li><strong className="text-slate-300">Waitlist information:</strong> Name, email, church name, and role when you sign up for the waitlist.</li>
                <li><strong className="text-slate-300">Content you create:</strong> Songs, rehearsal events, setlists, attendance records, and announcements you add inside the app.</li>
              </ul>
            </SubSection>
            <SubSection title="Information collected automatically">
              <ul className="mt-2 space-y-1 list-disc list-inside text-slate-400">
                <li><strong className="text-slate-300">Usage data:</strong> Page views, navigation patterns, and feature interactions collected through Vercel Analytics (aggregated and anonymized).</li>
                <li><strong className="text-slate-300">Performance data:</strong> Page load times and web vitals collected through Vercel Speed Insights (aggregated and anonymized).</li>
                <li><strong className="text-slate-300">Browser and device information:</strong> General browser type and operating system, collected automatically by our hosting infrastructure.</li>
              </ul>
            </SubSection>
          </Section>

          {/* 2 */}
          <Section title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="mt-3 space-y-1 list-disc list-inside text-slate-400">
              <li>Create and manage your account and organization workspace.</li>
              <li>Provide, operate, and improve the Service.</li>
              <li>Send transactional emails (e.g., announcements your Music Director broadcasts to your team).</li>
              <li>Send web push notifications if you have opted in.</li>
              <li>Respond to your support requests or questions.</li>
              <li>Monitor and analyze usage trends to improve performance and user experience.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p className="mt-4">
              We do <strong className="text-white">not</strong> sell, rent, or trade your personal information to any third party for marketing purposes.
            </p>
          </Section>

          {/* 3 */}
          <Section title="3. How We Share Your Information">
            <p>
              We do not sell your data. We share your information only in the following limited circumstances:
            </p>
            <SubSection title="Service providers">
              <p className="text-slate-400 mt-2">
                We use a small number of trusted third-party services to operate the platform:
              </p>
              <ul className="mt-2 space-y-2 list-disc list-inside text-slate-400">
                <li>
                  <strong className="text-slate-300">Vercel</strong> — hosts our frontend application and collects anonymized analytics and performance data. See{" "}
                  <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Vercel's Privacy Policy</a>.
                </li>
                <li>
                  <strong className="text-slate-300">Render</strong> — hosts our backend API and PostgreSQL database. See{" "}
                  <a href="https://render.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Render's Privacy Policy</a>.
                </li>
                <li>
                  <strong className="text-slate-300">Resend</strong> — used to send transactional emails on behalf of your organization's Music Director. See{" "}
                  <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Resend's Privacy Policy</a>.
                </li>
              </ul>
            </SubSection>
            <SubSection title="Legal requirements">
              <p className="text-slate-400 mt-2">
                We may disclose your information if required to do so by law or in the good-faith belief that such action is necessary to comply with a legal obligation, protect and defend our rights or property, or protect the personal safety of users or the public.
              </p>
            </SubSection>
          </Section>

          {/* 4 */}
          <Section title="4. Data Storage and Security">
            <p>
              Your data is stored in a PostgreSQL database hosted by Render, located in the United States. We use industry-standard security measures including:
            </p>
            <ul className="mt-3 space-y-1 list-disc list-inside text-slate-400">
              <li>Encrypted connections (HTTPS/TLS) for all data in transit.</li>
              <li>SSL-encrypted database connections.</li>
              <li>Bcrypt hashing for all stored passwords.</li>
              <li>JWT-based authentication with short-lived tokens.</li>
              <li>Organization-level data isolation — users can only access data within their own organization.</li>
            </ul>
            <p className="mt-4">
              While we take reasonable measures to protect your data, no method of transmission or storage over the internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </Section>

          {/* 5 */}
          <Section title="5. Data Retention">
            <p>
              We retain your account data for as long as your account is active or as needed to provide the Service. If you request deletion of your account, we will delete or anonymize your personal information within a reasonable time, except where we are required to retain it for legal purposes.
            </p>
            <p className="mt-3">
              Waitlist entries are retained until you request removal or the waitlist program ends.
            </p>
          </Section>

          {/* 6 */}
          <Section title="6. Your Rights and Choices">
            <p>You have the following rights regarding your personal information:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-slate-400">
              <li><strong className="text-slate-300">Access:</strong> You may request a copy of the personal information we hold about you.</li>
              <li><strong className="text-slate-300">Correction:</strong> You may update your account information at any time through the Settings tab in your dashboard.</li>
              <li><strong className="text-slate-300">Deletion:</strong> You may request deletion of your account and associated data by emailing us.</li>
              <li><strong className="text-slate-300">Opt-out of push notifications:</strong> You can revoke push notification permissions at any time through your browser settings.</li>
              <li><strong className="text-slate-300">Opt-out of emails:</strong> Transactional announcement emails are sent by your organization's Music Director. Contact your director or us to be removed.</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-amber-400 hover:underline">
                {CONTACT_EMAIL}
              </a>.
            </p>
          </Section>

          {/* 7 */}
          <Section title="7. Cookies and Tracking">
            <p>
              Rehearsal Room uses <strong className="text-white">localStorage</strong> (browser storage) to keep you logged in between sessions. We do not use third-party advertising cookies or tracking pixels.
            </p>
            <p className="mt-3">
              Vercel Analytics and Speed Insights use privacy-friendly, cookie-less tracking methods that do not identify individual users.
            </p>
          </Section>

          {/* 8 */}
          <Section title="8. Children's Privacy">
            <p>
              Rehearsal Room is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected information from a child under 13, please contact us and we will delete it promptly.
            </p>
          </Section>

          {/* 9 */}
          <Section title="9. Third-Party Links">
            <p>
              Our Service may contain links to third-party websites (such as YouTube video links for songs). We are not responsible for the privacy practices of those websites and encourage you to review their privacy policies.
            </p>
          </Section>

          {/* 10 */}
          <Section title="10. Changes to This Privacy Policy">
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the effective date at the top of this page. We encourage you to review this policy periodically. Continued use of the Service after changes are posted constitutes your acceptance of the updated policy.
            </p>
          </Section>

          {/* 11 */}
          <Section title="11. Contact Us">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your data, please contact us at:
            </p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="font-black text-white">Rehearsal Room</p>
              <p className="mt-1 text-slate-400">
                Email:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-amber-400 hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p className="text-slate-400">United States</p>
            </div>
          </Section>

        </div>

        {/* Footer note */}
        <div className="mt-16 border-t border-white/10 pt-8 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Rehearsal Room. All rights reserved.</p>
          <p className="mt-2">
            <a href="/" className="text-amber-400 hover:underline">← Back to Home</a>
          </p>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-xl font-black text-white mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SubSection({ title, children }) {
  return (
    <div className="mt-4">
      <h3 className="text-base font-bold text-slate-200">{title}</h3>
      {children}
    </div>
  );
}
