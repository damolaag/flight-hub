import type { Metadata } from "next";
import Script from "next/script";
import { GooglePublisherTags } from "@/components/google-publisher-tags";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlightHub — Compare cheap flights worldwide",
  description:
    "Find cheap local and international flights, compare fares, and continue to airlines or travel providers to book.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script id="google-consent-defaults" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){ window.dataLayer.push(arguments); }

            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              wait_for_update: 500
            });

            window.updateGptConsentState = function(consentedToAds, consentedToAnalytics) {
              var adStatus = consentedToAds ? 'granted' : 'denied';
              var analyticsStatus = consentedToAnalytics ? 'granted' : 'denied';

              gtag('consent', 'update', {
                ad_storage: adStatus,
                ad_user_data: adStatus,
                ad_personalization: adStatus,
                analytics_storage: analyticsStatus
              });

              if (window.googletag) {
                window.googletag.cmd.push(function() {
                  var pubads = window.googletag.pubads();
                  pubads.setPrivacySettings({ nonPersonalizedAds: !consentedToAds });
                  if (window.gptRefreshableSlots && window.gptRefreshableSlots.length) {
                    pubads.refresh(window.gptRefreshableSlots);
                  }
                });
              }
            };
          `}
        </Script>
        {children}
        <GooglePublisherTags />
      </body>
    </html>
  );
}
