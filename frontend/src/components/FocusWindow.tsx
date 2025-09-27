import { useState, useEffect } from "react";
import { X, CheckCircle, Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StreamingCard } from "./StreamingCard";

interface Task {
  id: string;
  title: string;
  client: string;
  received: string;
  caseId: string;
  status: "new" | "completed";
  source: string;
}

interface FocusWindowProps {
  task: Task;
  sessionId: string; // Add sessionId to props
  onComplete: () => void;
  onClose: () => void;
}

export function FocusWindow({ task, sessionId, onComplete, onClose }: FocusWindowProps) {
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedStreams, setCompletedStreams] = useState(0);
  const [allStreamsComplete, setAllStreamsComplete] = useState(false);

  // State to hold the completed text from each step
  const [summaryText, setSummaryText] = useState<string>("");
  const [legalAssessmentText, setLegalAssessmentText] = useState<string>("");

  // Flags to control when each card starts streaming
  const [canStreamSummary, setCanStreamSummary] = useState<boolean>(false);
  const [canStreamLegal, setCanStreamLegal] = useState<boolean>(false);
  const [canStreamRisk, setCanStreamRisk] = useState<boolean>(false);

  // Data retrieval status
  const [transcriptRetrieved, setTranscriptRetrieved] = useState<boolean>(false);
  const [vectorStoreQueried, setVectorStoreQueried] = useState<boolean>(false);

  // No need for local sessionId state, it's passed as a prop
  useEffect(() => {
    // Reset progress when sessionId changes
    setOverallProgress(0);
    setCompletedStreams(0);
    setAllStreamsComplete(false);
    setSummaryText("");
    setLegalAssessmentText("");
    setCanStreamSummary(false);
    setCanStreamLegal(false);
    setCanStreamRisk(false);
    setTranscriptRetrieved(false);
    setVectorStoreQueried(false);

    // Simulate transcript retrieval
    if (sessionId) {
      setTranscriptRetrieved(true);
      setCanStreamSummary(true);
    }
  }, [sessionId]);

  const handleStreamComplete = (streamType: string, finalContent: string) => {
    setCompletedStreams(prev => {
      const newCount = prev + 1;
      const progress = (newCount / 3) * 100;
      setOverallProgress(progress);

      if (newCount === 3) {
        setAllStreamsComplete(true);
      }

      return newCount;
    });

    // Store the completed text and enable the next step
    if (streamType === "summary") {
      setSummaryText(finalContent);
      setVectorStoreQueried(true); // Mark vector store as queried
      setCanStreamLegal(true); // Once summary is done, start the legal assessment
    } else if (streamType === "legal_assessment") {
      setLegalAssessmentText(finalContent);
      setCanStreamRisk(true); // Once legal assessment is done, start the risk assessment
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-card shadow-focus animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Live Analysis: {task.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Email from Benjamin Chino to Harvey Specter
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-muted rounded-full h-1">
              <div 
                className="h-1 bg-gradient-primary rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          {/* Data Retrieval Status */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              {transcriptRetrieved ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
              <span className="text-sm font-medium">
                {transcriptRetrieved ? "Latest call transcript retrieved" : "Retrieving latest call transcript..."}
              </span>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              {vectorStoreQueried ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
              <span className="text-sm font-medium">
                {vectorStoreQueried ? "Weaviate legal vector database queried" : "Querying Weaviate legal vector database..."}
              </span>
            </div>
          </div>

          <StreamingCard
            title="1. Call Summary"
            sessionId={sessionId}
            streamType="summary"
            isReadyToStream={canStreamSummary}
            onStreamComplete={(finalContent) => handleStreamComplete("summary", finalContent)}
          />

          <StreamingCard
            title="2. Legal Assessment"
            sessionId={sessionId}
            streamType="legal_assessment"
            isReadyToStream={canStreamLegal}
            onStreamComplete={(finalContent) => handleStreamComplete("legal_assessment", finalContent)}
          />

          <StreamingCard
            title="3. Legal Summary & Next Steps"
            sessionId={sessionId}
            streamType="risk_assessment"
            isReadyToStream={canStreamRisk}
            // Pass the completed legal assessment text in the POST body
            postBody={{ legal_assessment: legalAssessmentText }}
            onStreamComplete={(finalContent) => handleStreamComplete("risk_assessment", finalContent)}
          />
        </div>

        {/* Action Bar */}
        <div className="p-6 border-t border-border bg-gradient-subtle">
          <div className="flex space-x-3 justify-end">
            <Button 
              variant="outline" 
              className="border-border"
              disabled={!allStreamsComplete}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Full Report
            </Button>
            
            <Button 
              variant="outline" 
              className="border-border"
              disabled={true}
            >
              <Save className="mr-2 h-4 w-4" />
              Save to Case File
            </Button>
            
            <Button 
              onClick={onComplete}
              className="bg-primary hover:bg-primary/90"
              disabled={!allStreamsComplete}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Completed
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
