import * as tf from '@tensorflow/tfjs';

export async function POST(req) {
  try {
    const { data, predictionSteps } = await req.json();
    console.log(data);
    
    // Check if 'data' is an array and is not empty
    if (!Array.isArray(data) || data.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid data format: expected a non-empty array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Normalize the data: Min-Max scaling
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const normalizedData = data.map(value => (value - minValue) / (maxValue - minValue)); // Normalize to range [0, 1]

    // Reshape data to 3D: (samples, timesteps, features)
    const reshapedData = normalizedData.map(value => [[value]]); // Convert each value to a single timestep with one feature

    // Convert to tensor
    const inputData = tf.tensor3d(reshapedData);

    // We need to reshape the target data to 2D (samples, features)
    const targetData = tf.tensor2d(normalizedData, [normalizedData.length, 1]);

    // Define the LSTM model
    const model = tf.sequential();
    model.add(tf.layers.lstm({
      units: 50,
      inputShape: [inputData.shape[1], inputData.shape[2]], // timesteps, features
      returnSequences: false,
    }));
    model.add(tf.layers.dense({ units: 1 }));

    // Compile the model
    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

    // Train the model
    await model.fit(inputData, targetData, {
      epochs: 50,
      batchSize: 32,
      verbose: 1,
    });

    // Make predictions
    const predictions = model.predict(inputData);

    // Process predictions to get the output you need
    const predictedNormalizedValues = predictions.arraySync().slice(0, predictionSteps);

    // Inverse normalize the predictions
    const predictedValues = predictedNormalizedValues.map((value) => value * (maxValue - minValue) + minValue); // Scale back to original range

    // Dispose of the model after use
    model.dispose();

    // Return the predictions as a JSON response
    return new Response(JSON.stringify({ success: true, predictions: predictedValues }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in LSTM model:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
