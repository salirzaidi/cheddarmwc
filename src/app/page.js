'use client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import  MacStatsChart  from '@/components/functional/MacStatsChart';
import { AIUI } from '@/components/functional/AIUI';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useCallback, useEffect, useState } from "react";
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

export default function Home() {

  const [extractedData, setExtractedData] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [antoggle, setAnToggle] = useState(false);

  const [status, setStatus] = useState(null);

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

  return (
  
  <>
    <header className="relative flex flex-col items-center justify-center text-center bg-gray-800 text-zinc-400 p-10 overflow-hidden h-[30vh]">
 <div className="absolute inset-0 w-full h-full z-1">
    <video preload="auto" autoPlay playsInline loop  muted  ><source src="/assets/Hero_colour_background.mp4" type="video/mp4"/></video>
             </div>

          
  <div className="relative z-10 text-white w-[50vw]">
  <h1
                className="text-4xl font-bold  mb-4 " 
                
                style={{ marginLeft:"auto", marginRight:"auto", padding:"10px"}}
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
<div  className="relative z-10 text-white w-full h-[8vh]" style={{background:"#6ed0ad", textAlign:"center"}}>
   <h2
                className="text-2xl  mb-2 " 
                
                style={{color:"#0d2630", marginLeft:"auto", marginRight:"auto", padding:"2vh"}}
              >
                Mobile World Congress 2025
              </h2></div>  
      
      <section className="grid  gap-6 p-10">


      <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">

      
       <WeatherCard></WeatherCard>
      

    
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

      {/* Card 3: Counter 2 */}
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

      {/* Card 4: Toggle Button */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration and Control</CardTitle>
        </CardHeader>
        <CardContent>
          xApp 1:
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* The large circle indicator */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: toggle ? '#6ed0ad' : '#f78da7',
          transition: 'background-color 0.3s ease',
        }}
      />
      
      {/* The Switch component */}
      <Switch checked={toggle} onCheckedChange={handleToggleChange} />
      
      {/* The text */}
      <p style={{ margin: 0 }}>{toggle ? 'On' : 'Off'}</p>
    </div>


         xApp2:
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* The large circle indicator */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: antoggle ? '#6ed0ad' : '#f78da7',
          transition: 'background-color 0.3s ease',
        }}
      />
      
      {/* The Switch component */}
      <Switch checked={antoggle} onCheckedChange={handleActualXapp} />
      
      {/* The text */}
      <p style={{ margin: 0 }}>{antoggle ? 'On' : 'Off'}</p>
    </div>
        

        <div>
      <Button onClick={handleClearData} className="m-4 p-4">Clear All Data</Button>
      {status && <p>{status}</p>}
    </div>
         
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
                <MacStatsChart attribute={"dl_aggr_prb"} onExtractData={setExtractedData}></MacStatsChart>
              </TabsContent>
              <TabsContent value="uplink" className="flex-1 flex flex-col">
                <MacStatsChart attribute={"ul_aggr_prb"} onExtractData={setExtractedData}></MacStatsChart>
              </TabsContent>
            </Tabs>
      </Card>
      </div>
  
   </div>
      </section>
      </>
  
  );
}

