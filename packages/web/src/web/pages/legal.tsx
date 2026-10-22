import { useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Check } from "lucide-react";
import { useContact, useLaunchConfig } from "../queries/launch";
import { errorMessage } from "../queries/business";
const documents: Record<
  string,
  { title: string; intro: string; sections: [string, string][] }
> = {
  terms: {
    title: "Terms of service.",
    intro: "The ground rules for building with 1 Click Business.",
    sections: [
      [
        "Who we are",
        "1 Click Business is operated by AI Service Hub LLC, Minnesota, USA. These terms apply to the storefront, tools, dashboard and generated websites. By using the service or subscribing, you agree to these terms. You must be at least 18 and able to enter a binding contract.",
      ],
      [
        "Your account",
        "Keep your credentials secure and give accurate information. You are responsible for activity on your account. Do not impersonate others, misuse the service, or upload material you do not have permission to use. Contact us if you suspect unauthorized access.",
      ],
      [
        "Subscriptions and billing",
        "Plans renew monthly until cancelled. Prices are in US dollars; any applicable tax is shown before payment. Subscribing authorizes recurring payments. If a card is saved, adding a plan can charge it immediately. Single-tool plans do not cancel automatically when you buy the bundle: stop redundant plans from Account. Cancel in Manage billing; access continues through the paid period. Changes apply as explained during checkout.",
      ],
      [
        "AI generations and limits",
        "The bundle includes 500 generations per month and a single-tool plan includes 60. A successful tool run or advisor reply uses one generation. Failed tool generations do not consume a generation. Monthly allowances reset; unused generations do not roll over unless expressly stated. AI services may occasionally be unavailable.",
      ],
      [
        "AI is not professional advice",
        "Outputs can contain mistakes, outdated information or omissions. Review everything before using it. Business, funding, legal and financial information is not professional advice or a guarantee of results. Verify eligibility, deadlines and application requirements directly with the funding provider. Domain and trademark links are searches, not clearance checks. Consult qualified professionals where needed.",
      ],
      [
        "Your content and public sites",
        "You retain rights you have in your inputs and outputs. You grant us permission to process and store that content to provide the service. AI outputs may not be unique or copyrightable. You are responsible for rights clearance, accuracy, legal compliance and any personal data collected through your generated site. Generated website URLs are publicly accessible once generated; do not enter private information intended to remain confidential into public website content.",
      ],
      [
        "Acceptable use",
        "Do not use the service for unlawful, fraudulent, harmful or infringing activity. Do not attempt to bypass access controls, resell access without permission, attack systems or collect personal data without a lawful basis. We may suspend access for abuse or security reasons.",
      ],
      [
        "Availability and liability",
        "We provide the service as available, without guarantees of uninterrupted operation, funding, sales or business success. To the extent permitted by law, we disclaim implied warranties and liability for indirect or consequential losses. Our aggregate liability is limited to fees you paid us in the three months before the claim. Nothing excludes liability or consumer rights that cannot lawfully be excluded.",
      ],
      [
        "Changes and disputes",
        "We may update these terms and will communicate material changes using your account email or the website. Minnesota law governs, subject to applicable mandatory consumer protections. Contact support first so we can try to resolve a dispute.",
      ],
    ],
  },
  privacy: {
    title: "Privacy policy.",
    intro: "What we collect, why we collect it, and how to contact us.",
    sections: [
      [
        "Data we collect",
        "We collect account name, email, login/session information, intake answers, generated business content, customer leads, support messages and usage/error records. Our analytics collect site visits and interaction data. Payment details are handled by Stripe; we do not store your full card number. Do not submit sensitive personal information unnecessary for the service.",
      ],
      [
        "How we use data",
        "We use your data to authenticate you, process subscriptions, generate and store assets, host websites, deliver leads, provide support, maintain security and understand product usage. When app emails are enabled we use your email for service notifications and password resets, not unsolicited marketing.",
      ],
      [
        "Service providers",
        "We use Runable for hosting, managed authentication, analytics and the AI gateway; Turso for database storage; Tigris for asset storage; Autumn and Stripe for billing; and, when configured, Resend for transactional email. AI prompts include relevant intake answers and business assets and are sent to AI providers through the gateway. Providers process data under their own terms and privacy policies. We do not sell your personal information.",
      ],
      [
        "Public websites and leads",
        "Generated websites may display your business content publicly. People submitting a contact form provide their name, email, optional phone and message to that business. The business owner can read and export those leads and is responsible for how they use them. Do not use the forms to submit sensitive data.",
      ],
      [
        "Cookies and analytics",
        "We use authentication cookies and local storage to keep you signed in and preserve your cart. Analytics record visits and interactions to help improve the service. Contact us about privacy preferences; we do not promise an opt-out control that the site does not currently provide.",
      ],
      [
        "Retention and deletion",
        "We retain data while needed to deliver the service, maintain records and comply with legal obligations. Deleting a business removes its database assets and contacts; storage copies, logs and backups may remain for operational or legal retention. Contact support to request account deletion, a copy of your information or corrections. Payment records may need to be retained separately by billing providers.",
      ],
      [
        "Security and your rights",
        "We use access controls and third-party infrastructure safeguards, but no system is completely secure. Depending on your location, you may have rights to access, correct, delete or restrict use of your information. Contact support with your request; we may need to verify your identity.",
      ],
      [
        "Children and international processing",
        "This service is for adults, not children under 18. Data may be processed outside your state or country, including in the United States. Contact us if you believe a child has supplied personal information.",
      ],
    ],
  },
  refunds: {
    title: "Refund policy.",
    intro: "Monthly subscriptions. Cancel anytime. No routine refunds.",
    sections: [
      [
        "No refunds",
        "Subscription charges, including renewals, are non-refundable except where required by law. We do not offer refunds for unused generations, partial months, changes of mind or failure to achieve business results. This does not limit mandatory consumer rights.",
      ],
      [
        "Cancel before renewal",
        "Open Account → Manage billing to cancel. Cancellation takes effect at the end of the paid period, and tools remain available until then. Cancellation does not refund past charges.",
      ],
      [
        "Bundle upgrades",
        "The bundle does not automatically stop existing single-tool plans. Once the bundle is active, use the Account page to stop them at the end of their paid periods. Review charges before adding plans.",
      ],
      [
        "Billing mistakes",
        "If you believe a charge is unauthorized, duplicated or incorrect, contact support with your account email, payment date and invoice reference. Never send your full card number. We will investigate and correct verified billing errors.",
      ],
    ],
  },
};
export default function LegalPage({ kind }: { kind: string }) {
  const { data: config } = useLaunchConfig();
  const send = useContact();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const support = config?.support ?? "mr.danielbjorke@gmail.com";
  const doc = documents[kind];
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
      <p className="text-xs font-extrabold uppercase tracking-[0.2em]">
        AI Service Hub LLC · Minnesota, USA
      </p>
      <h1 className="display mt-4 text-5xl md:text-7xl">
        {doc?.title ?? "Talk to us."}
      </h1>
      <p className="mt-5 max-w-2xl text-lg font-bold">
        {doc?.intro ??
          "Billing question, privacy request or something not working? Send a message."}
      </p>
      {doc ? (
        <>
          <p className="mt-4 text-sm font-bold">Effective October 6, 2026</p>
          <div className="card mt-8 bg-paper p-6 md:p-10 space-y-8">
            {doc.sections.map(([h, p]) => (
              <section key={h}>
                <h2 className="display text-2xl">{h}</h2>
                <p className="mt-3 leading-relaxed font-medium">{p}</p>
              </section>
            ))}
            <section>
              <h2 className="display text-2xl">Contact</h2>
              <p className="mt-3">
                AI Service Hub LLC · Minnesota, USA
                <br />
                <a
                  className="ulink font-bold break-all"
                  href={`mailto:${support}`}
                >
                  {support}
                </a>
              </p>
              <Link to="/contact" className="btn btn-sm mt-5">
                Contact support <ArrowUpRight className="h-4 w-4" />
              </Link>
            </section>
          </div>
        </>
      ) : (
        <div className="grid gap-8 mt-8 md:grid-cols-[1fr_2fr]">
          <aside className="b3 bg-ink text-paper p-6 h-fit">
            <p className="display text-2xl">Direct line.</p>
            <a
              href={`mailto:${support}`}
              className="ulink mt-4 block break-all text-cream"
            >
              {support}
            </a>
            <p className="mt-5 text-sm">
              Messages are saved for our support team, even while email
              notifications are being set up.
            </p>
          </aside>
          <form
            className="card bg-paper p-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              send.mutate({ name, email, message, company });
            }}
          >
            {send.isSuccess ? (
              <output className="font-extrabold flex gap-3">
                <Check /> Message received. We'll review it and reply to your
                email.
              </output>
            ) : (
              <>
                <label className="block font-extrabold">
                  Your name
                  <input
                    aria-label="Your name"
                    className="input mt-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={120}
                  />
                </label>
                <label className="block font-extrabold">
                  Email
                  <input
                    aria-label="Email"
                    className="input mt-2"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={200}
                  />
                </label>
                <label className="block font-extrabold">
                  Message
                  <textarea
                    aria-label="Message"
                    className="input mt-2 min-h-40"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    minLength={10}
                    maxLength={4000}
                  />
                </label>
                <input
                  aria-label="Company (leave empty)"
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
                {send.error && (
                  <p role="alert" className="font-bold">
                    {errorMessage(send.error)}
                  </p>
                )}
                <button className="btn" disabled={send.isPending}>
                  {" "}
                  {send.isPending ? "Sending…" : "Send message"}
                </button>
              </>
            )}
          </form>
        </div>
      )}
      <nav className="mt-8 flex flex-wrap gap-4 font-bold">
        {["terms", "privacy", "refunds", "contact"].map((x) => (
          <Link className="ulink capitalize" key={x} to={`/${x}`}>
            {x}
          </Link>
        ))}
      </nav>
    </div>
  );
}
