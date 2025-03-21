import React from "react";

export function DotsLoader({ size }: { size: number }) {
  return (
    <div
      className={`flex items-center justify-center w-${size} h-${size} bg-background/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl`}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="w-3 h-3 rounded-full bg-gradient-to-r from-primary/90 to-primary/70 animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_12px_rgba(var(--primary),.3)] transition-transform hover:scale-110" />
        <span className="w-3 h-3 rounded-full bg-gradient-to-r from-primary/90 to-primary/70 animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_12px_rgba(var(--primary),.3)] [animation-delay:200ms] transition-transform hover:scale-110" />
        <span className="w-3 h-3 rounded-full bg-gradient-to-r from-primary/90 to-primary/70 animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_12px_rgba(var(--primary),.3)] [animation-delay:400ms] transition-transform hover:scale-110" />
      </div>
    </div>
  );
}

export default DotsLoader;