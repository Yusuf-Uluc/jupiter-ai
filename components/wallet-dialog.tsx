"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import Image from "next/image";
import { WalletName } from "@solana/wallet-adapter-base";
import { useEffect, useState } from "react";

export default function WalletDialog() {
  const { publicKey, wallets, connect, select, wallet, connected } =
    useWallet();

  const [open, setOpen] = useState(false);

  const onClickButton = () => {
    setOpen(true);
  };

  const connectWallet = async (name: WalletName) => {
    select(name);
    // connect().catch((err) => {
    //   console.log(err);
    // });
  };

  useEffect(() => {
    connect().catch((err) => {});
  }, [connect, wallet]);

  useEffect(() => {
    if (connected) {
      setOpen(false);
    }
  }, [setOpen, connected]);

  return (
    <>
      <Button
        variant="outline"
        size="default"
        className="fixed top-5 right-5 z-50"
        onClick={onClickButton}
      >
        {connected && publicKey ? (
          <div className="flex flex-row items-center space-x-2">
            <Image
              src={wallet?.adapter.icon ?? ""}
              alt=""
              width={18}
              height={18}
            />
            <p>
              {publicKey.toString().slice(0, 4) +
                "..." +
                publicKey.toString().slice(-4)}
            </p>
          </div>
        ) : (
          "Connect Wallet"
        )}
      </Button>

      <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Connect a Wallet</DialogTitle>
            <DialogDescription>
              Pick a wallet of your choice to start using Jupiter AI.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4">
            {wallets.map(({ adapter }) => (
              <button
                key={adapter.name}
                onClick={() => connectWallet(adapter.name)}
                className="w-20 h-20 flex flex-col items-center justify-center rounded-lg border shadow-xl shadow-transparent hover:shadow-white/10 transition-all duration-300"
              >
                <Image src={adapter.icon} alt="" width={25} height={25} />
                <p className="text-sm text-white/90 mt-2 truncate">
                  {adapter.name}
                </p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
