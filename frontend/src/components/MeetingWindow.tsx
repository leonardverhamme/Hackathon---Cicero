import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MeetingWindowProps {
  onCallFinished: () => void;
}

export function MeetingWindow({ onCallFinished }: MeetingWindowProps) {
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Meeting iframe */}
      <div className="flex-1 w-full h-full">
        <iframe 
          src="https://bey.chat/e84a5fae-9aca-44ff-8373-5dc29df5db6c" 
          width="100%" 
          height="100%"
          frameBorder="0"
          allowFullScreen
          allow="camera; microphone; fullscreen"
          style={{ border: 'none', maxWidth: '100%' }}
        />
      </div>
      
      {/* Call finished button */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <Button 
          onClick={onCallFinished}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Call Finished
        </Button>
      </div>
    </div>
  );
}