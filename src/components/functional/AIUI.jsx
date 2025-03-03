import { useChat } from "@ai-sdk/react";
import { useRef, useEffect,useLayoutEffect, forwardRef, useImperativeHandle, useState } from "react";
import { TimeSeriesUI } from "./TimeSerieUI";
import { TimeSeriesNUI } from "./TimeSeriesNUI";
import { ToolInvocation } from 'ai';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import InferenceUI from "./LSTMUI";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import  GenUI  from "./GenAIModel";
import MonacoEditor from "./MonacoEditor";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleAction, ChatBubbleActionWrapper } from '@/components/ui/chat/chat-bubble';
import { ChatMessageList } from '@/components/ui/chat/chat-message-list';
import PoseNetCanvas from "./PoseNetCanvas";
import XAppUI from "./xAppOrig";
import CodeGenUI from "./CodeGenUI";


const AIUI = forwardRef(({ prompt, onSubmit, data, extractedData }, ref) => {
  const [chart, setChart] = useState(false);
  const [tmMean,settmMean] = useState();
  const [lstmMean,setlstmMean] = useState();
  const GenUIRef = useRef();
  const [isGenerating, setIsGenerating] = useState(false);


  const { messages, setMessages, input, handleInputChange, handleSubmit, isLoading, reload } = useChat({
    maxSteps: 5,
    api: "/api/chat",
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === 'anomal') {
        setChart(true);
        return "Ali";
      }
    },
     onResponse(response) {
        if (response) {
          console.log(response);
          setIsGenerating(false);
        }
      },
      onError(error) {
        if (error) {
          setIsGenerating(false);
        }
      },
    });
  const hiddenSubmitButtonRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  
  // Set input when prompt changes
  useEffect(() => {
    if (prompt && data) { 
      handleInputChange({ target: { value: prompt+ JSON.stringify(data) } });
    }
  }, [prompt, handleInputChange,data]);

  useEffect(() => {
    if (chart && GenUIRef.current) {
      setIsGenerating(true);

      // Make sure GenUI is rendered and then trigger the submit
      GenUIRef.current?.triggerSubmit();
      console.log("print")
    }
  }, [GenUIRef.current]); // This hook runs when the chart state changes

  // Expose triggerSubmit to parent
  useImperativeHandle(ref, () => ({
    triggerSubmit: () => {
      if (!isSubmitting) {
        setIsSubmitting(true);
        hiddenSubmitButtonRef.current?.click();
      }
    },
  }));

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submission

    setIsSubmitting(true);
    onSubmit(input); // Send input to parent
    handleSubmit(e);
    setTimeout(() => setIsSubmitting(false), 500); // Reset after a short delay
  };

  
  return (
    <div className="flex flex-col w-full  py-2 mx-10">
    
    <Tabs defaultValue="xapp" className="w-[90%]">
                <div className="flex  justify-between px-4 py-2 ">

                  <TabsList>
                    <TabsTrigger value="xapp" >xApp Original</TabsTrigger>
                    <TabsTrigger value="genai">GenAI Agent</TabsTrigger>
                    <TabsTrigger value="codegen">Code Generation</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="xapp" className="flex-1 flex flex-col">
              <XAppUI/>
                </TabsContent>





  
                <TabsContent value="genai" className="flex-1 flex flex-col col-span-2">
  <ChatMessageList>
    {messages.map((m) => (
      <div key={m.id} className="whitespace-pre-wrap">
        <ChatBubble variant={m.role === "user" ? "sent" : "received"}>
          <ChatBubbleAvatar src="" fallback={m.role === "user" ? "👨🏽" : "🤖"} />
          <ChatBubbleMessage>
            {m.content.includes("[{") ? "Data and Prompt submitted." : m.content}

            {m.toolInvocations && (
                  <>
              <details className="mt-2">
    <summary className="cursor-pointer text-blue-500 hover:underline">{m.toolInvocations.toolName}</summary>
    <pre className="overflow-x-auto p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">
      {JSON.stringify(m.toolInvocations, null, 2)}
    </pre>
  </details>
              
          
               
              </>
            )}
          </ChatBubbleMessage>
        </ChatBubble>
      </div>
    ))}
  </ChatMessageList>



  {/* Hidden input field and form */}
  <form onSubmit={handleFormSubmit}>
    <input
      className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
      value={input}
      placeholder="Say something..."
      onChange={handleInputChange}
      style={{ display: "none" }}
    />

    {/* Hidden submit button */}
    <button ref={hiddenSubmitButtonRef} type="submit" style={{ display: "none" }} />
  </form>

              
  {chart?<><TimeSeriesNUI extractedData={extractedData} setMeanPrediction={settmMean}></TimeSeriesNUI> </>:  <div></div>}
     {tmMean && Object.entries(tmMean).length > 0 ? (
  <div className="flex flex-wrap gap-4">
    {Object.entries(tmMean).map(([rnti, meanValue]) => (
      <div key={rnti} className="w-[200px]">
        <Card className="shadow-lg my-2">
          <CardHeader>
            <CardTitle>Mean Prediction for RNTI {rnti} TM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{meanValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
    ))}
  </div>
) : (
  <div>No predictions available</div>
)}

{chart?<InferenceUI extractedData={extractedData} setMeanPrediction={setlstmMean}></InferenceUI>: <div></div>}
     {lstmMean && Object.entries(lstmMean).length > 0 ? (
  <div className="flex flex-wrap gap-4">
    {Object.entries(lstmMean).map(([rnti, meanValue]) => (
      <div key={rnti} className="w-[200px]">
        <Card className="shadow-lg my-2">
          <CardHeader>
            <CardTitle>Mean Prediction for RNTI {rnti} LSTM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{meanValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
    ))}
  </div>
) : (
  <div>No predictions available</div>
)}


{

chart?        
      <><GenUI ref={GenUIRef} data={extractedData} command={1} promptnew={"Use this data to generate forecast for next five points for timeseries associated with each unique RNTI. So five points and associated RNTI. Do not show the python code etc. just return mean value for these five point forecast. In one line also explain approch you used."} ></GenUI> </>:  <div></div>} 


   
                </TabsContent>
                <TabsContent value="codegen" className="flex-1 flex flex-col col-span-2">
  <CodeGenUI></CodeGenUI>
                </TabsContent>
             
  
              </Tabs>


    </div>
  );
});

export default AIUI;
