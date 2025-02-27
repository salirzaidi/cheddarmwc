"use client";
import { useState } from "react";

export default function InferenceUI({ className, extractedData, ...props }) {
    const [input, setInput] = useState(""); // Start with an empty string for array input
    const [output, setOutput] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleInference = async () => {
        setLoading(true);
        console.log(input);

        const timeSeriesData = {};

// Process each RNTI
Object.keys(extractedData).forEach(rnti => {
  const rntiData = extractedData[rnti].map(entry => entry.value);  // Extracting values for LSTM
  
  timeSeriesData[rnti] = rntiData;  // Store the reshaped data for each RNTI
});

console.log(timeSeriesData["40001"]);

        // Try to parse the input string into an array
        let inputArray;
        try {
            inputArray = timeSeriesData["40001"];
            console.log(inputArray) // Parse string to array
            if (!Array.isArray(inputArray)) {
                throw new Error("Input must be an array");
            }
        } catch (error) {
            alert("Invalid array format! Please provide a valid array.");
            setLoading(false);
            return;
        }
        console.log(inputArray);
        // Send the parsed array to the API
        const response = await fetch("/api/infer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: inputArray, predictionSteps: 1 }), // example predictionSteps value
        });

        const data = await response.json();
        setOutput(data.predictions);
        setLoading(false);
    };

    return (
        <div className="p-4">
            <h2 className="text-lg font-bold">Inference UI</h2>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="border p-2 rounded w-full h-24"
                placeholder='Enter array (e.g., [1, 2, 3, 4])'
            />
            <button
                onClick={handleInference}
                className="bg-blue-500 text-white p-2 rounded mt-2"
            >
                {loading ? "Processing..." : "Run Inference"}
            </button>
            {output && (
                <div className="mt-4 p-2 bg-gray-100 rounded">
                    <strong>Output:</strong> {JSON.stringify(output)}
                </div>
            )}
        </div>
    );
}
