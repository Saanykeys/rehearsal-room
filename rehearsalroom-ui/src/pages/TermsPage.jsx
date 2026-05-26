import logo from "../assets/rehearsalroom-logo.png";

const EFFECTIVE_DATE = "May 26, 2026";
const CONTACT_EMAIL = "rahsaanhall.swe@gmail.com";

export default function TermsPage() {
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
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">Terms of Service</h1>
          <p className="mt-3 text-slate-400">
            Effective Date: <span className="text-slate-300 font-medium">{EFFECTIVE_DATE}</span>
          </p>
          <p className="mt-2 text-slate-400">
            Please read these Terms of Service ("Terms") carefully before using Rehearsal Room (the
            "Service"), operated by Rehearsal Room ("we," "us," or "our"). By accessing or using
            the Service, you agree to be bound by these Terms. If you do not agree, do not use the
            Service.
          </p>
        </div>

        <div className="space-y-10 text-slate-300 leading-relaxed">

          {/* 1 */}
          <Section title="1. Acceptance of Terms">
            <p>
              By creating an account or using any part of Rehearsal Room, you confirm that you are
              at least 13 years of age, have read and understood these Terms, and agree to be bound
              by them. If you are using the Service on behalf of an organization (such as a church
              or ministry), you represent that you have the authority to bind that organization to
              these Terms.
            </p>
          </Section>

          {/* 2 */}
          <Section title="2. Description of Service">
            <p>
              Rehearsal Room is a worship team management platform that allows music directors and
              team members to manage songs, rehearsal events, setlists, attendance, announcements,
              and team members within a private organizational workspace.
            </p>
            <p className="mt-3">
              We reserve the right to modify, suspend, or discontinue any part of the Service at
              any time, with or without notice. We will not be liable to you or any third party for
              any modification, suspension, or discontinuation of the Service.
            </p>
          </Section>

          {/* 3 */}
          <Section title="3. Accounts and Registration">
            <SubSection title="Account creation">
              <p className="text-slate-400 mt-2">
                To use most features of Rehearsal Room, you must register for an account. You agree
                to provide accurate, current, and complete information during registration and to
                keep your account information updated.
              </p>
            </SubSection>
            <SubSection title="Account security">
              <p className="text-slate-400 mt-2">
                You are responsible for maintaining the confidentiality of your password and for all
                activity that occurs under your account. You agree to notify us immediately at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-amber-400 hover:underline">
                  {CONTACT_EMAIL}
                </a>{" "}
                if you suspect any unauthorized use of your account.
              </p>
            </SubSection>
            <SubSection title="One account per person">
              <p className="text-slate-400 mt-2">
                Each user may maintain only one account. You may not share your account credentials
                with others.
              </p>
            </SubSection>
          </Section>

          {/* 4 */}
          <Section title="4. Organizations and Invite Codes">
            <p>
              Music Directors who register with a valid director code create a private organizational
              workspace. Each organization receives a unique invite code. Directors are responsible
              for:
            </p>
            <ul className="mt-3 space-y-1 list-disc list-inside text-slate-400">
              <li>Managing who receives their invite code.</li>
              <li>The conduct of all members within their organization.</li>
              <li>Ensuring all content added to their workspace complies with these Terms.</li>
            </ul>
            <p className="mt-4">
              We reserve the right to disable any organization or invite code that we determine, in
              our sole discretion, is being used in violation of these Terms.
            </p>
          </Section>

          {/* 5 */}
          <Section title="5. Acceptable Use">
            <p>You agree to use Rehearsal Room only for lawful purposes and in a manner that does not infringe the rights of others. You agree not to:</p>
            <ul className="mt-3 space-y-1 list-disc list-inside text-slate-400">
              <li>Use the Service for any illegal or unauthorized purpose.</li>
              <li>Upload or transmit any content that is hateful, abusive, defamatory, obscene, or otherwise objectionable.</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
              <li>Attempt to gain unauthorized access to any part of the Service or its related systems.</li>
              <li>Use the Service to send spam, unsolicited messages, or any form of commercial solicitation.</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service.</li>
              <li>Use automated tools (bots, scrapers, etc.) to access or collect data from the Service without our prior written consent.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service.</li>
            </ul>
          </Section>

          {/* 6 */}
          <Section title="6. Your Content">
            <p>
              You retain ownership of any content you submit, post, or create within Rehearsal Room,
              including songs, rehearsal notes, announcements, and other data ("Your Content").
            </p>
            <p className="mt-3">
              By submitting Your Content, you grant Rehearsal Room a limited, non-exclusive,
              royalty-free license to store, display, and transmit Your Content solely as necessary
              to provide the Service to you and your organization.
            </p>
            <p className="mt-3">
              You represent and warrant that You Content does not infringe any third-party
              intellectual property rights and that you have all necessary rights to grant the
              license above. You are solely responsible for Your Content.
            </p>
          </Section>

          {/* 7 */}
          <Section title="7. Intellectual Property">
            <p>
              The Rehearsal Room name, logo, design, software, and all related content (excluding
              Your Content) are owned by Rehearsal Room and protected by applicable intellectual
              property laws. You may not copy, reproduce, distribute, or create derivative works
              from any part of the Service without our express written permission.
            </p>
          </Section>

          {/* 8 */}
          <Section title="8. Third-Party Services">
            <p>
              Rehearsal Room integrates with third-party services including Vercel (hosting), Render
              (backend infrastructure), and Resend (email delivery). Your use of the Service is also
              subject to the terms and policies of these providers. We are not responsible for the
              actions, content, or privacy practices of any third-party service.
            </p>
            <p className="mt-3">
              Song YouTube links and other external links within the Service are provided for
              convenience. We do not endorse and are not responsible for any third-party content
              linked from within the Service.
            </p>
          </Section>

          {/* 9 */}
          <Section title="9. Privacy">
            <p>
              Your use of the Service is also governed by our{" "}
              <a href="/privacy" className="text-amber-400 hover:underline">
                Privacy Policy
              </a>
              , which is incorporated into these Terms by reference. Please review it to understand
              our data practices.
            </p>
          </Section>

          {/* 10 */}
          <Section title="10. Disclaimers">
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
              EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="mt-3">
              We do not warrant that the Service will be uninterrupted, error-free, or free of
              viruses or other harmful components. We do not warrant that any data you store in the
              Service will not be lost.
            </p>
          </Section>

          {/* 11 */}
          <Section title="11. Limitation of Liability">
            <p>
              TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, REHEARSAL ROOM SHALL NOT BE LIABLE
              FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
              LOSS OF DATA, LOSS OF PROFITS, OR LOSS OF GOODWILL, ARISING OUT OF OR IN CONNECTION
              WITH YOUR USE OF OR INABILITY TO USE THE SERVICE, EVEN IF WE HAVE BEEN ADVISED OF THE
              POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p className="mt-3">
              IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU EXCEED THE GREATER OF (A) THE AMOUNT YOU
              PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100).
            </p>
          </Section>

          {/* 12 */}
          <Section title="12. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless Rehearsal Room and its affiliates,
              officers, agents, and employees from and against any claims, liabilities, damages,
              losses, and expenses (including reasonable legal fees) arising out of or in any way
              connected with your access to or use of the Service, your violation of these Terms, or
              your violation of any third-party rights.
            </p>
          </Section>

          {/* 13 */}
          <Section title="13. Termination">
            <p>
              We may suspend or terminate your account and access to the Service at any time, with
              or without cause, and with or without notice, including if we believe you have violated
              these Terms.
            </p>
            <p className="mt-3">
              You may terminate your account at any time by contacting us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-amber-400 hover:underline">
                {CONTACT_EMAIL}
              </a>
              . Upon termination, your right to use the Service will immediately cease.
            </p>
            <p className="mt-3">
              Sections 6, 7, 10, 11, 12, and 15 of these Terms survive any termination.
            </p>
          </Section>

          {/* 14 */}
          <Section title="14. Changes to These Terms">
            <p>
              We may update these Terms from time to time. When we do, we will update the effective
              date at the top of this page. Your continued use of the Service after any changes
              constitutes your acceptance of the new Terms. If you do not agree to the updated
              Terms, you must stop using the Service.
            </p>
          </Section>

          {/* 15 */}
          <Section title="15. Governing Law">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the
              United States, without regard to its conflict of law provisions. Any disputes arising
              under these Terms shall be resolved in the courts located in the United States, and
              you consent to personal jurisdiction in such courts.
            </p>
          </Section>

          {/* 16 */}
          <Section title="16. Contact Us">
            <p>
              If you have any questions about these Terms, please contact us at:
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
          <div className="mt-2 flex items-center justify-center gap-4">
            <a href="/privacy" className="text-amber-400 hover:underline">Privacy Policy</a>
            <span>·</span>
            <a href="/" className="text-amber-400 hover:underline">← Back to Home</a>
          </div>
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
