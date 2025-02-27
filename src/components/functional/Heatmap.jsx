import { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { CollapsiblePre } from "@/components/ui/collapsiblepre";
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

const DynamicBarGraph = ({ attribute, onExtractData, className, ...props }) => {
  const { data, error } = useSWR("/api/macstats", fetcher, {
    refreshInterval: 1000, // Poll every second
  });

  const [chartData, setChartData] = useState({});
  const [selectedData, setSelectedData] = useState([]);
  const chartRef = useRef(null);

  const calculateSMA = (data, windowSize) => {
    let result = [];
    for (let i = 0; i < data.length; i++) {
      if (i < windowSize - 1) {
        result.push(null); // Not enough data to calculate SMA
      } else {
        const window = data.slice(i - windowSize + 1, i + 1);
        const sum = window.reduce((acc, val) => acc + val, 0);
        result.push(sum / windowSize);
      }
    }
    return result;
  };

  useEffect(() => {
    if (data && data.success) {
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
    }
  }, [data, attribute]);

  const getChartOptions = () => {
    const rntiColors = JSON.parse(localStorage.getItem("rntiColors")) || {};

    const colorArray = ["#6ed0ad", "#7a78e6", "#f78da7", "#cf2e2e", "#9b51e0"];

    Object.keys(chartData).forEach((rnti, index) => {
      if (!rntiColors[rnti]) {
        rntiColors[rnti] = colorArray[index % colorArray.length]; // Assign new color if missing
      }
    });

    localStorage.setItem("rntiColors", JSON.stringify(rntiColors));

    return {
      grid: {
        containLabel: true,
        borderColor: "#000", // Border color around the chart
        borderWidth: 2, // Border width
      },
      tooltip: {
        trigger: "axis",
      },
      xAxis: {
        type: "time",
        boundaryGap: false,
        axisLabel: {
          formatter: (value) => new Date(value).toLocaleTimeString(),
          rotate: 45,
          margin: 8,
          interval: 2,
          fontSize: 8,
        },
      },
      yAxis: {
        min: "dataMin",
        max: "dataMax",
        axisLabel: {
          formatter: (value) => value.toFixed(2),
        },
      },
      legend: { show: true, top: "0%" },
      series: [
        ...Object.entries(chartData).map(([rnti_mac, seriesData], index) => {
          const lineColor = rntiColors[rnti_mac];
          return {
            name: `RNTI ${rnti_mac}`,
            type: "bar",
            showSymbol: false,
            smooth: false,
            
            lineStyle: {
              width: 1,
              type: "solid",
              color: lineColor,
            },
            itemStyle: {
              color: lineColor,
            },
            data: seriesData.map((d) => [d.timestamp, d.value]),
          };
          
        }),

        ...Object.entries(chartData).map(([rnti_mac, seriesData]) => {
            const values = seriesData.map((d) => d.value);
            const sma = calculateSMA(values, 5);  // Calculate a 5-point moving average for trend line
            const trendLineColor = rntiColors[rnti_mac];

            return {
              name: `Trend RNTI ${rnti_mac}`,
              type: "line",  // Trend line
              smooth: true,
              lineStyle: {
                width: 2,
                type: "solid",
                color: trendLineColor, // Color of trend line
              },
              itemStyle: {
                color: trendLineColor,  // Same color as line for symbols
              },
              data: seriesData.map((d, index) => [d.timestamp, sma[index]]),
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
        style={{ marginLeft: "10px", height: "30vh", width: "100%" }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "10px",
          marginLeft: "auto",
        }}
      >
     

        {Object.keys(selectedData).length > 0 && (
          <CollapsiblePre
            style={{ marginLeft: 0 }}
            jsonData={JSON.stringify(selectedData, null, 2)}
          />
        )}
      </div>
    </div>
  );
};

export default DynamicBarGraph;
