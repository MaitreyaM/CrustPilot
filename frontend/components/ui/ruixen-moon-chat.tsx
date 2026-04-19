"use client";

import { useCallback, useEffect, useRef } from "react";
import { ArrowUpIcon, Paperclip } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AutoResizeProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: AutoResizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY),
      );
      textarea.style.height = `${newHeight}px`;
    },
    [maxHeight, minHeight],
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

type QuickAction = {
  label: string;
  prompt: string;
};

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Founders in SF",
    prompt: "Find founders in San Francisco with AI startup experience.",
  },
  {
    label: "VP Sales at fintech",
    prompt: "Show VP Sales leaders at Series B fintech companies in New York.",
  },
];

type RuixenMoonChatProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (value: string) => void;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  isLoading?: boolean;
  quickActions?: QuickAction[];
  onQuickActionClick?: (prompt: string) => void;
};

export function RuixenMoonChat({
  value,
  onValueChange,
  onSubmit,
  title = "CrustPilot AI",
  subtitle = "Search real people through conversation. Just start typing below.",
  placeholder = "Type your request...",
  isLoading = false,
  quickActions = DEFAULT_QUICK_ACTIONS,
  onQuickActionClick,
}: RuixenMoonChatProps) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 150,
  });

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col items-center overflow-hidden bg-[#08090d]">
      <div
        className="absolute inset-0 animate-[ruixenFloat_18s_ease-in-out_infinite] bg-cover bg-center opacity-95"
        style={{
          backgroundImage:
            "url('https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/ruixen_moon_2.png')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/50" />

      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-white shadow-[0_0_60px_rgba(0,0,0,0.6)]">
            <img alt="CrustPilot" className="size-12" src="/crustpilot.svg" />
          </div>
          <h1 className="text-4xl font-semibold text-white drop-shadow-sm md:text-5xl">
            {title}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-200 md:text-base">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="relative z-10 mb-[14vh] w-full max-w-3xl px-4">
        <form
          className="relative rounded-2xl border border-neutral-700 bg-black/60 backdrop-blur-md"
          onSubmit={(event) => {
            event.preventDefault();
            if (!value.trim() || isLoading) return;
            onSubmit(value);
          }}
        >
          <Textarea
            ref={textareaRef}
            className={cn(
              "min-h-[48px] w-full resize-none border-none bg-transparent px-4 py-3 text-sm text-white placeholder:text-neutral-400 focus-visible:ring-0 focus-visible:ring-offset-0",
            )}
            onChange={(event) => {
              onValueChange(event.target.value);
              adjustHeight();
            }}
            placeholder={placeholder}
            style={{ overflow: "hidden" }}
            value={value}
          />

          <div className="flex items-center justify-between p-3">
            <Button
              className="text-white hover:bg-neutral-700"
              size="icon"
              type="button"
              variant="ghost"
            >
              <Paperclip className="size-4" />
            </Button>

            <Button
              className={cn(
                "rounded-lg px-3 py-2 transition-colors",
                !value.trim() || isLoading
                  ? "cursor-not-allowed bg-neutral-700 text-neutral-400"
                  : "bg-white text-black hover:bg-white/90",
              )}
              disabled={!value.trim() || isLoading}
              type="submit"
            >
              <ArrowUpIcon className="size-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {quickActions.map((action) => (
            <Button
              className="rounded-full border-neutral-700 bg-black/50 text-neutral-300 hover:bg-neutral-700 hover:text-white"
              key={action.label}
              onClick={() => onQuickActionClick?.(action.prompt)}
              type="button"
              variant="outline"
            >
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
