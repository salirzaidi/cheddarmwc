'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useState,useEffect } from 'react';
import Image from 'next/image';
import MonacoEditor from './MonacoEditor';
export default function CodeGenUI() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 5,
    api: "/api/purechat", // Ensure this points to your API endpoint
  });

  const [code, setCode] = useState(undefined);



  useEffect(() => {
    fetch('/code/xApp.py')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(data => {
        setCode(data);
      })
      .catch(error => {
        console.error('Error loading default code:', error);
      });
     
      
  
  
    }, []);

    const contentChange = (content) => {
        setCode(content);
        //console.log('Editor Content:', content);
      };
    
    
  return (
    <div className="flex flex-col w-full  py-24 ">
         
      {messages.map(m => (
        <div key={m.id} className="whitespace-pre-wrap">
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {m.role==="user"?"Submitted Request": <>
          <MonacoEditor initialValue={m.content} parentHook={contentChange}  ></MonacoEditor>
          </>}
     
        </div>
      ))}
     
      <form
        className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl space-y-2"
        onSubmit={event => {
          handleSubmit(event);}
        }
      >
        
        <input
          className="w-full p-2"
        
          value={code && "Generate code for the Xapp by modifying the code with this prompt. Add condition on ul_aggr_prb for a specific a rnti 4001, as 3000. If the value is lower than this then it should print anomaly detected. Only return code with logic reasoning added as comments. Do not add reasoning at the end. Code is "+code}
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}