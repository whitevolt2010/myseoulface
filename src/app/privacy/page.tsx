import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="gradient-hero min-h-dvh">
      <header className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto w-full">
        <Link href="/" className="text-xl font-bold text-pink-dk">My<span className="text-coral">SeoulFace</span></Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 pb-20">
        <h1 className="text-3xl font-bold text-fg mb-8">Privacy Policy</h1>

        <div className="glass p-8 space-y-6 text-sm text-fg leading-relaxed">
          <section>
            <h2 className="font-bold text-lg mb-2">Your Photo</h2>
            <p>
              Your selfie is sent directly to our AI for analysis and is <strong>never stored on our servers</strong>.
              The photo is processed in real-time and immediately discarded after analysis is complete.
              We do not save, share, or sell your photos.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-2">Email Address</h2>
            <p>
              If you choose to provide your email, it is stored securely and used only to send you
              skincare tips and product updates. You can unsubscribe at any time.
              We never share your email with third parties.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-2">Analysis Data</h2>
            <p>
              Your skin analysis results (skin type, score, concerns) are stored anonymously
              to improve our AI accuracy. This data cannot be linked back to you personally.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-2">Affiliate Links</h2>
            <p>
              Product recommendations may contain affiliate links (Amazon Associates).
              When you purchase through these links, we may earn a small commission at no extra cost to you.
              This helps us keep the service free.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-2">Cookies & Analytics</h2>
            <p>
              We use Google Analytics to understand how visitors use our site.
              This helps us improve the experience. No personally identifiable information is collected through analytics.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-2">Contact</h2>
            <p>
              For any privacy concerns, please contact us at{" "}
              <a href="mailto:whitevolt2010@gmail.com" className="text-pink-dk underline">whitevolt2010@gmail.com</a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
