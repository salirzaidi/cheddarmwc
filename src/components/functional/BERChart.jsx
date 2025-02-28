"use client";
import { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const fetcher = (url) => fetch(url).then((res) => res.json());

const BERChart = ({ attribute, className, ...props }) => {
  const { data, error } = useSWR("/api/macstats", fetcher, {
    refreshInterval: 1000, // Poll every second
  });

  const [chartData, setChartData] = useState({});
  const chartRef = useRef(null);

  useEffect(() => {
    if (data) {
      console.log("Fetched Data: ", data); // Debugging line

      if (data.success) {
        const groupedData = {};

        const latestRNTIs = new Set();

        // Get unique RNTIs from latest data
        data.data.forEach((entry) => latestRNTIs.add(entry.rnti_mac));

        latestRNTIs.forEach((rnti_mac) => {
          groupedData[rnti_mac] = data.data
            .filter((entry) => entry.rnti_mac === rnti_mac && entry[attribute] !== null)
            .map((entry) => ({
              timestamp: entry.tstamp / 1000, // Ensure timestamp is in milliseconds
              value: parseFloat(entry[attribute]),
            }))
            .filter((point) => !isNaN(point.value)); // Remove NaN values
        });

        setChartData(groupedData);
      } else {
        console.error("API response not successful");
      }
    } else {
      console.log("Data is undefined or null");
    }
  }, [data, attribute]);

  const getChartOptions = () => {
    const colorArray = ["#6ed0ad", "#7a78e6", "#f78da7", "#cf2e2e", "#9b51e0"];

    const rntiColors = JSON.parse(localStorage.getItem("rntiColors")) || {};

    Object.keys(chartData).forEach((rnti, index) => {
      if (!rntiColors[rnti]) {
        rntiColors[rnti] = colorArray[index % colorArray.length]; // Assign new color if missing
      }
    });

    // Save updated colors back to localStorage
    localStorage.setItem("rntiColors", JSON.stringify(rntiColors));

    return {
      grid: { containLabel: true },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "time",
        boundaryGap: false,
        inverse: true,
        axisLabel: {
          formatter: (value) => new Date(value).toLocaleTimeString(),
          rotate: 45,
          margin: 8, // Increase margin to create space
          interval: 2, // Show every second label to avoid overlap
          fontSize: 8, // Reduce font size if needed
        },
      },
      yAxis: {
        type: "log", // Set y-axis to logarithmic scale
        min: "dataMin",
        max: "dataMax",
        axisLabel: {
          formatter: (value) => value.toFixed(2),
        },
      },
      legend: { show: true, top: "0%" },
      
      series: [
        ...Object.entries(chartData).map(([rnti_mac, seriesData], index) => {
          const lineColor = rntiColors[rnti_mac]; // Get a color from the array

          return {
            name: `RNTI ${rnti_mac}`,
            type: "line",
            showSymbol: false,
            smooth: true,
        
            lineStyle: {
              width: 1,
              type: "solid",
              color: lineColor,
            },
            itemStyle: {
              color: lineColor, // Ensures the symbol color matches the line
            },
            data: seriesData.map((d) => [d.timestamp, d.value]),
          };
        }),
      ],
    };
  };

  if (error) return <p>Error loading data...</p>;
  if (!data || Object.keys(chartData).length === 0) return <p>Loading...</p>;

  return (
    <div>
      <ReactECharts
        ref={chartRef}
        option={getChartOptions()}
        style={{ marginLeft: "10px", height: "48.6vh", width: "30vw" }}
      />
    </div>
  );
};

export default BERChart;
