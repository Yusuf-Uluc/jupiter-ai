import { ConversationChain } from "langchain/chains";
import { OpenAIChat } from "langchain/llms/openai";
import { BufferMemory } from "langchain/memory";
import { PromptTemplate } from "langchain/prompts";

export interface Token {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI: string;
  tags: string[];
  extensions: {
    coingeckoId: string;
  };
}

export interface Swap {
  fromAddress: string;
  toAddress: string;
  fromDecimals: number;
  toDecimals: number;
  fromLogoURI: string;
  toLogoURI: string;
  fromSymbol: string;
  toSymbol: string;
  fromName: string;
  toName: string;
  inputTokenSwapAmount: number;
}

export const makeChain = (QA_PROMPT: PromptTemplate) => {
  const model = new OpenAIChat({
    temperature: 0,
    frequencyPenalty: 0,
    presencePenalty: 0,
    modelName: "gpt-3.5-turbo",
    streaming: true,
    callbackManager: {
      handleLLMError: (error: any) => {
        console.log("error", error);
      },
    } as any,
  });

  const chain = new ConversationChain({
    llm: model,

    memory: new BufferMemory({
      memoryKey: "chat_history",
    }),
    prompt: QA_PROMPT,
  });

  return chain;
};

export const CHAT_QA_PROMPT = PromptTemplate.fromTemplate(`
  You are Jupiter AI. 
  Jupiter is the key liquidity aggregator for Solana, offering the widest range of tokens and best route discovery between any token pair.
  
  The user will ask you to swap tokens.
  Eg. Swap 100 USDC for SOL.
  
  And you are given some context. The context contains a few jsons of tokens and their metadata from the jupiter token list.
  Don't just return the context as it is to the user. Use the context to form a swap transaction and return the transaction as json to the user.
  
  If the user doesn't provide enough information to form a swap transaction, ask the user for more information.
  The information you need is the amount of tokens to swap and the token to swap to.
  
  The context has two arrays of tokens. One array is a few relevant tokens that the user has in their wallet. The other array is the tokens that the user can swap to.
  Think about which tokens in the context are relevant to the user's question.
  Try to not use sketchy tokens. If there are multiple tokens with the same/similar symbol or name, use the one with the cleaner coingecko id.
  When the user talks about sol or solana always use Wrapped Sol.
  If no amount is provided, assume the user wants to swap 1 token.
  
  If you don't know the answer, just say "Failed to perform the swap :( " Don't try to make up an answer.
  If the question is not about Jupiter Swaps, politely inform them that you are tuned to only perform Jupiter Swaps.
  Do NOT include information in the json that is not relevant to the question.
  
  
  Your JSON response should look like this:
  {json_example}
  
  User's Question:
  {question}
  
  Context:
  {context}
  
  Answer:
  `);

export const JSON_EXAMPLE = JSON.stringify({
  fromAddress: "So11111111111111111111111111111111111111112",
  toAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  fromDecimals: 9,
  toDecimals: 6,
  fromLogoURI: "https://example.com/logo.png",
  toLogoURI: "https://example.com/logo.png",
  fromSymbol: "SOL",
  toSymbol: "USDC",
  fromName: "Solana",
  toName: "USD Coin",
  inputTokenSwapAmount: 100,
} as Swap);
