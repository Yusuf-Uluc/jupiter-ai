import AiInput from "@/components/ai-input";
import Chat from "@/components/chat";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WalletDialog from "@/components/wallet-dialog";
import WalletGate from "@/components/wallet-gate";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <WalletDialog />

      <WalletGate>
        <Card
          style={{
            backgroundColor: "rgba(0,0,0,0.65)",
          }}
        >
          <CardHeader>
            <CardTitle>Jupiter AI</CardTitle>
            <CardDescription>
              Ask the AI to swap x amount of tokens for another one.
            </CardDescription>
          </CardHeader>
          <CardContent className="w-[600px] h-[450px]">
            <Chat />
          </CardContent>
          <CardFooter>
            <AiInput />
          </CardFooter>
        </Card>
      </WalletGate>
    </main>
  );
}
