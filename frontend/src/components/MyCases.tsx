import { Folder, Calendar, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Case {
  id: string;
  title: string;
  status: "active" | "completed";
  lastUpdated: string;
  description: string;
}

const mockCases: Case[] = [
  {
    id: "3",
    title: "EU AI Act Compliance Consultation",
    status: "active",
    lastUpdated: "23 minutes ago", 
    description: "Ongoing consultation regarding compliance with the new EU AI Act regulations."
  },
  {
    id: "1",
    title: "Data Privacy Assessment Review",
    status: "completed",
    lastUpdated: "3 days ago",
    description: "Comprehensive review of data handling procedures and GDPR compliance measures."
  },
  {
    id: "2", 
    title: "Contract Terms Review",
    status: "completed",
    lastUpdated: "1 week ago",
    description: "Analysis of vendor agreements and contract terms for risk assessment."
  }
];

export function MyCases() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground">My Cases</h1>
      </header>

      <div className="space-y-4">
        {mockCases.map((case_) => (
          <Card key={case_.id} className="p-6 shadow-card hover:shadow-hover transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Folder className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{case_.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{case_.description}</p>
                </div>
              </div>
              
              <Badge 
                className={
                  case_.status === "completed" 
                    ? "bg-success text-success-foreground" 
                    : "bg-primary text-primary-foreground"
                }
              >
                {case_.status === "completed" ? (
                  <>
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Completed
                  </>
                ) : (
                  "Active"
                )}
              </Badge>
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              Last updated: {case_.lastUpdated}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}