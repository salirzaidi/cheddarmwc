'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useState,useEffect } from 'react';
import Image from 'next/image';
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


  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map(m => (
        <div key={m.id} className="whitespace-pre-wrap">
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {m.content}
     
        </div>
      ))}
      <div>{code && code}</div>

      <form
        className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl space-y-2"
        onSubmit={event => {
          handleSubmit(event);}
        }
      >
        
        <input
          className="w-full p-2"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}