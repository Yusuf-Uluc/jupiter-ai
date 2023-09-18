"use client";

import { useWallet } from "@solana/wallet-adapter-react";

export default function WalletGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { connected } = useWallet();

  return (
    <>
      {!connected && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-0 z-30">
          <div className="text-lg text-white/80">
            Please connect your wallet
          </div>
        </div>
      )}
      <div className={`${!connected && "blur-[10px] pointer-events-none"}`}>
        {children}
      </div>
    </>
  );
}
