import { useState, useEffect } from "react";
import { X, CheckCircle, Download, Save, Bot, FileText } from "lucide-react";
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

// NEW: Dedicated component for global status in header
function StatusIndicator({ status }: { status: { name: string; error: string | null } }) {
  const statusConfig = {
    FETCHING: { icon: Bot, text: "Contacting server for call transcript...", color: "text-gray-500" },
    READY: { icon: FileText, text: "call transcript retrieved successfully.", color: "text-green-600" },
    ERROR: { icon: FileText, text: status.error || "An error occurred.", color: "text-red-600" },
  };
  const current = statusConfig[status.name as keyof typeof statusConfig] || statusConfig.FETCHING;

  return (
    <div className="flex items-center gap-2 text-xs">
      <current.icon className={`w-3 h-3 ${current.color}`} />
      <span className={current.color}>{current.text}</span>
    </div>
  );
}

// Global styles for better markdown rendering
const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{
    __html: `
    .prose {
      --tw-prose-body: #374151;
      --tw-prose-headings: #111827;
      --tw-prose-bold: #111827;
      --tw-prose-bullets: #3b82f6;
      --tw-prose-invert-body: #d1d5db;
      --tw-prose-invert-headings: #fff;
      --tw-prose-invert-bold: #fff;
    }
    .prose h2, .prose h3 {
      font-weight: 700 !important;
      letter-spacing: -0.02em;
    }
    .prose h2 {
      font-size: 1.25rem !important;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .dark .prose h2 {
        border-bottom-color: #374151;
    }
    .prose h3 {
        font-size: 1.1rem !important;
        margin-top: 2rem;
    }
    .prose strong {
      font-weight: 600 !important;
    }
  `}} />
);

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

  // NEW: State object to manage global status
  const [status, setStatus] = useState<{ name: string; error: string | null }>({ name: 'FETCHING', error: null });

  // Weaviate query status
  const [weaviateQueried, setWeaviateQueried] = useState<boolean>(false);
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
    setStatus({ name: 'FETCHING', error: null });

    // Simulate transcript retrieval - in real app this would be an API call
    if (sessionId) {
      setStatus({ name: 'READY', error: null });
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
      setWeaviateQueried(true); // Mark Weaviate as queried
      setCanStreamLegal(true); // Once summary is done, start the legal assessment
    } else if (streamType === "legal_assessment") {
      setLegalAssessmentText(finalContent);
      setCanStreamRisk(true); // Once legal assessment is done, start the risk assessment
    }
  };

  return (
    <>
      <GlobalStyles />
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] bg-card shadow-focus animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-foreground">
                    Live Analysis: AI Case Preparation: EU AI Act Compliance
                  </h2>
                  <StatusIndicator status={status} />
                </div>
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
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)] space-y-6">
            <StreamingCard
              title="1. Call Summary"
              sessionId={sessionId}
              streamType="summary"
              isReadyToStream={canStreamSummary}
              onStreamComplete={(finalContent) => handleStreamComplete("summary", finalContent)}
            />

            <div className="space-y-2">
              <StreamingCard
                title="2. Legal Assessment"
                sessionId={sessionId}
                streamType="legal_assessment"
                isReadyToStream={canStreamLegal}
                onStreamComplete={(finalContent) => handleStreamComplete("legal_assessment", finalContent)}
              />
              {weaviateQueried && (
                <div className="flex items-center justify-end gap-2 text-xs text-green-600 ml-6">
                  <CheckCircle className="w-3 h-3" />
                  <span>Weaviate queried successfully</span>
                </div>
              )}
            </div>

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
    </>
  );
}
