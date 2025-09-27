import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { 
  Inbox, 
  Folder, 
  Receipt,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigationItems = [
  { icon: Inbox, label: "Inbox", path: "/", active: true },
  { icon: Folder, label: "My Cases", path: "/cases", disabled: false },
  { icon: Receipt, label: "Bills", path: "/bills", disabled: false },
];

export function Sidebar() {
  const location = useLocation();
  
  return (
    <div className="w-60 bg-card border-r border-border flex flex-col shadow-card">
      {/* Logo Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col space-y-1">
          <span className="font-semibold text-xl text-foreground">Cicero</span>
          <span className="text-sm text-muted-foreground">Legal Management System</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              className={`w-full justify-start h-11 px-3 text-sm font-medium ${
                isActive 
                  ? "bg-primary-selected text-primary hover:bg-primary-selected" 
                  : "text-foreground hover:bg-accent"
              }`}
              asChild
            >
              <Link to={item.path}>
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* User Profile Footer - Bigger Version */}
      <div className="p-6 border-t border-border">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-primary text-primary-foreground text-base font-medium">
              BC
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground">
              Benjamin Chino
            </p>
            <p className="text-sm text-muted-foreground">Maki Co-Founder</p>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}