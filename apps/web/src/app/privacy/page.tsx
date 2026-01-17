import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy · Plain English Book of Mormon",
  description:
    "Privacy policy for the Plain English Book of Mormon app and website.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0d1520] text-[#c9d1d9]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="text-[#58a6ff] hover:underline mb-8 inline-block"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-[#8b949e] mb-8">Last updated: January 16, 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Overview</h2>
            <p>
              Plain English Book of Mormon (&quot;we&quot;, &quot;our&quot;, or
              &quot;us&quot;) is committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, and safeguard your
              information when you use our mobile application and website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Information We Collect
            </h2>
            <p className="mb-4">
              <strong className="text-white">
                We collect minimal information:
              </strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#8b949e]">
              <li>
                <strong className="text-[#c9d1d9]">Analytics data:</strong> We
                use Google Analytics to understand how users interact with our
                app and website. This includes anonymous usage statistics such
                as pages visited and time spent reading.
              </li>
              <li>
                <strong className="text-[#c9d1d9]">Device information:</strong>{" "}
                Basic device information may be collected for crash reporting
                and app performance optimization.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Information We Do NOT Collect
            </h2>
            <ul className="list-disc list-inside space-y-2 text-[#8b949e]">
              <li>Personal identification information (name, email, etc.)</li>
              <li>Location data</li>
              <li>Contacts or address book</li>
              <li>Photos or media</li>
              <li>Financial information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              How We Use Information
            </h2>
            <p>The limited information we collect is used solely to:</p>
            <ul className="list-disc list-inside space-y-2 text-[#8b949e] mt-2">
              <li>Improve the app and website experience</li>
              <li>Fix bugs and technical issues</li>
              <li>Understand which features are most useful</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Data Storage
            </h2>
            <p>
              All scripture text and your reading preferences are stored locally
              on your device. We do not store your personal data on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Third-Party Services
            </h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc list-inside space-y-2 text-[#8b949e] mt-2">
              <li>
                <strong className="text-[#c9d1d9]">Google Analytics:</strong>{" "}
                For anonymous usage analytics
              </li>
              <li>
                <strong className="text-[#c9d1d9]">Expo/EAS:</strong> For app
                distribution and updates
              </li>
            </ul>
            <p className="mt-2">
              These services have their own privacy policies governing their use
              of data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Children&apos;s Privacy
            </h2>
            <p>
              Our app is suitable for all ages. We do not knowingly collect
              personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy, please contact us
              at:{" "}
              <a
                href="mailto:support@plainenglishbom.com"
                className="text-[#58a6ff] hover:underline"
              >
                support@plainenglishbom.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
