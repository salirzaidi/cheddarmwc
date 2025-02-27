import { GoogleAuth } from "google-auth-library";

export async function POST(req) {
  try {
    const { timeSeriesData, predictionSteps } = await req.json();

    if (!timeSeriesData || !Array.isArray(timeSeriesData)) {
      return Response.json({ error: "Invalid time-series data" }, { status: 400 });
    }

    const project = "mwcali";  // Your GCP project ID
    const location = "europe-west2";  // Ensure this is correct
    const endpointId = "1649711644361621504"; // Your deployed TimeFM model

    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/endpoints/${endpointId}:predict`;

    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const client = await auth.getClient();

    const payload = {
      instances: [
        {
          input: timeSeriesData, // Directly send as numeric array
          prediction_steps: 5,
          horizon_len: 5,
        },
      ],
    };

    // Send request to Vertex AI
    const response = await client.request({
      url: endpoint,
      method: "POST",
      data: payload,
    });

    return Response.json({ response: response.data });
  } catch (error) {
    console.error("TimeFM API Error:", error);
    return Response.json({ error: "Failed to fetch TimeFM data" }, { status: 500 });
  }
}
