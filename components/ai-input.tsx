"use client";
import { useChat } from "ai/react";
import { Button } from "./ui/button";
import { SendHorizonal } from "lucide-react";
import { Input } from "./ui/input";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export default function AiInput() {
  const { publicKey } = useWallet();

  const { input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    id: "1",
    body: {
      address: publicKey?.toString(),
    },
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-x-2 flex flex-row items-center"
    >
      <Input
        type="text"
        placeholder="Swap 1 SOL to Bonk..."
        value={input}
        onChange={handleInputChange}
      />
      <Button
        type="submit"
        variant="outline"
        size="default"
        disabled={!publicKey || isLoading}
      >
        <SendHorizonal size={16} />
      </Button>
    </form>
  );
}
