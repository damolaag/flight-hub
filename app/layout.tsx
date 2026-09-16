import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlightHub — Compare cheap flights worldwide",
  description: "Find cheap local and international flights, compare fares, and continue to airlines or travel providers to book.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
