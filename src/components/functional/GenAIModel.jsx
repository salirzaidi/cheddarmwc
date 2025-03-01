import { useChat } from "@ai-sdk/react";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const GenUI = forwardRef(({ promptnew, data }, ref) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [means, setMeans] = useState({});
  
  // Using the `useChat` hook to manage messages and chat input
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 5,
    api: "/api/purechat", // Ensure this points to your API endpoint
  });

  // Automatically set the prompt with the extractedData and submit the prompt
  useEffect(() => {
    if (promptnew && data) { 
      handleInputChange({ target: { value: promptnew + JSON.stringify(data) } });
    }
  }, [promptnew, handleInputChange, data]);

  // Function to calculate the mean of values for each RNTI
  const calculateMeans = (data) => {
    const calculatedMeans = {};

    Object.keys(data).forEach((rnti) => {
      const values = data[rnti];
      const mean = values.reduce((acc, curr) => acc + curr.value, 0) / values.length;
      calculatedMeans[rnti] = mean;
    });

    return calculatedMeans;
  };

  // Handle new messages from AI
  useEffect(() => {
    const aiMessage = messages.find(m => m.role === 'AI' && m.content.indexOf("{") !== -1);
    console.log(aiMessage)

    if (aiMessage) {
      try {
        // Parse the AI response if it's in JSON format
        const parsedData = JSON.parse(aiMessage.content);

        // Calculate the means for each RNTI in the response
        const calculatedMeans = calculateMeans(parsedData);

        // Set the means state
        setMeans(calculatedMeans);
      } catch (error) {
        console.error("Error parsing AI response:", error);
      }
    }
  }, [messages]);

  // Expose the triggerSubmit function to parent via ref
  useImperativeHandle(ref, () => ({
    triggerSubmit: () => {
      if (!isSubmitting) {
        setIsSubmitting(true);
        handleSubmit(); // Manually trigger submission if needed
      }
    },
  }));

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submission

    setIsSubmitting(true);
    handleSubmit(e); // Submit the form
    setTimeout(() => setIsSubmitting(false), 500); // Reset after a short delay
  };

  return (
    <Card className="flex flex-col w-full max-w-md py-24 mx-auto">
      <CardHeader>
        <CardTitle>AI Predictions</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="whitespace-pre-wrap">
              {m.role === 'user' ? 'User: ' : 'AI: '}
              {m.content}
           
            </div>
          ))}
        </div>

        {/* Render the means as cards if available */}
        <div className="space-y-4 mt-6">
          {Object.keys(means).map((rnti) => (
            <Card key={rnti} className="bg-blue-50">
              <CardHeader>
                <CardTitle>RNTI: {rnti}</CardTitle>
              </CardHeader>
              <CardContent>
                <div>Mean Value: {means[rnti].toFixed(2)}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Form element to handle the submission */}
        <form onSubmit={handleFormSubmit}>
          <input
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />

          {/* Hidden submit button */}
          <button type="submit" className="hidden" />
        </form>
      </CardContent>
    </Card>
  );
});

export default GenUI;
