import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getBalances = async (address: string) => {
  const response = await fetch(
    `https://api.helius.xyz/v0/addresses/${address}/balances?api-key=${process
      .env.HELIUS_SECRET!}`
  );
  const data = await response.json();
  return data as {
    tokens: {
      mint: string;
      amount: number;
      decimals: number;
      tokenAccount: string;
    }[];
    nativeBalance: number;
  };
};
