import * as tf from '@tensorflow/tfjs';

export async function POST(req) {
  try {
    const { data, predictionSteps } = await req.json();
    console.log("Received data:", data);

    if (!data || Object.keys(data).length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid data format: expected non-empty data" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Normalize data and predict for each RNTI
    const predictionsForAllRntis = {};

    for (const [rnti, rntiData] of Object.entries(data)) {
      if (!Array.isArray(rntiData) || rntiData.length === 0) {
        continue; // Skip if the RNTI data is not valid
      }

      console.log(`Processing RNTI: ${rnti} with data:`, rntiData);

      // Extract only the values (ignoring timestamps)
      const values = rntiData.map(entry => entry.value);  // Assuming entry has a 'value' field

      // Min-Max scaling for normalization
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);

      // Prevent division by zero
      if (minValue === maxValue) {
        console.error(`Min and max values are the same for RNTI: ${rnti}. Normalization may not work.`);
        continue; // Skip this RNTI if normalization is not possible
      }

      const normalizedData = values.map(value => (value - minValue) / (maxValue - minValue));

      // Reshape data for LSTM (3D tensor format)
      const reshapedData = normalizedData.map(value => [[value]]);
      const inputData = tf.tensor3d(reshapedData);
      const targetData = tf.tensor2d(normalizedData, [normalizedData.length, 1]);

      // Define and train the LSTM model
      const model = tf.sequential();
      model.add(tf.layers.lstm({
        units: 50,
        inputShape: [inputData.shape[1], inputData.shape[2]],
        returnSequences: false,
        activation: 'relu',  // Use ReLU to avoid issues with vanishing gradients
      }));
      model.add(tf.layers.dense({ units: 1 }));

      // Compile the model
      const optimizer = tf.train.adam(0.001); // Lower learning rate
      model.compile({ optimizer: optimizer, loss: 'meanSquaredError' });

      // Train the model
      await model.fit(inputData, targetData, {
        epochs: 50,
        batchSize: 32,
        verbose: 1,
      });

      // Make predictions for the required number of steps
      const predictions = model.predict(inputData);
      const predictedNormalizedValues = predictions.arraySync().slice(0, predictionSteps);

      if (predictedNormalizedValues.length === 0) {
        console.log(`No predictions for RNTI: ${rnti}`);
        continue;
      }

      // Inverse normalize the predictions
      const predictedValues = predictedNormalizedValues.map(value => value * (maxValue - minValue) + minValue);
      predictionsForAllRntis[rnti] = predictedValues;

      // Dispose the model to free memory
      model.dispose();
    }

    console.log("Predictions:", predictionsForAllRntis);

    // Return all predictions in the response
    return new Response(
      JSON.stringify({ success: true, predictions: predictionsForAllRntis }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in LSTM model:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
