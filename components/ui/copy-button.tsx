"use client";

import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { PiCopySimpleBold as CopyIcon } from "react-icons/pi";
import { PiCheckCircleBold as CheckmarkIcon } from "react-icons/pi";
import { useTranslations } from "next-intl";


export default function CopyButton({ content, classname = "" }: { content: string, classname?: string }) {
  const t = useTranslations('Playground')
  const [copied, setCopied] = useState(false);

  function copyToClipboard() {
    navigator.clipboard.writeText(content);
    // Setting the copied state to true will show the checkmark icon
    setCopied(true);
    setTimeout(() => setCopied(false), 1_000); // The checkmark icon will disappear after 1 second
  }

  return (
    // Set delayDuration to 0 to show the "Copy" text immediately when the user hovers over the button
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label="Copy"
            variant="ghost"
            size="icon"
            className={`size-7 ${classname}`}
            onClick={copyToClipboard}
          >
            {copied ? (
              <CheckmarkIcon className="size-5" />
            ) : (
              <CopyIcon className="size-5 fill-muted-foreground transition-colors hover:fill-foreground" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('Copy')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
