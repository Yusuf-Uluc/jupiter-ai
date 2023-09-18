import { StreamingTextResponse, LangChainStream, Message } from "ai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Document } from "langchain/document";
import { getBalances } from "@/lib/utils";
import { CHAT_QA_PROMPT, JSON_EXAMPLE, makeChain } from "@/lib/langchain";
import path from "path";

export async function POST(req: Request) {
  const { messages, address } = await req.json();
  const prompt = (messages as Message[])[messages.length - 1].content;

  const { stream, handlers } = LangChainStream();

  let balances = await getBalances(address);

  balances = {
    ...balances,
    tokens: [
      ...balances.tokens,
      {
        amount: 0,
        decimals: 9,
        mint: "So11111111111111111111111111111111111111112",
        tokenAccount: "",
      },
    ],
  };
  if (balances.tokens.length > 0 || balances.nativeBalance > 0) {
    const store = await HNSWLib.load(
      path.join(process.cwd(), "tokens"),
      new OpenAIEmbeddings()
    );

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

    const fromSearch = await store.similaritySearch(prompt, 3, (doc) =>
      filter(doc)
    );
    const toSearch = await store.similaritySearch(prompt, 5);

    const context = {
      fromOptions: fromSearch,
      toOptions: toSearch,
    };

    const chain = makeChain(
      await CHAT_QA_PROMPT.partial({
        json_example: JSON_EXAMPLE,
        context: JSON.stringify(context),
      })
    );

    chain
      .call({ question: `${prompt}` }, { callbacks: [handlers] })
      .catch(console.error);

    return new StreamingTextResponse(stream);
  } else {
    return new Response(
      JSON.stringify({
        message: "You don't have any tokens in your wallet to swap.",
      })
    );
  }
}
