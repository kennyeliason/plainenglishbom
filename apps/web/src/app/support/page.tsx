import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support · Plain English Book of Mormon",
  description:
    "Get help with the Plain English Book of Mormon app. Contact us with questions, feedback, or issues.",
};

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#0d1520] text-[#c9d1d9]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="text-[#58a6ff] hover:underline mb-8 inline-block"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-white mb-8">Support</h1>

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              Contact Us
            </h2>
            <p className="mb-4">
              Have questions, feedback, or need help with the Plain English Book
              of Mormon app? We&apos;d love to hear from you.
            </p>
            <p>
              Email:{" "}
              <a
                href="mailto:support@plainenglishbom.com"
                className="text-[#58a6ff] hover:underline"
              >
                support@plainenglishbom.com
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-white">
                  What is the Plain English Book of Mormon?
                </h3>
                <p className="text-[#8b949e]">
                  It&apos;s a modern translation of the Book of Mormon that
                  converts archaic King James-style language into clear,
                  easy-to-understand English while preserving the original
                  meaning.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-white">Is the app free?</h3>
                <p className="text-[#8b949e]">
                  Yes, the app is completely free with no ads or subscriptions.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-white">
                  Does the app work offline?
                </h3>
                <p className="text-[#8b949e]">
                  Yes, once downloaded, you can read the entire Book of Mormon
                  without an internet connection.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-white">
                  How accurate is the translation?
                </h3>
                <p className="text-[#8b949e]">
                  We use a combination of rule-based transformations and AI to
                  modernize the language while carefully preserving doctrinal
                  accuracy and meaning.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">
              Report an Issue
            </h2>
            <p>
              Found a bug or translation error? Please email us at{" "}
              <a
                href="mailto:support@plainenglishbom.com"
                className="text-[#58a6ff] hover:underline"
              >
                support@plainenglishbom.com
              </a>{" "}
              with details about the issue, including the book and chapter where
              you found it.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
