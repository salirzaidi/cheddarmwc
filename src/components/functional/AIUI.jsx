import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useChat } from '@ai-sdk/react';

export function AIUI({ className, ...props }) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat", // Make sure this matches your Next.js API route
  });

  return (
    <Card className={cn("w-[35vw]", className)} {...props}>
      <CardHeader>
        <CardTitle>AI Agent</CardTitle>
        <CardDescription>Interactive RAG</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-col w-[35vw] max-w-md h-[55vh] mx-auto border-2 border-violet-900 rounded-xl">
          {/* Messages container - makes messages scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((m) => (
              <div key={m.id} className="whitespace-pre-wrap">
                {m.role === "user" ? "User: " : "AI: "}
                {m.content}
              </div>
            ))}
          </div>

          {/* Input form always at the bottom */}
          <form onSubmit={handleSubmit} className="w-full border-t border-zinc-300 dark:border-violet-800 p-2">
            <input
              className="w-full p-2 dark:bg-violet-900 rounded shadow-xl"
              value={input}
              placeholder="Say something..."
              onChange={handleInputChange}
            />
          </form>
        </div>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
