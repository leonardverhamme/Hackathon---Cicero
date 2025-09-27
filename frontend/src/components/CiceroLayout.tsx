import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings } from "lucide-react";

interface CiceroLayoutProps {
  children: ReactNode;
}

export function CiceroLayout({ children }: CiceroLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar />
      <main className="flex-1 bg-background">
        {children}
      </main>
    </div>
  );
}