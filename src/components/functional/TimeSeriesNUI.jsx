"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactECharts from "echarts-for-react";

export function TimeSeriesNUI({ className, extractedData, setMeanPrediction, ...props }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to fetch prediction for a single RNTI
  const fetchPredictionForRnti = async (timeSeries) => {
    try {
      const response = await fetch("/api/timesfm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeSeriesData: timeSeries,
          predictionSteps: 5,
        }),
      });

      const result = await response.json();
      return result.response || {};
    } catch (error) {
      console.error("Error calling TimeFM:", error);
      return {};
    }
  };

  // Function to handle predictions for all RNTIs
  const handleTimeFMCall = async () => {
    setLoading(true);
    const allPredictions = {};
    const rntiMeans = {}; // Object to store mean for each RNTI

    try {
      for (const [rnti_mac, series] of Object.entries(extractedData)) {
        const timeSeries = series.map((d) => d.value);
        const prediction = await fetchPredictionForRnti(timeSeries);
        
        if (prediction.predictions) {
          const predictionData = prediction.predictions[0];
          const forecast = predictionData.point_forecast || [];

          // Store the forecast for the current RNTI
          allPredictions[rnti_mac] = {
            forecast: forecast.slice(0, 5), // Get the first 5 points as requested
          };

          // Calculate the mean for this RNTI's forecast and add to rntiMeans
          const mean = forecast.reduce((sum, value) => sum + value, 0) / forecast.length;
          rntiMeans[rnti_mac] = mean;
        }
      }

      setPrediction(allPredictions);

      // Send the mean predictions back to the parent component
      if (setMeanPrediction) {
        setMeanPrediction(rntiMeans);
      }
    } catch (error) {
      console.error("Error during prediction fetching:", error);
      setPrediction("Error fetching prediction");
    } finally {
      setLoading(false);
    }
  };

  // Automatically trigger prediction on mount or when extractedData changes
  useEffect(() => {
    if (extractedData && Object.keys(extractedData).length > 0) {
      handleTimeFMCall();
    }
  }, [extractedData]);

  // Prepare chart options using the prediction results
  const getChartOptions = () => {
    if (!extractedData || !prediction) return {};

    const series = [];
    Object.entries(extractedData).forEach(([rnti_mac, data]) => {
      const timestamps = data.map((d) => new Date(d.timestamp));
      const values = data.map((d) => d.value);
      const storedColors = JSON.parse(localStorage.getItem("rntiColors")) || {};

      const forecast = prediction[rnti_mac]?.forecast || [];

      // Original series (actual data)
      series.push({
        name: `RNTI ${rnti_mac} (Actual)`,
        type: "line",
        data: values.map((value, index) => [timestamps[index].toISOString(), value]),
        smooth: true,
        lineStyle: { color: storedColors[rnti_mac] || "#000" },
        itemStyle: { color: storedColors[rnti_mac] || "#000" },
      });

      // Forecast series
      series.push({
        name: `RNTI ${rnti_mac} (Forecast)`,
        type: "line",
        data: forecast.map((forecastValue, index) => {
          const forecastTimestamp = new Date(timestamps[timestamps.length - 1]);
          forecastTimestamp.setSeconds(forecastTimestamp.getSeconds() + (index + 1));
          return [forecastTimestamp.toISOString(), forecastValue];
        }),
        smooth: true,
        lineStyle: { color: storedColors[rnti_mac] || "#000", typed: "dashed" },
        itemStyle: { color: storedColors[rnti_mac] || "#000" },
      });
    });

    return {
      tooltip: { trigger: "axis" },
      xAxis: { type: "time" },
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
        <ReactECharts option={getChartOptions()} style={{ height: "400px" }} />
      </CardContent>
    </Card>
  );
}
