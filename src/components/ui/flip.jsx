'use client';

import { useState, useEffect } from 'react';

export default function BreakpointCounter({ breakpoints, threshCross }) {
  const [threshold, setThreshold] = useState(5); // Default threshold

  const handleThresholdChange = (event) => {
    setThreshold(Number(event.target.value));
  };

  useEffect(() => {
    // Check for threshold crossing whenever breakpoints or threshold changes
    Object.entries(breakpoints).forEach(([rnti, arr]) => {
      if (arr.length >= threshold) {
        console.log(`Threshold crossed for RNTI: ${rnti}`);
        threshCross(rnti); // Trigger the parent callback
      }
    });
  }, [breakpoints, threshold, threshCross]); // Re-run effect when breakpoints or threshold changes

  return (
    <div className="flex flex-col gap-4">
      {/* Dropdown for selecting threshold */}
      <div className="p-4 bg-gray-900 text-white rounded-lg shadow-lg">
        <label htmlFor="threshold" className="mr-2">Select Threshold:</label>
        <select
          id="threshold"
          value={threshold}
          onChange={handleThresholdChange}
          className="p-2 rounded bg-gray-700 text-white"
        >
          {[...Array(10).keys()].map((i) => (
            <option key={i} value={(i + 1) * 2}>
              {(i + 1) * 2}
            </option>
          ))}
        </select>
      </div>

      {/* Display RNTI and breakpoint count */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(breakpoints).map(([rnti, arr]) => {
          const isThresholdCrossed = arr.length >= threshold;

          return (
            <div
              key={rnti}
              className={`p-4 rounded-lg shadow-lg ${isThresholdCrossed ? 'bg-pink-500 text-white' : 'bg-indigo-800 text-white'}`}
            >
              <h2 className="text-lg font-semibold">RNTI {rnti}</h2>
              <p>Breakpoints: {arr.length}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
