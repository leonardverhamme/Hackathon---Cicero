import { useState } from "react";
import { Receipt, Download, CreditCard, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Bill {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "overdue";
  dueDate?: string;
}

const mockBills: Bill[] = [
  {
    id: "INV-2024-001",
    description: "EU AI Act Compliance Consultation",
    amount: 2400,
    date: "March 15, 2024",
    status: "pending",
    dueDate: "April 15, 2024"
  },
  {
    id: "INV-2024-002",
    description: "Data Privacy Assessment Review",
    amount: 1800,
    date: "March 1, 2024",
    status: "paid",
  },
  {
    id: "INV-2024-003",
    description: "Contract Terms Review",
    amount: 1200,
    date: "February 20, 2024",
    status: "paid",
  }
];

function BillCard({ bill }: { bill: Bill }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-accent text-accent-foreground";
      case "overdue":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="mr-1 h-3 w-3" />;
      case "pending":
        return <Clock className="mr-1 h-3 w-3" />;
      case "overdue":
        return <Clock className="mr-1 h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <Card className="p-6 shadow-card hover:shadow-hover transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Receipt className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">{bill.id}</span>
        </div>
        <Badge className={getStatusColor(bill.status)}>
          {getStatusIcon(bill.status)}
          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
        </Badge>
      </div>

      {/* Description */}
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {bill.description}
      </h3>

      {/* Amount */}
      <div className="text-2xl font-bold text-foreground mb-4">
        €{bill.amount.toLocaleString()}
      </div>

      {/* Metadata */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Issue Date:</span>
          <span className="font-medium text-foreground">{bill.date}</span>
        </div>
        {bill.dueDate && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Due Date:</span>
            <span className="font-medium text-foreground">{bill.dueDate}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <Button variant="outline" size="sm" className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        {bill.status !== "paid" && (
          <Button className="flex-1 bg-primary hover:bg-primary/90">
            <CreditCard className="mr-2 h-4 w-4" />
            Pay Now
          </Button>
        )}
      </div>
    </Card>
  );
}

export function Bills() {
  const [bills] = useState<Bill[]>(mockBills);
  
  const pendingBills = bills.filter(bill => bill.status === "pending");
  const overdueBills = bills.filter(bill => bill.status === "overdue");
  const paidBills = bills.filter(bill => bill.status === "paid");

  const totalOutstanding = [...pendingBills, ...overdueBills]
    .reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Bills & Invoices</h1>
        {totalOutstanding > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Outstanding:</span>
            <span className="text-xl font-bold text-destructive">
              €{totalOutstanding.toLocaleString()}
            </span>
          </div>
        )}
      </header>

      {/* Overdue Bills */}
      {overdueBills.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-medium text-destructive mb-6">Overdue Bills</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {overdueBills.map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
          </div>
        </section>
      )}

      {/* Pending Bills */}
      {pendingBills.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-medium text-foreground mb-6">Pending Bills</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingBills.map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
          </div>
        </section>
      )}

      {/* Paid Bills */}
      <section>
        <h2 className="text-xl font-medium text-foreground mb-6">Paid Bills</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paidBills.map((bill) => (
            <BillCard key={bill.id} bill={bill} />
          ))}
        </div>
      </section>
    </div>
  );
}