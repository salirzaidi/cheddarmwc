'use client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CardDemo } from '@/components/functional/ModelCard';
import { AIUI } from '@/components/functional/AIUI';

import { useCallback, useEffect, useState } from "react";
import { TimeSeriesUI } from '@/components/functional/TimeSerieUI';


export default function Home() {


  return (
  
  <>
    <header className="relative flex flex-col items-center justify-center text-center bg-gray-800 text-zinc-400 p-10 overflow-hidden h-[30vh]">
 <div className="absolute inset-0 w-full h-full z-1">
    <video preload="auto" autoPlay playsInline loop  muted  ><source src="/assets/Hero_colour_background.mp4" type="video/mp4"/></video>
             </div>

          
  <div className="relative z-10 text-white w-[50vw]">
  <h1
                className="text-3xl font-bold  mb-4 " 
                
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
<div  className="relative z-10 text-white w-full h-[10vh]" style={{background:"#6ed0ad", textAlign:"center"}}>
   <h2
                className="text-2xl  mb-4 " 
                
                style={{color:"#0d2630", marginLeft:"auto", marginRight:"auto", padding:"10px"}}
              >
                Mobile World Congress 2025
              </h2></div>  
      
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 p-10">
      <div className="flex space-x-4">
      <div className="h-[55vh] ">
   <CardDemo></CardDemo>
   </div>
   <div className="h-[55vh]" >
   <AIUI></AIUI>
   </div>
   <div className="h-[55vh]" >
   <TimeSeriesUI></TimeSeriesUI>
   </div>
   </div>
      </section>
      </>
  
  );
}

