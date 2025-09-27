import { Play, Mic, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: string;
  title: string;
  client: string;
  clientContact?: string;
  received: string;
  caseId: string;
  status: "new" | "completed";
  source: string;
  message?: string;
}

interface TaskCardProps {
  task: Task;
  onTakeCall?: (taskId: string) => void;
  isAnimating?: boolean;
}

export function TaskCard({ task, onTakeCall, isAnimating }: TaskCardProps) {
  const isCompleted = task.status === "completed";
  
  return (
    <Card 
      className={`p-6 shadow-card hover:shadow-hover transition-all duration-300 ${
        isAnimating ? "animate-slide-across" : ""
      }`}
    >
      {/* Task title - moved to top and made larger */}
      <h3 className="text-xl font-semibold text-foreground mb-4">
        {task.title}
      </h3>

      {/* Harvey's Message */}
      {task.message && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground italic">{task.message}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-[auto_1fr] gap-4 text-sm">
          <span className="text-muted-foreground">From:</span>
          <span className="font-medium text-foreground">{task.source}</span>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-4 text-sm">
          <span className="text-muted-foreground">Received:</span>
          <span className="font-medium text-foreground">{task.received}</span>
        </div>
      </div>

      {/* Action or Status */}
      <div className="flex justify-end mb-4">
        {isCompleted ? (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        ) : (
          <Button 
            onClick={() => onTakeCall?.(task.id)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Play className="mr-2 h-4 w-4" />
            Start AI Meeting
          </Button>
        )}
      </div>

      {/* Client info - moved to bottom */}
      <div className="flex items-center space-x-2 pt-4 border-t border-border">
        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
          M
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            Client: {task.client}
          </span>
          {task.clientContact && (
            <span className="text-xs text-muted-foreground">
              Contact: {task.clientContact}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}