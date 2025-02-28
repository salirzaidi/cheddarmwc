import { useState } from "react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function GemUI({ className, ...props }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => setInput(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Append the user's message
    const newMessage = { role: "user", content: input };
    const newMessages = [...messages, newMessage];

    // Update UI with the new user message
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Call backend API to generate AI response
      const aiResponse = await callGenerativeAI(newMessages);
      const aiMessage = { role: "AI", content: aiResponse };

      // Update UI with the AI response
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Error calling Generative AI:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "AI", content: "Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Call the backend API to generate the AI response
  const callGenerativeAI = async (messages) => {
    try {
      const response = await axios.post("/api/chat", {
        messages: messages,
      });
      return response.data.message || "No response from AI";
    } catch (error) {
      console.error("Error:", error);
      throw new Error("Failed to fetch AI response");
    }
  };

  return (
    <Card className={cn("w-[100%]", className)} {...props}>
      <CardHeader>
        <CardTitle>AI Agent</CardTitle>
        <CardDescription>Interactive AI Chat</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-col w-full max-w-md h-full mx-auto border-2 border-violet-900 rounded-xl">
          {/* Messages container */}
          <div className="flex-1 overflow-auto px-2 py-4">
            <div className="space-y-4">
              {messages.map((m, index) => (
                <div key={index} className="whitespace-pre-wrap">
                  <strong>{m.role === "user" ? "User: " : "AI: "}</strong>
                  {m.content}
                </div>
              ))}
            </div>
          </div>

          {/* Input form always at the bottom */}
          <form onSubmit={handleSubmit} className="w-full border-t border-zinc-300 dark:border-violet-800 p-2">
            <input
              className="w-full p-2 dark:bg-violet-900 rounded shadow-xl"
              value={input}
              placeholder="Say something..."
              onChange={handleInputChange}
              disabled={loading}
            />
          </form>
        </div>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
