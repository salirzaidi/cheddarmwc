import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { TimeSeriesUI } from "./TimeSerieUI";
import { ToolInvocation } from 'ai';


const AIUI = forwardRef(({ prompt, onSubmit, data, extractedData }, ref) => {
  const [chart, setChart] = useState(false);
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 5,

    async onToolCall({ toolCall }) {
      if (toolCall.toolName === 'anomal') {
        setChart(true);
        return "Ali";
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
    <div className="flex flex-col w-full max-w-md py-24 mx-auto">
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap">
          {m.role === "user" ? "User: " : "AI: "}
          {
(m.content.indexOf("[{") !== -1) ? "Data and Prompt submitted.":m.content        
          }
          {m.toolInvocations ? (
            <>
            <pre>{JSON.stringify(m.toolInvocations, null, 2)}</pre>
            <pre>{m.toolInvocations.toolName}</pre>
            </>
             
              
            
            
          ) : (
            <p>{(m.content.indexOf("[{") !== -1) ? "Data and Prompt submitted.":m.content}</p>
          )}
        </div>
      ))}

      <form onSubmit={handleFormSubmit}>
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />

        {/* Hidden submit button */}
        <button ref={hiddenSubmitButtonRef} type="submit" style={{ display: "none" }} />
      </form>

     {chart?<TimeSeriesUI extractedData={extractedData}></TimeSeriesUI>: <div>No Interactive Tool</div>}
    </div>
  );
});

export default AIUI;
