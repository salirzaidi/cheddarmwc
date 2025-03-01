import { createVertex } from '@ai-sdk/google-vertex';
import { streamText } from 'ai';
import { z } from 'zod';
import fs from 'node:fs';

export const maxDuration = 120;

export async function POST(req) {
  try {
    const { messages } = await req.json(); // Data sent from the frontend

    const attachment = messages[messages.length - 1]?.experimental_attachments;

  // Ensure all attachments have contentType, or handle it appropriately
  if (attachment && !attachment.contentType) {
    // Set a default or handle cases where contentType is missing
    attachment.contentType = 'application/octet-stream';
  }
    const vertex = createVertex({
      project: 'mwcali',
      location: 'us-central1',
    });

    



    const result = streamText({
      model: vertex('gemini-2.0-flash-001'),
      messages,
      
    });

    console.log("called");

    return result.toDataStreamResponse(); // Streams response in real-time
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
