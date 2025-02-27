import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactECharts from "echarts-for-react";

export function TimeSeriesUI({ className, extractedData, ...props }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to fetch prediction for a single RNTI
  const fetchPredictionForRnti = async (timeSeries) => {
    try {
      const response = await fetch("/api/timesfm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeSeriesData: timeSeries, // Send pure numeric array for one RNTI
          predictionSteps: 5,         // Predict next 5 steps
        }),
      });

      const result = await response.json();
      return result.response || {}; // Ensure response has a fallback value if missing
    } catch (error) {
      console.error("Error calling TimeFM:", error);
      return "Error fetching prediction";
    }
  };

  // Function to handle predictions for all RNTIs
  const handleTimeFMCall = async () => {
    setLoading(true);
    const allPredictions = {};

    try {
      for (const [rnti_mac, series] of Object.entries(extractedData)) {
        const timeSeries = series.map(d => d.value); // Extract pure numeric values for each RNTI
        const prediction = await fetchPredictionForRnti(timeSeries);
        
        // Ensure to extract the first prediction for each RNTI
        if (prediction.predictions) {
          const predictionData = prediction.predictions[0];

          const forecast = predictionData.point_forecast || []; // Get forecast points
          const quantiles = predictionData.quantile_forecast || {};       // Get quantile data (5%, 95%)
console.log(predictionData)
          allPredictions[rnti_mac] = {
            forecast: forecast.slice(0, 10),          // Only take 5 forecast points
            quantiles: {
              "5%":  quantiles.slice(0, 10).map(entry => [entry[3]])            ,  // Lower Bound
              "95%": quantiles.slice(0, 10).map(entry => [entry[9]])  , // Upper Bound
            },
          };
        }
      }
      
      setPrediction(allPredictions); // Store predictions for all RNTIs
    } catch (error) {
      console.error("Error during prediction fetching:", error);
      setPrediction("Error fetching prediction");
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart options using the prediction results
  const getChartOptions = () => {
    if (!extractedData || !prediction) return {};

    const series = [];
    Object.entries(extractedData).forEach(([rnti_mac, data]) => {
      const timestamps = data.map(d => new Date(d.timestamp));
      const values = data.map(d => d.value);

      const forecast = prediction[rnti_mac]?.forecast || [];
      const quantiles = prediction[rnti_mac]?.quantiles || {};

      const lowerBound = quantiles["5%"] || [];
      const upperBound = quantiles["95%"] || [];

      // Original series (actual data)
      series.push({
        name: `RNTI ${rnti_mac} (Actual)`,
        type: "line",
        data: values.map((value, index) => [timestamps[index].toISOString(), value]),
        smooth: true,
      });

      // Forecast series (using quantile_forecast)
      series.push({
        name: `RNTI ${rnti_mac} (Forecast)`,
        type: "line",
        data: forecast.map((forecastValue, index) => {
          const forecastTimestamp = new Date(timestamps[timestamps.length - 1]);
          forecastTimestamp.setSeconds(forecastTimestamp.getSeconds() + (index + 1) ); // Adjust forecast timestamps by seconds
          return [forecastTimestamp.toISOString(), forecastValue];
        }),
        smooth: true,
        lineStyle: { type: "dashed" },
      });

   
// Lower Bound: This will start from its own value
series.push({
  name: `RNTI ${rnti_mac} (Confidence) - Lower Bound`,
  type: "line",
  data: lowerBound.map((forecastValue, index) => {
    const forecastTimestamp = new Date(timestamps[timestamps.length - 1]);
    forecastTimestamp.setSeconds(forecastTimestamp.getSeconds() + (index + 1)); // Adjust forecast timestamps by seconds
    return [forecastTimestamp.toISOString(), forecastValue];
  }),
  lineStyle: { opacity: 0 }, // Hide line
  areaStyle: { opacity: 0 }, // Shaded area for lower bound
  stack: `confidence-${rnti_mac}`, // Stack lower bound
});

// Upper Bound: This will be stacked on top of the lower bound
series.push({
  name: `RNTI ${rnti_mac} (Confidence) - Upper Bound`,
  type: "line",
  data: upperBound.map((forecastValue, index) => {
    const forecastTimestamp = new Date(timestamps[timestamps.length - 1]);
    forecastTimestamp.setSeconds(forecastTimestamp.getSeconds() + (index + 1)); // Adjust forecast timestamps by seconds
    return [forecastTimestamp.toISOString(), forecastValue-lowerBound[index]];
  }),
  lineStyle: { opacity: 0 }, // Hide line
  areaStyle: { opacity: 0.3 }, // Shaded area for upper bound
  stack: `confidence-${rnti_mac}`, // Stack upper bound on top of lower bound
});
    });

    return {
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "time",  // Ensure it's time-based
        data: extractedData[Object.keys(extractedData)[0]].map(d => new Date(d.timestamp).toISOString()),  // Ensure timestamps are in ISO format
      },
      yAxis: { type: "value" },
      series,
    };
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
        <ReactECharts option={getChartOptions()} style={{ height: "400px" }} />
      </CardContent>
    </Card>
  );
}
