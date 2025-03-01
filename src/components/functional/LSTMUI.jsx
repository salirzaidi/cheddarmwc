"use client";
import { useState, useEffect } from "react";

export default function InferenceUI({ extractedData, setMeanPrediction }) {
    const [predictions, setPredictions] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (Object.keys(extractedData).length > 0) {
            handleInference();
        }
    }, [extractedData]);

    const handleInference = async () => {
        setLoading(true);

        // Send the entire extractedData to the API
        const response = await fetch("/api/inferup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                data: extractedData, // Send all RNTIs data
                predictionSteps: 5, // Request 5 predictions for each RNTI
            }),
        });

        const data = await response.json();
        if (data.success) {
            setPredictions(data.predictions);

            // Calculate the mean for each RNTI and send it to the parent component
            const rntiMeans = {};
            Object.keys(data.predictions).forEach((rnti) => {
                const predictionsForRnti = data.predictions[rnti];
                const mean = predictionsForRnti.reduce((sum, value) => sum + value, 0) / predictionsForRnti.length;
                rntiMeans[rnti] = mean;
            });

            // Pass the mean values back to the parent component
            if (setMeanPrediction) {
                setMeanPrediction(rntiMeans);
            }
        } else {
            alert("Error processing predictions");
        }
        setLoading(false);
    };

    return (
        <div className="p-4">
            <h2 className="text-lg font-bold">LSTM Model</h2>

            {loading ? (
                <div>Processing...</div>
            ) : (
                <div>
                    {Object.keys(predictions).map((rnti) => (
                        <div key={rnti} className="mb-4">
                            <h3 className="font-semibold">Predictions for RNTI {rnti}</h3>
                            <ul className="list-disc pl-5">
                                {predictions[rnti].map((prediction, index) => (
                                    <li key={index}>Point {index + 1}: {prediction}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
