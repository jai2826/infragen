import * as React from 'react';
import Link from 'next/link';
import { Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GithubIcon } from '@/components/icons/GithubIcon';

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/80 py-12 text-sm text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Terminal className="h-4 w-4" />
            </div>
            <span className="font-bold text-foreground">Infragen</span>
            <Badge variant="outline" className="text-[10px] text-neutral-400">
              v0.1
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground max-w-sm text-center md:text-left">
            AI agent producing validated Dockerfiles &amp; Kubernetes infrastructure manifests.
          </p>
        </div>

        {/* Stack info */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="rounded bg-muted/60 px-2 py-1 text-neutral-400 border border-border/40">Next.js 14</span>
          <span className="rounded bg-muted/60 px-2 py-1 text-neutral-400 border border-border/40">Base UI</span>
          <span className="rounded bg-muted/60 px-2 py-1 text-neutral-400 border border-border/40">Gemini</span>
          <span className="rounded bg-muted/60 px-2 py-1 text-neutral-400 border border-border/40">Prisma</span>
          <span className="rounded bg-muted/60 px-2 py-1 text-neutral-400 border border-border/40">Better Auth</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4 text-xs">
          <Link href="/demo" className="hover:text-foreground transition-colors">
            Live Demo
          </Link>
          <Link href="/login" className="hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <GithubIcon className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
