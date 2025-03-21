import React from 'react';
import { Check, X, Clock, MemoryStick, AlertCircle, AlertTriangle, HelpCircle } from "lucide-react";

export function getStatusColor(status: string) {
  switch (status) {
    case "AC":
      return "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20";
    case "WA":
      return "text-red-500 bg-red-500/10 dark:bg-red-500/20";
    case "TLE":
      return "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20";
    case "MLE":
      return "text-orange-500 bg-orange-500/10 dark:bg-orange-500/20";
    case "CE":
      return "text-rose-500 bg-rose-500/10 dark:bg-rose-500/20";
    case "RTE":
      return "text-red-500 bg-red-500/10 dark:bg-red-500/20";
    default:
      return "text-gray-500 bg-gray-500/10 dark:bg-gray-500/20";
  }
}

export function getStatusIcon(status: string) {
  switch (status) {
    case "AC":
      return <Check className="h-4 w-4" />;
    case "WA":
      return <X className="h-4 w-4" />;
    case "TLE":
      return <Clock className="h-4 w-4" />;
    case "MLE":
      return <MemoryStick className="h-4 w-4" />;
    case "CE":
      return <AlertCircle className="h-4 w-4" />;
    case "RTE":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <HelpCircle className="h-4 w-4" />;
  }
}