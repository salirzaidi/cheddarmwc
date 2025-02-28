'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function SoundLevelVisualizer({ attribute }) {
  const { data, error } = useSWR('/api/macstats', fetcher, { refreshInterval: 1000 });
  const [chartData, setChartData] = useState({});
  const canvasRefs = useRef({});

  const calculateSMA = (data, windowSize) => {
    let result = [];
    for (let i = 0; i < data.length; i++) {
      if (i < windowSize - 1) {
        result.push(null);
      } else {
        const window = data.slice(i - windowSize + 1, i + 1);
        const sum = window.reduce((acc, val) => acc + val.value, 0);
        result.push(sum / windowSize);
      }
    }
    return result;
  };

  useEffect(() => {
    if (data && data.success) {
      const groupedData = {};
      const latestRNTIs = new Set(data.data.map((entry) => entry.rnti_mac));

      latestRNTIs.forEach((rnti_mac) => {
        groupedData[rnti_mac] = data.data
          .filter((entry) => entry.rnti_mac === rnti_mac && entry[attribute] !== null)
          .map((entry) => ({ timestamp: entry.tstamp / 1000, value: parseFloat(entry[attribute]) }))
          .filter((point) => !isNaN(point.value));
      });
      setChartData(groupedData);
    }
  }, [data, attribute]);

  useEffect(() => {
    Object.entries(chartData).forEach(([rnti, seriesData]) => {
      const canvas = canvasRefs.current[rnti];
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(225,225,225,0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const padding = 40;
      
      const minValue = Math.min(...seriesData.map((d) => d.value));
      const maxValue = Math.max(...seriesData.map((d) => d.value));
      const barWidth = (width - 2 * padding) / seriesData.length;
      
      const smaValues = calculateSMA(seriesData, 5);
      
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      
      seriesData.forEach((d, i) => {
        const x = padding + i * barWidth;
        const y = height - padding - ((d.value - minValue) / (maxValue - minValue)) * (height - 2 * padding);
        
        const r = Math.floor((d.value / maxValue) * 255);
        const g = Math.floor((1 - d.value / maxValue) * 255);
        const b = 150;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, barWidth - 2, height - y - padding);
        
        if (smaValues[i] !== null) {
          const smaY = height - padding - ((smaValues[i] - minValue) / (maxValue - minValue)) * (height - 2 * padding);
          if (i === 0) {
            ctx.moveTo(x + barWidth / 2, smaY);
          } else {
            ctx.lineTo(x + barWidth / 2, smaY);
          }
        }
      });
      ctx.stroke();
    });
  }, [chartData]);

  if (error) return <p>Error loading data...</p>;
  if (!data || Object.keys(chartData).length === 0) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(chartData).map(([rnti]) => (
        <Card key={rnti} className="p-4 bg-gradient-to-br from-zinc-600 to-zinc-800 shadow-lg rounded-lg">
          <h2 className="text-lg font-semibold text-white text-center mb-2">RNTI {rnti}</h2>
          <canvas ref={(el) => (canvasRefs.current[rnti] = el)} width={400} height={200} className="w-full" />
        </Card>
      ))}
    </div>
  );
}
