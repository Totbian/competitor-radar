import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Competitor Radar | Powered by Ninja API",
  description:
    "Real-time competitor intelligence dashboard. Track promotions, ads, social media, pricing, and reviews - all powered by the Ninja API.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
