import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider"; // Importamos el nuevo componente

export const metadata: Metadata = {
  title: "Investment Lottery — Web3 Raffle Protocol",
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
        {/* Envolvemos children con el Web3Provider */}
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
