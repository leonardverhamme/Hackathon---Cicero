import { useState, useEffect, useRef } from "react";
import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

interface StreamingCardProps {
  title: string;
  sessionId: string;
  streamType: "summary" | "legal_assessment" | "risk_assessment";
  onStreamComplete: (finalContent: string) => void;
  isReadyToStream: boolean; // Control when the card should start streaming
  // This prop is needed for the risk assessment, which depends on the legal assessment text
  postBody?: Record<string, any>;
}

const API_BASE_URL = "http://localhost:8001";

export function StreamingCard({
  title,
  sessionId,
  streamType,
  onStreamComplete,
  isReadyToStream,
  postBody,
}: StreamingCardProps) {
  const [content, setContent] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("Waiting...");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Use a ref to accumulate the final content without causing re-renders
  const contentRef = useRef<string>("");

  useEffect(() => {
    // Only start if the card is ready and we have a session ID
    if (!isReadyToStream || !sessionId) return;

    const startStreaming = async () => {
      setIsStreaming(true);

      // *** IMPLEMENTED FAKE UI STEPS AS REQUESTED ***
      if (streamType === "summary") {
        setStatusMessage("Analyzing transcript...");
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
      } else if (streamType === "legal_assessment") {
        setStatusMessage("Querying Weaviate legal vector store...");
        // The actual 3s delay is now on the backend, so the frontend
        // will show this message until the first token arrives.
      } else if (streamType === "risk_assessment") {
        setStatusMessage("Generating final recommendations...");
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      await fetchStream();
    };

    startStreaming();

  }, [isReadyToStream, sessionId]);

  const fetchStream = async () => {
    // Use the dedicated endpoints now
    const url = `${API_BASE_URL}/stream_${streamType}/${sessionId}`;
    const options: RequestInit = {
        method: 'POST', // All endpoints are now POST for consistency
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // If there's a postBody (for risk_assessment), add it.
    if (postBody) {
        options.body = JSON.stringify(postBody);
    }

    try {
      const response = await fetch(url, options);
      if (!response.ok || !response.body) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // *** THIS IS THE CORRECTED STREAMING LOGIC ***
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.substring(6);
                try {
                    // The data is a JSON string, so we parse it
                    const parsed = JSON.parse(data);
                    setContent((prev) => prev + parsed);
                    contentRef.current += parsed;
                } catch (e) {
                    // Handle non-JSON data like error messages
                    if (data.startsWith('[Server Error')) {
                       setContent((prev) => prev + data);
                       contentRef.current += data;
                    }
                }
            }
        }
      }

    } catch (error) {
      console.error("Streaming failed:", error);
      const errorMessage = `\n**Error:** ${(error as Error).message}`;
      setContent((prev) => prev + errorMessage);
      contentRef.current += errorMessage;
    } finally {
      setIsStreaming(false);
      setIsComplete(true);
      onStreamComplete(contentRef.current); // Pass the final, complete content up
    }
  };

  return (
    <Card className="p-6 border border-muted">
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex items-center space-x-2">
          {isStreaming && (
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse-dot" />
          )}
          {isComplete && (
            <CheckCircle className="w-4 h-4 text-success" />
          )}
          {!isStreaming && !isComplete && (
            <div className="w-2 h-2 bg-muted rounded-full" />
          )}
        </div>
        <h3 className="font-medium text-foreground">{title}</h3>
      </div>

      {/* Show status message ONLY when streaming and no content is visible yet */}
      {isStreaming && content === "" && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="w-1 h-4 bg-primary animate-pulse" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="prose prose-sm max-w-none text-sm text-foreground leading-relaxed">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </Card>
  );
}
