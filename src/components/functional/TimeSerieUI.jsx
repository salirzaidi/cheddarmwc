import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TimeSeriesUI({ className, ...props }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTimeFMCall = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/timesfm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeSeriesData: [10, 15, 20, 25, 30], // ✅ Pure numeric array
          predictionSteps: 5, // Predict next 5 steps
        }),
      });
  
      const result = await response.json();
      setPrediction(result.response || "No prediction available");
    } catch (error) {
      console.error("Error calling TimeFM:", error);
      setPrediction("Error fetching prediction");
    } finally {
      setLoading(false);
    }
  };
  
  
  

  return (
    <Card className="w-[35vw]">
      <CardHeader>
        <CardTitle>TimeFM Prediction</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button onClick={handleTimeFMCall} disabled={loading}>
          {loading ? "Predicting..." : "Predict Future Data"}
        </Button>

        {prediction && (
          <div className="p-4 border border-gray-300 rounded-md">
            <strong>Prediction:</strong> {JSON.stringify(prediction)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
