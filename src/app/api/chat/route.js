import { createVertex } from '@ai-sdk/google-vertex';
import { streamText } from 'ai';

export const maxDuration = 30; // Allow up to 30s streaming

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const vertex = createVertex({
      project: 'mwcali',
      location: 'us-central1',
    });

    // Stream the response using AI SDK
    const result = streamText({
      model: vertex('gemini-2.0-flash-001'),
      messages,
    });

    return result.toDataStreamResponse(); // Streaming response for useChat

  } catch (error) {
    console.error("API error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
