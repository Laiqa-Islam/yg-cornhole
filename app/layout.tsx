import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YG Bags | Competition Cornhole Bags, Boards & Apparel",
  description: "ACL-approved cornhole bags, custom boards, and apparel built for players who take every throw seriously.",
  icons: { icon: "/icon.png", apple: "/icon.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
