import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import SolanaProvider from "@/components/solana-provider";
import { Toaster } from "@/components/ui/toaster";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jupiter AI ⚡",
  description: "Demo app showcasing how you can combine AI and Solana",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <SolanaProvider>
            {children}
            <Toaster />
            <div className="w-[600px] h-[600px] absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-green-800/80 to-blue-800/50 blur-[100px] z-[-1]"></div>
          </SolanaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
