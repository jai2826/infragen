"use client";

import { useState, useEffect } from "react";
import type { InputMode } from "@/lib/agent/types";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  FileText,
  Upload,
  Code2,
  Send,
  Loader2,
  FolderUp,
} from "lucide-react";

interface InputPanelProps {
  onSubmit: (mode: InputMode, rawInput: string) => void;
  disabled: boolean;
  initialText?: string;
  initialMode?: InputMode;
}

const TEMPLATE_PRESETS = [
  {
    label: "Next.js 14 + Postgres",
    text: "Fullstack Next.js 14 app with Prisma ORM, PostgreSQL database, and standalone output mode",
  },
  {
    label: "FastAPI + Celery + Redis",
    text: "Python FastAPI service with Celery background task workers and a Redis broker",
  },
  {
    label: "Go Gin + K8s HPA",
    text: "Go REST API using Gin framework, scratch base image, with Horizontal Pod Autoscaler for high traffic",
  },
];

export function InputPanel({
  onSubmit,
  disabled,
  initialText = "",
  initialMode = "TEXT",
}: InputPanelProps) {
  const [mode, setMode] = useState<InputMode>(initialMode);
  const [text, setText] = useState(initialText);

  useEffect(() => {
    if (initialText) {
      setText(initialText);
    }
  }, [initialText]);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  async function handleFile(file: File) {
    const content = await file.text();
    setMode("FILE");
    setText(`// filename: ${file.name}\n${content}`);
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      if (!disabled && text.trim().length > 0) {
        e.preventDefault();
        onSubmit(mode, text);
      }
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card/80 p-4 backdrop-blur-md shadow-md">
      {/* Mode Selectors */}
      <div className="flex  items-center justify-between">
        <div className="flex gap-1.5 rounded-lg bg-muted/60 p-1 border border-border/50 text-xs">
          <button
            type="button"
            onClick={() => setMode("TEXT")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${
              mode === "TEXT"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            <FileText className="h-3.5 w-3.5" />
            <span>Describe</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("FILE")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${
              mode === "FILE"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            <Upload className="h-3.5 w-3.5" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("CODE")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-all ${
              mode === "CODE"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            <Code2 className="h-3.5 w-3.5" />
            <span>Paste Code</span>
          </button>
        </div>
      </div>

        <div className="px-2 text-[11px] text-muted-foreground hidden sm:inline">
          Ctrl + Enter to run
        </div>
      {/* File Upload Trigger */}
      {mode === "FILE" && (
        <div className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/80 bg-background/50 p-4 text-center hover:border-blue-500/50 transition-colors">
          <FolderUp className="h-6 w-6 text-muted-foreground mb-1" />
          <span className="text-xs text-foreground font-medium">
            Click to select app manifest
          </span>
          <span className="text-[10px] text-muted-foreground">
            Dockerfile, package.json, requirements.txt, etc.
          </span>
          <input
            type="file"
            accept=".json,.txt,.js,.ts,Dockerfile,.yml,.yaml,.go,.py"
            onChange={(e) =>
              e.target.files?.[0] &&
              handleFile(e.target.files[0])
            }
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      )}

      {/* Main Text Area */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === "TEXT"
              ? 'e.g. "A Node/Express API with a PostgreSQL database and Redis cache, expecting 500 req/sec with HPA autoscaling..."'
              : mode === "CODE"
                ? "Paste your server.js, package.json, go.mod, or existing Dockerfile..."
                : "File contents or manual notes will appear here..."
          }
          rows={6}
          disabled={disabled}
          className="w-full resize-none rounded-lg border border-input/80 bg-background/70 p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-60 transition-all leading-relaxed"
        />
      </div>

      {/* Template Quick Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-muted-foreground mr-1 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-blue-400" />{" "}
          Presets:
        </span>
        {TEMPLATE_PRESETS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setMode("TEXT");
              setText(p.text);
            }}
            disabled={disabled}
            className="rounded-md border border-border/70 bg-secondary/50 px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-blue-500/30 transition-all truncate max-w-[200px]">
            {p.label}
          </button>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-1 border-t border-border/50">
        <span className="text-[10px] text-muted-foreground">
          {text.length > 0
            ? `${text.length} chars`
            : "Ready"}
        </span>

        <Button
          disabled={disabled || text.trim().length === 0}
          onClick={() => onSubmit(mode, text)}
          variant="glow"
          size="sm"
          className="gap-2 px-4 shadow-sm">
          {disabled ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>Generate Configs</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
