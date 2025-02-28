


import { GoogleGenerativeAI } from "@google/generative-ai";


export async function POST(req) {
  console.log("Received request to /api/purechat");
  try {
    const { messages } = await req.json();

    // Debug print for received messages
    console.log("Received messages:", JSON.stringify(messages, null, 2));

    // Get Google API key from environment variables
    const apiKey = "835ee36e0572950941ea594d63105cccc0dfdb81";

    if (!apiKey) {
      console.error("Google API key not set");
      return new Response(
        JSON.stringify({ error: "Google API key not set" }),
        { status: 500 }
      );
    }

    // Debug print for API key (not recommended in production, but useful here for debugging)
    console.log("Using Google API key:", apiKey);

    // Initialize the Google Generative AI client with the API key
    const genAI = new GoogleGenerativeAI({
      apiKey: apiKey, // Pass the API key directly
    });

    // Get the Generative model (Gemini model)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create a prompt from the received messages
    const prompt = messages.map((msg) => msg.content).join("\n");

    // Debug print for the generated prompt
    console.log("Generated prompt:", prompt);

    // Generate content based on the prompt
    const result = await model.generateContent(prompt);

    // Extract the response text from the result
    const aiResponse = result.response.text();

    // Debug print for the AI response
    console.log("Generated AI response:", aiResponse);

    // Return the AI response as JSON
    return new Response(JSON.stringify({ message: aiResponse }), { status: 200 });
  } catch (error) {
    console.error("Error occurred:", error);

    // Return error response with more detailed error message
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500 }
    );
  }
}
