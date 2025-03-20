import { useEffect } from "react";
import { APP_NAME } from "../../utils/constants";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { Link } from "react-router-dom";
export default function TermsAndConditions() {
  useEffect(() => {
    document.title = `Terms and Conditions | ${APP_NAME}`;
  }, []);

  return (
    <div className="min-h-screen  text-gray-200 p-6 flex items-center justify-center">
      <DarkModeSwitcher />
      <div className="w-full max-w-4xl bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">
          Terms and Conditions
        </h1>

        <p className="text-sm text-gray-300 text-center mb-4">
          Last Updated: 26th Feb 2025
        </p>

        <div className="space-y-6 text-gray-300 text-sm">
          <section>
            <h2 className="text-lg font-semibold ">1. Acceptance of Terms</h2>
            <p>
              By accessing and using {APP_NAME}, you agree to be bound by these
              terms and conditions. If you do not agree, please discontinue use.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold ">2. User Responsibilities</h2>
            <p>
              Users must ensure they comply with all applicable laws and
              regulations while using {APP_NAME}. Misuse of the platform may
              result in account suspension.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold ">3. Intellectual Property</h2>
            <p>
              All content on {APP_NAME}, including logos, designs, and text, is
              protected by copyright laws. Unauthorized use is prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold ">
              4. Limitation of Liability
            </h2>
            <p>
              {APP_NAME} is not responsible for any losses or damages incurred
              through the use of our platform. Users assume all risks associated
              with their transactions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold ">5. Changes to Terms</h2>
            <p>
              We reserve the right to update these terms at any time. Continued
              use of {APP_NAME} after modifications indicates acceptance of the
              changes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold ">6. Contact Us</h2>
            <p>
              For any questions regarding these terms, please contact us at{" "}
              <a href="https://x.com/EcoNova_Bot" className="">
                EcoNova_Bot
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm  hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
