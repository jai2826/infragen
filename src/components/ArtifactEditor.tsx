'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { ConfigArtifact } from '@/lib/agent/types';
import { Button } from '@/components/ui/button';
import {
  Copy,
  Check,
  Download,
  FileCode2,
  Layers,
  Terminal,
  Info,
  RotateCcw,
} from 'lucide-react';

const LANGUAGE_BY_TYPE: Record<ConfigArtifact['type'], string> = {
  DOCKERFILE: 'dockerfile',
  DOCKER_COMPOSE: 'yaml',
  K8S_DEPLOYMENT: 'yaml',
  K8S_SERVICE: 'yaml',
  K8S_CONFIGMAP: 'yaml',
  K8S_HPA: 'yaml',
};

function getFileName(a: ConfigArtifact): string {
  switch (a.type) {
    case 'DOCKERFILE':
      return a.variant === 'DEV' ? 'Dockerfile.dev' : 'Dockerfile';
    case 'DOCKER_COMPOSE':
      return a.variant === 'DEV' ? 'docker-compose.dev.yml' : 'docker-compose.yml';
    case 'K8S_DEPLOYMENT':
      return 'k8s-deployment.yaml';
    case 'K8S_SERVICE':
      return 'k8s-service.yaml';
    case 'K8S_CONFIGMAP':
      return 'k8s-configmap.yaml';
    case 'K8S_HPA':
      return 'k8s-hpa.yaml';
    default:
      return 'config.yaml';
  }
}

function getArtifactKey(a: ConfigArtifact, index: number): string {
  return `${a.type}-${a.variant}-${index}`;
}

export function ArtifactEditor({ artifacts }: { artifacts: ConfigArtifact[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasCopied, setHasCopied] = useState(false);
  // Store user edits per artifact key so edits persist across tab switching and download/copy
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});

  // Reset local edits when a fresh set of artifacts arrives from a new generation run
  useEffect(() => {
    setEditedContent({});
    setActiveIndex(0);
  }, [artifacts]);

  if (artifacts.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-card/40">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 border border-border/80 text-muted-foreground mb-4">
          <Terminal className="h-7 w-7 text-blue-400" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">
          No Artifacts Generated Yet
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          Describe your application on the left and click &quot;Generate Configs&quot; to produce validated Dockerfiles and Kubernetes manifests.
        </p>
      </div>
    );
  }

  const active = artifacts[activeIndex] ?? artifacts[0];
  if (!active) return null;

  const fileName = getFileName(active);
  const activeKey = getArtifactKey(active, activeIndex);
  const currentContent = editedContent[activeKey] ?? active.content;
  const isEdited = editedContent[activeKey] !== undefined && editedContent[activeKey] !== active.content;

  function handleContentChange(val: string | undefined) {
    if (val !== undefined) {
      setEditedContent((prev) => ({
        ...prev,
        [activeKey]: val,
      }));
    }
  }

  function handleReset() {
    setEditedContent((prev) => {
      const next = { ...prev };
      delete next[activeKey];
      return next;
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(currentContent);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-full flex-col bg-card/60 backdrop-blur-md">
      {/* Tab Navigation Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-border/70 bg-background/60 px-3 py-1.5 gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {artifacts.map((a, i) => {
            const isSelected = i === activeIndex;
            const name = getFileName(a);
            const isDocker = a.type === 'DOCKERFILE' || a.type === 'DOCKER_COMPOSE';
            const itemKey = getArtifactKey(a, i);
            const itemEdited = editedContent[itemKey] !== undefined && editedContent[itemKey] !== a.content;

            return (
              <button
                key={itemKey}
                onClick={() => {
                  setActiveIndex(i);
                  setHasCopied(false);
                }}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-secondary text-foreground shadow-sm border border-border/80'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                }`}
              >
                {isDocker ? (
                  <FileCode2 className="h-3 w-3 text-blue-400" />
                ) : (
                  <Layers className="h-3 w-3 text-indigo-400" />
                )}
                <span>{name}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded ${
                    a.variant === 'PROD'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-indigo-500/15 text-indigo-400'
                  }`}
                >
                  {a.variant}
                </span>
                {itemEdited && (
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" title="Edited" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action Buttons: Reset, Copy & Download */}
        <div className="flex items-center gap-1.5">
          {isEdited && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 gap-1 px-2 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
              title="Reset file to original generated version"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            title="Copy current code to clipboard"
          >
            {hasCopied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            title={`Download ${fileName}`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </Button>
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          theme="vs-dark"
          language={LANGUAGE_BY_TYPE[active.type]}
          value={currentContent}
          onChange={handleContentChange}
          options={{
            readOnly: false,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {/* Decision Explanation Footer */}
      {active.explanation && (
        <div className="border-t border-border/80 bg-background/80 p-3.5 text-xs text-muted-foreground backdrop-blur-md flex items-start gap-2">
          <Info className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
          <div>
            <span className="font-semibold text-foreground">Why this design: </span>
            <span className="text-neutral-300 leading-relaxed">{active.explanation}</span>
          </div>
        </div>
      )}
    </div>
  );
}
