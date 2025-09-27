import { useState, useEffect } from "react";
import { TaskCard } from "./TaskCard";
import { FocusWindow } from "./FocusWindow";
import { MeetingWindow } from "./MeetingWindow";
import { Button } from "@/components/ui/button";

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

const mockTasks: Task[] = [
  {
    id: "1",
    title: "AI Case Preparation: EU AI Act Compliance",
    client: "Maki",
    clientContact: "Benjamin Chino",
    received: "2025-09-27 14:35",
    caseId: "",
    status: "new",
    source: "Harvey Specter",
    message: "Harvey: Hi Benjamin, I've reviewed your email about EU AI Act compliance requirements for Maki's AI systems. I've scheduled an AI-assisted analysis call to gather initial information and provide preliminary guidance on how the new regulations will impact your operations. Please proceed with the call when ready."
  },
  {
    id: "2",
    title: "AI Case Review: Data Privacy Assessment",
    client: "Maki",
    clientContact: "Benjamin Chino",
    received: "2025-09-24 10:20",
    caseId: "",
    status: "completed",
    source: "Harvey Specter"
  },
  {
    id: "3",
    title: "AI Legal Analysis: Contract Terms Review",
    client: "Maki",
    clientContact: "Benjamin Chino",
    received: "2025-09-20 09:00",
    caseId: "",
    status: "completed",
    source: "Harvey Specter"
  }
];

export function Inbox() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);
  const [showMeeting, setShowMeeting] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null); // To store the session_id from backend

  const newTasks = tasks.filter(task => task.status === "new");
  const completedTasks = tasks.filter(task => task.status === "completed");

  const handleTakeCall = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setFocusTask(task);
      setShowMeeting(true);
    }
  };

  const handleCallFinished = async () => {
    setShowMeeting(false);
    // Trigger API call to get the latest call transcript
    try {
      const response = await fetch("http://localhost:8001/get_latest_call_transcript");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCurrentSessionId(data.session_id); // Store the session ID
      // Optionally, you could create a new task here with the transcript
      // For now, we'll just use the session_id to open the FocusWindow
      
      // Find the task that was just "taken" and associate the session_id with it
      // For demo purposes, we'll assume the first new task is the one that just finished a call
      if (newTasks.length > 0) {
        setFocusTask({ ...newTasks[0], caseId: data.session_id }); // Use caseId to store session_id for now
      }

    } catch (error) {
      console.error("Failed to fetch call transcript:", error);
      // Handle error, maybe show a toast notification
    }
  };

  const handleCompleteTask = (taskId: string) => {
    // Start animation
    setAnimatingTaskId(taskId);
    
    // After animation completes, update the task status
    setTimeout(() => {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: "completed" as const }
          : task
      ));
      setAnimatingTaskId(null);
      setFocusTask(null);
      setCurrentSessionId(null); // Clear session ID after task completion
    }, 800);
  };

  const handleCloseFocus = () => {
    setFocusTask(null);
  };

  return (
    <div className="relative">
      {/* Main inbox content */}
      <div 
        className={`p-8 transition-opacity duration-300 ${
          focusTask ? 'opacity-50 pointer-events-none' : 'opacity-100'
        }`}
      >
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-foreground">Inbox</h1>
          <Button className="bg-primary hover:bg-primary/90">
            New Email to Lawyer
          </Button>
        </header>

        {/* New Tasks Section */}
        <section className="mb-10">
          <h2 className="text-xl font-medium text-foreground mb-6">New Tasks</h2>
          <div className="space-y-4">
            {newTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onTakeCall={handleTakeCall}
                isAnimating={animatingTaskId === task.id}
              />
            ))}
          </div>
        </section>

        {/* Recently Completed Section */}
        <section>
          <h2 className="text-xl font-medium text-foreground mb-6">Recently Completed</h2>
          <div className="space-y-4">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Meeting Window */}
      {showMeeting && (
        <MeetingWindow onCallFinished={handleCallFinished} />
      )}

      {/* Focus Window Overlay */}
      {focusTask && !showMeeting && (
        <FocusWindow
          task={focusTask}
          sessionId={currentSessionId || focusTask.caseId} // Pass the session ID
          onComplete={() => handleCompleteTask(focusTask.id)}
          onClose={handleCloseFocus}
        />
      )}
    </div>
  );
}
