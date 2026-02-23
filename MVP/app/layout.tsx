import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Investmen Lottery — Web3 Raffle Protocol",
  description: "Buy raffle entries, earn yield. Powered by Chainlink VRF.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-void grid-bg">
        {children}
      </body>
    </html>
  );
}
