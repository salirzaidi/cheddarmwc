"use client";
import { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { CollapsiblePre } from '@/components/ui/collapsiblepre';
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


const fetcher = (url) => fetch(url).then((res) => res.json());

const MacStatsChart = ({ attribute, onExtractData, onBreakpointsChange, className, ...props }) => {
  const { data, error } = useSWR("/api/macstats", fetcher, {
    refreshInterval: 1000, // Poll every second
  });



  const [chartData, setChartData] = useState({});
  const [selectedData, setSelectedData] = useState([]);
  const chartRef = useRef(null);
  const [breakpoints, setBreakpoints] = useState({});

  const extractSelection = () => {
    const echartInstance = chartRef.current?.getEchartsInstance();
    if (echartInstance) {
      const zoom = echartInstance.getOption().dataZoom[0];

      // Determine start and end indices based on zoom percentage
      const startRatio = zoom.start / 100;
      const endRatio = zoom.end / 100;

      // Extract data for each RNTI separately
      const extractedData = Object.entries(chartData).reduce((acc, [rnti_mac, series]) => {
        const startIdx = Math.floor(startRatio * series.length);
        const endIdx = Math.floor(endRatio * series.length);
        acc[rnti_mac] = series.slice(startIdx, endIdx);
        return acc;
      }, {});

      setSelectedData(extractedData);
      onExtractData(extractedData); // Pass extracted data to parent
      
    }
  };


  const detectBreakpoints = (values) => {
    const breakpoints = [];
    const percentageThreshold = 20;

    for (let i = 1; i < values.length; i++) {
      const prevValue = values[i - 1];
      const currentValue = values[i];

      // Calculate the percentage difference between the current and previous value
      const percentageDiff = Math.abs((currentValue - prevValue) / prevValue) * 100;

      // If the percentage difference exceeds the threshold, consider it a breakpoint
      if (percentageDiff > percentageThreshold) {
        breakpoints.push(i);
      }
    }

    return breakpoints;

  };
  useEffect(() => {
    const chartInstance = chartRef.current?.getEchartsInstance();
    if (chartInstance) {
      chartInstance.on("dataZoom", handleZoomChange);
    }
    if (data && data.success) {
      const groupedData = {};
      const breakpointData = {};

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



      Object.entries(groupedData).forEach(([rnti_mac, series]) => {
        const values = series.map((point) => point.value);
        const detectedBreakpoints = detectBreakpoints(values); // Implement your detection logic

        // Store breakpoints as timestamps
        breakpointData[rnti_mac] = detectedBreakpoints.map((idx) => series[idx].timestamp);
      });
      setChartData(groupedData);
      setBreakpoints(breakpointData);
      onBreakpointsChange(breakpointData); // Pass breakpoints to the parent



    }
  }, [data, attribute]);


  const handleZoomChange = (params) => {
    const { start, end } = params.batch ? params.batch[0] : params;
    localStorage.setItem("zoomStart", start);
    localStorage.setItem("zoomEnd", end);
  };


  const colorArray = [
    "rgba(255, 99, 132, 0.5)",
    "rgba(54, 162, 235, 0.5)",
    "rgba(75, 192, 192, 0.5)",
    "rgba(153, 102, 255, 0.5)",
    "rgba(255, 159, 64, 0.5)"
  ];

  const getRandomColorFromArray = () => {
    const randomIndex = Math.floor(Math.random() * colorArray.length);
    return colorArray[randomIndex];
  };

  const getChartOptions = () => {
    const colorArray = ["#6ed0ad", "#7a78e6", "#f78da7", "#cf2e2e", "#9b51e0"];

    const rntiColors = {}; // Load existing colors

    Object.keys(chartData).forEach((rnti, index) => {
      if (!rntiColors[rnti]) {
        rntiColors[rnti] = colorArray[index % colorArray.length]; // Assign new color if missing
      }
    });

    // Save updated colors back to localStorage
    localStorage.setItem("rntiColors", JSON.stringify(rntiColors));
    const storedZoomStart = localStorage.getItem("zoomStart") || 0;
    const storedZoomEnd = localStorage.getItem("zoomEnd") || 100;

    return {
      grid: {
        containLabel: true
      },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "time",
        boundaryGap: false,
        inverse: true,
        axisLabel: {
          formatter: (value) => new Date(value).toLocaleTimeString(),
          rotate: 45,
          margin: 8, // Increase margin to create space
          interval: 2,  // Show every second label to avoid overlap
          fontSize: 8,  // Reduce font size if needed

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
      dataZoom: [
        { type: "inside", start: storedZoomStart, end: storedZoomEnd },
        { type: "slider", start: storedZoomStart, end: storedZoomEnd, fillerColor: 'rgba(175, 207, 241, 0.25)', dataBackground: { areaStyle: { color: "#6ed0ad", opacity: 1.0, }, height: "10" }, }
      ],
      visualMap: {
        show: false,  // Hide the visualMap itself
        pieces: [
          {
            gt: 0,
            lte: 100,
            color: "#ff0000", // Red for breakpoints
          },
        ],
        inRange: {
          color: "#ff0000", // Color of the breakpoints
        },
        outOfRange: {
          color: "#ddd", // Color for non-breakpoints
        },
      },
      series: [
        ...Object.entries(chartData).map(([rnti_mac, seriesData], index) => {
          const lineColor = rntiColors[rnti_mac]; // Get a color from the array

          return {
            name: `RNTI ${rnti_mac}`,
            type: "line",
            showSymbol: false,
            smooth: true,
            areaStyle: {
              opacity: 0.4,
              color: lineColor, // Use the selected line color
            },
            lineStyle: {
              width: 1,
              type: "solid",
              color: lineColor,
              // Prevent any residual markers

            },
            itemStyle: {
              color: lineColor, // Ensures the symbol color matches the line
            },
            data: seriesData.map((d) => [d.timestamp, d.value]),
          };
        }),
        // Add a scatter series for breakpoints (visual map will apply color)


        // Add a band around the change points using markArea
        ...Object.entries(breakpoints).map(([rnti_mac, bpTimestamps], index) => {
          return {

            type: "line",
            markArea: {
              itemStyle: {
                color: "rgba(178, 115, 223, 0.2)", // Semi-transparent red for the band
              },
              data: bpTimestamps
                .map((timestamp) => {
                  const startPoint = chartData[rnti_mac]?.find((d) => d.timestamp === timestamp);
                  if (!startPoint) return null; // If no valid point, skip it

                  const startTimestamp = timestamp - 100; // Small band before the breakpoint
                  const endTimestamp = timestamp + 100; // Small band after the breakpoint
                  return [
                    { xAxis: startTimestamp }, // Start of the band
                    { xAxis: endTimestamp }, // End of the band
                  ];
                })
                .filter((band) => band !== null), // Remove null bands
            },
            data: [], // Empty, as we're only displaying the markArea
          };
        }),
      ]
    };
  };


  if (error) return <p>Error loading data...</p>;
  if (!data || Object.keys(chartData).length === 0) return <p>Loading...</p>;
  const onChartEvents = {
    dataZoom: (params) => { handleZoomChange(params) },
  };
  return (


    <div>
      <ReactECharts ref={chartRef} option={getChartOptions()} style={{ marginLeft: "10px", height: "48.6vh", width: "30vw" }} onEvents={onChartEvents} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", marginTop: "10px", marginLeft: "auto" }}>
        <Button onClick={extractSelection} className="bg-indigo-900 text-xl">Extract Selected Data</Button>

        {Object.keys(selectedData).length > 0
          && (

            <CollapsiblePre style={{ marginLeft: 0 }} jsonData={JSON.stringify(selectedData, null, 2)}></CollapsiblePre>
          )}
      </div>
    </div>
  );
};

export default MacStatsChart;
