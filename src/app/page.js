'use client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import MacStatsChart from '@/components/functional/MacStatsChart';
import  AIUI  from '@/components/functional/AIUI';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useCallback, useEffect, useState , useRef } from "react";
import { TimeSeriesUI } from '@/components/functional/TimeSerieUI';
import TestComp from '@/components/functional/TestComp';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from '@/components/ui/switch'
import WeatherCard from '@/components/ui/weathercard';
import FlipCounter from '@/components/ui/flip';
import DynamicBarChart from '@/components/functional/Heatmap';
import SoundLevelVisualizer from '@/components/functional/SoundLevel';
import LocationCard from '@/components/ui/locationcard';
import CurrentTimeCard from '@/components/ui/time';
import BreakpointBarGraph from '@/components/ui/flip';
import { GemUI } from '@/components/functional/GeminiAI';

export default function Home() {

  const [extractedData, setExtractedData] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [antoggle, setAnToggle] = useState(false);
  const [agentoggle, setAgenToggle] = useState(false);
  const [rntiCur, setRNTICur] = useState(null);
  const [status, setStatus] = useState(null);
  const [data, currentData] = useState([]);

  const aiUIRef = useRef(null);
  const [prompt, setPrompt] = useState('Hello AI, how are you?');
  const [response, setResponse] = useState('');

  // Handle form submission in parent component
  const handleSubmit = (inputData) => {
    // Handle the response from AIUI form submission here
    console.log('Submitted input:', inputData);
    setResponse(`AI Response for: ${inputData}`);
  };



  const handleClearData = async () => {
    const response = await fetch('/api/cleardata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (data.message) {
      setStatus(data.message); // Success message
    } else if (data.error) {
      setStatus(`Error: ${data.error}`); // Error message
    }
  };
  const handleToggleChange = async (checked) => {
    setToggle(checked);

    const response = await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ toggle: checked ? 'on' : 'off' }), // Send the toggle state
    });

    const data = await response.json();
    console.log(data.message); // Logs "Data generation started." or "Data generation stopped."
  };


  const handleActualXapp = async (checked) => {
    setAnToggle(checked);


  };

  const handleAgentStatus = async (checked) => {
    setAgenToggle(checked);


  };

  const [ulbreakpoints, setULBreakpoints] = useState({});
  const [dlbreakpoints, setDLBreakpoints] = useState({});

  // Callback function to receive breakpoints data from MacStatsChart
  const handleULBreakpointsChange = (newBreakpoints) => {
    setULBreakpoints(newBreakpoints);
  };

  const handleDLBreakpointsChange = (newBreakpoints) => {
    setULBreakpoints(newBreakpoints);
  };

  const handleThresholdCross = (rnti) => {
    setRNTICur(rnti);
    console.log("Threshold crossed");
    setPrompt("Perform Anomaly detection on the provided data set. Use appropriate tool and show reasoning traces.");
    currentData(extractedData[rnti]); // Use rnti instead of rntiCur
  };
  
  useEffect(() => {
    if (agentoggle && rntiCur !== null && data && aiUIRef.current) {
      console.log("Waiting before submitting data to AIUI...");
  
      const timeout = setTimeout(() => {
        console.log("Submitting data to AIUI...");
        if (data.length > 0) {
          aiUIRef.current?.triggerSubmit();
        }
      }, 100); // 100ms delay
  
      return () => clearTimeout(timeout); // Cleanup function to prevent multiple triggers
    }
  }, [rntiCur, agentoggle, data]);
  
 


  return (

    <>
      <header className="relative flex flex-col items-center justify-center text-center bg-gray-800 text-zinc-400 p-10 overflow-hidden h-[30vh]">
        <div className="absolute inset-0 w-full h-full z-1">
          <video preload="auto" autoPlay playsInline loop muted  ><source src="/assets/Hero_colour_background.mp4" type="video/mp4" /></video>
        </div>


        <div className="relative z-10 text-white w-[50vw]">
          <h1
            className="text-4xl font-bold  mb-4 "

            style={{ marginLeft: "auto", marginRight: "auto", padding: "10px" }}
          >
            Communications Hub for Empowering Distributed clouD computing Applications and Research
          </h1>
          <motion.h1
            className="text-2xl  mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Next generation connectivity for a smarter tomorrow
          </motion.h1>
        </div>


      </header>
      <div className="relative z-10 text-white w-full h-[8vh]" style={{ background: "#6ed0ad", textAlign: "center" }}>
        <h2
          className="text-2xl  mb-2 "

          style={{ color: "#0d2630", marginLeft: "auto", marginRight: "auto", padding: "2vh" }}
        >
          Mobile World Congress 2025
        </h2></div>

      <section className="grid  gap-6 p-10">


        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">


            <div className="grid grid-rows-2 gap-4">


              <WeatherCard></WeatherCard>
              <LocationCard></LocationCard>
            </div>


            <div className="grid grid-rows-2 gap-2">

              <Card>
                <CardHeader>
                  <CardTitle>PUSCH SNR</CardTitle>
                </CardHeader>
                <CardContent>
                  <DynamicBarChart
                    attribute="pusch_snr"
                    apiUrl="/api/macstats" // Your data fetching URL
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Configuration and Control</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    {/* First Column: Toggles and Button */}
                    <div className="space-y-4">
                      <div>
                        <h3>Emulation</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {/* Toggle for Emulation */}
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: toggle ? '#6ed0ad' : '#f78da7',
                              transition: 'background-color 0.3s ease',
                            }}
                          />
                          <Switch checked={toggle} onCheckedChange={handleToggleChange} />
                          <p>{toggle ? 'On' : 'Off'}</p>
                        </div>
                      </div>

                      <div>
                        <h3>Testbed</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {/* Toggle for Testbed */}
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: antoggle ? '#6ed0ad' : '#f78da7',
                              transition: 'background-color 0.3s ease',
                            }}
                          />
                          <Switch checked={antoggle} onCheckedChange={handleActualXapp} />
                          <p>{antoggle ? 'On' : 'Off'}</p>
                        </div>
                      </div>

                      <div>
                        <h3>Agent</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {/* Toggle for Agent */}
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: agentoggle ? '#6ed0ad' : '#f78da7',
                              transition: 'background-color 0.3s ease',
                            }}
                          />
                          <Switch checked={agentoggle} onCheckedChange={handleAgentStatus} />
                          <p>{agentoggle ? 'On' : 'Off'}</p>
                        </div>
                      </div>

                      <div>
                        <Button onClick={handleClearData} className="p-2 m-4">Clear All Data</Button>
                        {status && <p>{status}</p>}
                      </div>
                    </div>

                    {/* Second Column: Configuration Table */}
                    <div className="space-y-5 w-[2vw]">
                      <h2>RAN Configuration</h2>
                      <table className="min-w-full border-collapse border border-gray-300">
                        <thead>
                          <tr>
                            <th className="border border-gray-300 px-4 py-2">Component</th>
                            <th className="border border-gray-300 px-4 py-2">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">SDR</td>
                            <td className="border border-gray-300 px-4 py-2"><select className="p-2 border rounded">
                              <option value="option1">B210</option>
                              <option value="option2">X310</option>
                            </select></td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">Core</td>
                            <td className="border border-gray-300 px-4 py-2"><select className="p-2 border rounded">
                              <option value="option1">OAI</option>
                              <option value="option2">O5GS</option>
                            </select></td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">LLM</td>
                            <td className="border border-gray-300 px-4 py-2"><select className="p-2 border rounded">
                              <option value="option1">Gemini</option>
                              <option value="option2">OpenAI</option>
                            </select></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Time Component at the Bottom */}
                  <CurrentTimeCard />
                </CardContent>
              </Card>



            </div>

            <div className="grid grid-rows-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>PUCCH SNR</CardTitle>
                </CardHeader>
                <CardContent>
                  <DynamicBarChart
                    attribute="pucch_snr"
                    apiUrl="/api/macstats" // Your data fetching URL
                  />

                </CardContent>
              </Card>
              <Card >
                <CardHeader>
                  <CardTitle> BLER Stats:</CardTitle>
                </CardHeader>
                <CardContent>
                <div>
      <h3>Detected Breakpoints:</h3>
     <BreakpointBarGraph breakpoints={ulbreakpoints} threshCross={handleThresholdCross}></BreakpointBarGraph>

    </div>
                </CardContent>
              </Card>

            </div>
            <Card>
              <CardHeader>
                <CardTitle>UL and DL TBs</CardTitle>
              </CardHeader>
              <CardContent>


                <p>UL TBs:</p>
                <SoundLevelVisualizer attribute="ul_aggr_tbs" ></SoundLevelVisualizer>

                <p>DL TBs:</p>
                <SoundLevelVisualizer attribute="dl_aggr_tbs" ></SoundLevelVisualizer>
              </CardContent>
            </Card>
          </div>

          {/* Second Row: Two Full-Width Cards */}
          <div className="grid grid-cols-3 gap-4">







            <Card className="flex flex-col h-full">
              <Tabs defaultValue="downlink" className="w-[36vw]">
                <div className="flex items-center justify-between px-4 py-2 ">

                  <TabsList>
                    <TabsTrigger value="downlink" >Downlink</TabsTrigger>
                    <TabsTrigger value="uplink">Uplink</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="downlink" className="flex-1 flex flex-col">
                  <MacStatsChart attribute={"dl_aggr_prb"} onExtractData={setExtractedData}  onBreakpointsChange={handleDLBreakpointsChange}></MacStatsChart>
                </TabsContent>
                <TabsContent value="uplink" className="flex-1 flex flex-col">
                  <MacStatsChart attribute={"ul_aggr_prb"} onExtractData={setExtractedData}  onBreakpointsChange={handleULBreakpointsChange}></MacStatsChart>
                </TabsContent>
              </Tabs>
            </Card>


            <Card className="flex flex-col h-full col-span-2">
              <Tabs defaultValue="downlink" className="w-[36vw]">
                <div className="flex items-center justify-between px-4 py-2 ">

                  <TabsList>
                    <TabsTrigger value="downlink" >Downlink</TabsTrigger>
                    <TabsTrigger value="uplink">Uplink</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="downlink" className="flex-1 flex flex-col">
                <AIUI ref={aiUIRef} prompt={prompt} onSubmit={handleSubmit} data={data} />

                </TabsContent>
                <TabsContent value="uplink" className="flex-1 flex flex-col">
                  
                </TabsContent>
              </Tabs>
            </Card>
          </div>

        </div>
      </section>
    </>

  );
}

