import { StreamingTextResponse, LangChainStream, Message } from "ai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Document } from "langchain/document";
import { getBalances } from "@/lib/utils";
import { CHAT_QA_PROMPT, JSON_EXAMPLE, makeChain } from "@/lib/langchain";
import path from "path";

export async function POST(req: Request) {
  // Get the user's messages and wallet address from the request body
  const { messages, address } = await req.json();

  // The prompt is the last message sent by the user
  const prompt = (messages as Message[])[messages.length - 1].content;

  const { stream, handlers } = LangChainStream();

  // Get the user's wallet balances (tokens and SOL) using the Helius API
  let balances = await getBalances(address);

  // We're telling the AI that the user has wrapped SOL in his wallet (because SOL is not a usual token)
  balances = {
    ...balances,
    tokens: [
      ...balances.tokens,
      {
        amount: balances.nativeBalance,
        decimals: 9,
        mint: "So11111111111111111111111111111111111111112",
        tokenAccount: "",
      },
    ],
  };
  if (balances.tokens.length > 0 || balances.nativeBalance > 0) {
    // Load the vector store with the jupiter tokens list
    const store = await HNSWLib.load(
      path.join(process.cwd(), "tokens"),
      new OpenAIEmbeddings()
    );

    // Filter out tokens that are not in the user's wallet (we don't want to swap tokens that the user doesn't have)
    const filter = (doc: Document) => {
      if (
        balances.tokens.some(
          (t) => t.mint === JSON.parse(doc.pageContent).address
        )
      ) {
        return true;
      }
      return false;
    };

    // Search for tokens that are similar to the prompt, and filter out tokens that are not in the user's wallet
    const fromSearch = await store.similaritySearch(prompt, 3, (doc) =>
      filter(doc)
    );
    // Search for tokens that are similar to the prompt (without filtering)
    const toSearch = await store.similaritySearch(prompt, 5);

    // Create the context for the AI
    const context = {
      fromOptions: fromSearch,
      toOptions: toSearch,
    };

    // Create the AI conversatin chain
    const chain = makeChain(
      await CHAT_QA_PROMPT.partial({
        json_example: JSON_EXAMPLE,
        context: JSON.stringify(context),
      })
    );

    // Call the AI with the prompt and context
    chain
      .call({ question: `${prompt}` }, { callbacks: [handlers] })
      .catch(console.error);

    // Return the AI response as a streaming response
    return new StreamingTextResponse(stream);
  } else {
    // If the user doesn't have any tokens in his wallet, return a message saying so
    return new Response(
      JSON.stringify({
        message: "You don't have any tokens in your wallet to swap.",
      })
    );
  }
}
