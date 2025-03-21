import * as React from "react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  maxHeight?: number;
  minRows?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, maxHeight, minRows = 3, onChange, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      textarea.style.height = "auto";
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const minHeight = lineHeight * minRows;
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.max(minHeight, scrollHeight);

      textarea.style.height = `${maxHeight ? Math.min(newHeight, maxHeight) : newHeight}px`;
    };

    useEffect(() => {
      adjustHeight();
    }, [props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      onChange?.(e);
    };

    return (
      <textarea
        ref={(element) => {
          textareaRef.current = element;
          if (typeof ref === "function") ref(element);
          else if (ref) ref.current = element;
        }}
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2",
          "text-sm shadow-sm placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-none overflow-hidden transition-colors",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };