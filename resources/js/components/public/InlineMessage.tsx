import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface InlineMessageProps {
  type: "success" | "error" | "info";
  title?: string;
  message: React.ReactNode;
  className?: string;
}

export function InlineMessage({ type, title, message, className }: InlineMessageProps) {
  const variantMap = {
    success: "success" as const,
    error: "destructive" as const,
    info: "info" as const,
  };

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }[type];

  // Set the correct aria role
  const role = type === "error" ? "alert" : "status";

  return (
    <Alert variant={variantMap[type]} role={role} className={className}>
      <Icon className="h-5 w-5" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
