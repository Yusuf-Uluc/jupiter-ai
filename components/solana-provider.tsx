"use client";

import {
  WalletProvider,
  ConnectionProvider,
} from "@solana/wallet-adapter-react";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

export default function SolanaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const wallets = [new SolflareWalletAdapter()];
  const endpoint = "https://api.mainnet.solana.com";

  return (
    <WalletProvider wallets={wallets}>
      <ConnectionProvider endpoint={endpoint}>{children}</ConnectionProvider>
    </WalletProvider>
  );
}
