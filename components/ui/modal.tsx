"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onOpenChange, children, className }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-m p-6 shadow-lg dark:bg-gray-900 bg-muted",
            className
          )}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ModalContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-4", className)}>{children}</div>;
}

export function ModalHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex items-center justify-between", className)}>{children}</div>;
}

export function ModalTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>;
}

export function ModalClose({ children }: { children?: React.ReactNode }) {
  return (
    <Dialog.Close asChild>
      <Button variant="default" size="icon">
        {children || <X className="h-5 w-5" />}
      </Button>
    </Dialog.Close>
  );
}


interface ModalProps {
  isOpen: boolean;
  message?: string;
  detailMessage?: string;
}

const ModalOverlay = ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex justify-center items-center z-50"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative z-50"
        >
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const WaitingModal = ({ isOpen, message = "Processing...", detailMessage }: ModalProps) => (
  <ModalOverlay isOpen={isOpen}>
    <div className="bg-background/95 border shadow-lg rounded-lg p-6 w-[90vw] max-w-md">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="space-y-2 text-center">
          <h2 className="text-lg font-semibold">{message}</h2>
          {detailMessage && (
            <p className="text-sm text-muted-foreground">{detailMessage}</p>
          )}
        </div>
      </div>
    </div>
  </ModalOverlay>
);

export const DoneModal = ({ isOpen, message = "Success!", detailMessage }: ModalProps) => (
  <ModalOverlay isOpen={isOpen}>
    <div className="bg-background/95 border shadow-lg rounded-lg p-6 w-[90vw] max-w-md">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="bg-primary/10 absolute inset-0 rounded-full"
          />
          <motion.svg
            viewBox="0 0 24 24"
            className="text-primary h-12 w-12 relative"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <motion.path
              d="M20 6L9 17l-5-5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </motion.svg>
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-lg font-semibold">{message}</h2>
          {detailMessage && (
            <p className="text-sm text-muted-foreground">{detailMessage}</p>
          )}
        </div>
      </div>
    </div>
  </ModalOverlay>
);