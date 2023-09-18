import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { mintAccounts } = await req.json();

    const response = await fetch(
      `https://api.helius.xyz/v0/token-metadata?api-key=${process.env.HELIUS_SECRET}`,
      {
        method: "POST",
        body: JSON.stringify({
          mintAccounts: mintAccounts,
          includeOffChain: true,
        }),
      }
    );
    const data = await response.json();

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.error();
  }
}
