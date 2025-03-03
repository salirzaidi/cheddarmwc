'use client';

import { useRef, useState,useEffect } from 'react';
import MonacoEditor from './MonacoEditor';
export default function XAppUI() {

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
         
          code && <MonacoEditor parentHook={contentChange} initialValue={code}> </MonacoEditor>
 
  );
}