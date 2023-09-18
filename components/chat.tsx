"use client";

import { Message, useChat } from "ai/react";
import { Skeleton } from "./ui/skeleton";
import { useCallback, useEffect } from "react";
import Image from "next/image";
import { ArrowRightLeft, PlayIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { Swap } from "@/lib/langchain";

export default function Chat({}: {}) {
  const wallet = useWallet();

  const { messages, isLoading } = useChat({
    api: "/api/chat",
    id: "1",
  });

  const { toast } = useToast();

  const asSwap = (message: Message) => {
    return JSON.parse(message.content) as Swap;
  };

  const getQuote = async (
    inputMint: string,
    outputMint: string,
    amount: number
  ) => {
    const { data } = await (
      await fetch(
        `https://quote-api.jup.ag/v4/quote?inputMint=${inputMint}\&outputMint=${outputMint}&amount=${amount}\&slippageBps=50`
      )
    ).json();

    const routes = data;
    return routes;
  };

  const getSwapTransaction = async (
    route: any,
    userPublicKey: string,
    wrapUnwrapSol: boolean
  ) => {
    const transaction = await (
      await fetch("https://quote-api.jup.ag/v4/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: route,
          userPublicKey: userPublicKey,
          wrapUnwrapSOL: wrapUnwrapSol,
        }),
      })
    ).json();

    const { swapTransaction } = transaction;

    return swapTransaction;
  };

  const showSwapTx = useCallback(
    async (message: Message) => {
      try {
        if (wallet.publicKey && wallet.signTransaction) {
          const swap = asSwap(message);

          const routes = await getQuote(
            swap.fromAddress,
            swap.toAddress,
            swap.inputTokenSwapAmount * 10 ** swap.fromDecimals
          );

          const swapTransaction = await getSwapTransaction(
            routes[0],
            wallet.publicKey.toString(),
            true
          );

          // deserialize the transaction
          const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
          var transaction =
            VersionedTransaction.deserialize(swapTransactionBuf);

          await wallet.signTransaction(transaction);
        }
      } catch (err) {
        toast({
          title: "Error",
          description: (err as any)?.message ?? (err as any),
        });
      }
    },
    [wallet, toast]
  );

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (messages.length > 0 && lastMessage.role === "assistant" && !isLoading) {
      showSwapTx(lastMessage);
    }
  }, [messages, isLoading, showSwapTx]);

  return (
    <TooltipProvider>
      <div
        id="chat-container"
        className="h-full flex flex-col space-y-3 overflow-y-auto"
      >
        {messages.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-sm font-extralight text-white/50">
            No messages yet
          </div>
        ) : (
          messages.map((message) =>
            message.role === "user" ? (
              <div
                key={message.id}
                className="max-w-sm ml-auto break-words border border-white/10 p-3 rounded-lg"
              >
                <div>{message.content}</div>
              </div>
            ) : (
              !isLoading && (
                <div key={message.id} className="flex flex-row space-x-1">
                  <div className="w-[250px] py-4 space-x-10 relative flex flex-row items-center justify-center border border-white/10 rounded-lg">
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger>
                        <div className="flex flex-col space-y-1.5">
                          <Image
                            src={asSwap(message).fromLogoURI}
                            alt=""
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <p className="text-xs text-white/70">
                            {asSwap(message).fromSymbol}
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent align="center">
                        <p>{asSwap(message).fromName}</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="flex flex-col items-center space-y-1">
                      <p className="text-green-500 text-xs">
                        {asSwap(message).inputTokenSwapAmount}{" "}
                        {asSwap(message).fromSymbol}
                      </p>
                      <ArrowRightLeft size={20} color="#E1E1E1" />
                    </div>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger>
                        <div className="flex flex-col space-y-1.5">
                          <Image
                            src={asSwap(message).toLogoURI}
                            alt=""
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <p className="text-xs text-white/70">
                            {asSwap(message).toSymbol}
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent align="end">
                        <p>{asSwap(message).toName}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-6 h-6 p-0 border border-white/10"
                    onClick={() => showSwapTx(message)}
                  >
                    <PlayIcon size={8} className="text-green-400" />
                  </Button>
                </div>
              )
            )
          )
        )}
        {isLoading && <Skeleton className="w-[250px] h-[88px] rounded-lg" />}
      </div>
    </TooltipProvider>
  );
}
