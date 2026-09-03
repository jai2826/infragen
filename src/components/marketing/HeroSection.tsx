'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ArrowRight,
  Terminal,
  CheckCircle2,
  FileCode2,
  ShieldCheck,
  DollarSign,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface SamplePreset {
  id: string;
  name: string;
  tag: string;
  prompt: string;
  ports: string;
  artifacts: string[];
  dockerfileSnippet: string;
  k8sSnippet: string;
  cost: number;
}

const PRESETS: SamplePreset[] = [
  {
    id: 'nextjs-postgres',
    name: 'Next.js 14 + Postgres',
    tag: 'Fullstack Web',
    prompt: 'Fullstack Next.js 14 app with Prisma ORM, PostgreSQL database, and standalone output mode',
    ports: '3000 -> 5432',
    artifacts: ['Dockerfile (multi-stage)', 'k8s-deployment.yaml', 'k8s-service.yaml', 'k8s-hpa.yaml'],
    dockerfileSnippet: `# Multi-stage hardened build
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \\
    adduser --system --uid 1001 nextjs
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]`,
    k8sSnippet: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    app: infragen-service
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: web
        image: infragen/web:v1.0.0
        resources:
          limits: { cpu: "500m", memory: "512Mi" }
          requests: { cpu: "100m", memory: "256Mi" }`,
    cost: 38,
  },
  {
    id: 'fastapi-celery',
    name: 'FastAPI + Celery + Redis',
    tag: 'Python Async API',
    prompt: 'FastAPI service with asynchronous Celery background task workers and a Redis broker',
    ports: '8000 -> 6379',
    artifacts: ['Dockerfile.api', 'Dockerfile.worker', 'k8s-deployment.yaml', 'redis-statefulset.yaml'],
    dockerfileSnippet: `FROM python:3.11-slim AS builder
WORKDIR /app
ENV PYTHONUNBUFFERED=1 \\
    PYTHONDONTWRITEBYTECODE=1
RUN apt-get update && apt-get install -y gcc libpq-dev
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim AS runner
WORKDIR /app
RUN useradd -m -u 1001 appuser
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY . .
USER appuser
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
    k8sSnippet: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: fastapi-worker
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: worker
        image: infragen/worker:v1.0.0
        command: ["celery", "-A", "tasks", "worker", "--loglevel=info"]`,
    cost: 54,
  },
  {
    id: 'go-gin-microservice',
    name: 'Go Gin + K8s HPA',
    tag: 'High Throughput',
    prompt: 'Ultra-light Go REST API built with Gin, scratch runtime container, and automatic Horizontal Pod Autoscaler based on CPU utilization',
    ports: '8080 (Stateless)',
    artifacts: ['Dockerfile (scratch)', 'k8s-deployment.yaml', 'k8s-service.yaml', 'k8s-hpa.yaml'],
    dockerfileSnippet: `FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /service .

FROM scratch
COPY --from=builder /service /service
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
USER 10001
EXPOSE 8080
ENTRYPOINT ["/service"]`,
    k8sSnippet: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: go-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: go-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 75`,
    cost: 26,
  },
];

export function HeroSection() {
  const [activePreset, setActivePreset] = useState<SamplePreset>(PRESETS[0]!);
  const [activeTab, setActiveTab] = useState<'docker' | 'k8s'>('docker');
  const [simStep, setSimStep] = useState<number>(4);

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
      {/* Dynamic Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] max-w-full rounded-full bg-gradient-to-tr from-blue-600/20 via-indigo-500/20 to-cyan-400/20 blur-[130px] animate-pulse-glow" />
      <div className="pointer-events-none absolute top-1/3 -left-32 h-72 w-72 rounded-full bg-indigo-600/10 blur-[100px]" />
      <div className="pointer-events-none absolute top-1/2 -right-32 h-72 w-72 rounded-full bg-cyan-600/10 blur-[100px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Hero Header */}
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-300 backdrop-blur-md shadow-sm shadow-blue-500/10">
              <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Next-Generation Infrastructure AI Agent</span>
              <span className="h-1 w-1 rounded-full bg-blue-400" />
              <span className="text-neutral-400">Self-Correcting Loop</span>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl"
          >
            Production Docker &amp; Kubernetes{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Engineered in Seconds
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl font-normal leading-relaxed"
          >
            Stop hand-writing fragile Dockerfiles and tangled YAML manifests. Infragen analyzes your code, creates hardened multi-stage configs with dev/prod variants, self-corrects errors via static validation, and estimates monthly cloud costs.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link href={`/demo?template=${activePreset.id}`}>
              <Button size="lg" variant="glow" className="gap-2.5 px-7 text-sm font-semibold shadow-lg shadow-blue-500/20 group">
                <Sparkles className="h-4 w-4 text-blue-200" />
                <span>Try Live Demo (Guest Mode)</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href="/login">
              <Button size="lg" variant="outline" className="gap-2 px-6 text-sm border-border/80 hover:bg-neutral-900">
                <Terminal className="h-4 w-4 text-muted-foreground" />
                <span>Sign In with GitHub</span>
              </Button>
            </Link>
          </motion.div>

          {/* Social Proof Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>No credit card or sign-up needed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Multi-Stage Docker &amp; K8s HPA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Real-time SSE Streaming</span>
            </div>
          </motion.div>
        </div>

        {/* Interactive Live Pipeline Simulator */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-14 relative"
        >
          {/* Subtle Outer Glow Border */}
          <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-2xl p-2 sm:p-4 shadow-2xl glow-primary">
            {/* Simulator Header & Template Selector */}
            <div className="flex flex-col gap-3 border-b border-border/60 pb-3 sm:flex-row sm:items-center sm:justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-muted-foreground ml-2">
                  interactive-agent-preview.sh
                </span>
                <Badge variant="success" className="text-[10px] py-0 px-2 ml-1">
                  Active Simulation
                </Badge>
              </div>

              {/* Sample Preset Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[11px] font-medium text-muted-foreground mr-1 hidden lg:inline">
                  Select sample:
                </span>
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setActivePreset(preset);
                      setSimStep(4);
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      activePreset.id === preset.id
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                        : 'bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 4-Step Pipeline Flow Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 my-3 px-2">
              {[
                { step: 1, title: 'Parse & Plan', desc: 'Dependencies & Ports', icon: Layers, status: 'done' },
                { step: 2, title: 'Multi-Generate', desc: 'Docker & K8s Spec', icon: FileCode2, status: 'done' },
                { step: 3, title: 'Self-Healing Loop', desc: 'Validates & Auto-Fixes', icon: ShieldCheck, status: 'done' },
                { step: 4, title: 'Cost & Explanations', desc: `~$${activePreset.cost}/month`, icon: DollarSign, status: 'done' },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all ${
                    simStep >= s.step
                      ? 'border-blue-500/40 bg-blue-500/10 text-foreground'
                      : 'border-border/40 bg-card/40 text-muted-foreground'
                  }`}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-500/20 text-blue-400">
                    <s.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate flex items-center gap-1">
                      <span>{s.title}</span>
                      <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Simulator Code & Output Display */}
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-3 mt-2">
              {/* Left Column: Natural Input & Analysis */}
              <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/60 p-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Input Description
                    </span>
                    <Badge variant="outline" className="text-[10px]">{activePreset.tag}</Badge>
                  </div>
                  <div className="rounded-lg border border-border/80 bg-card/70 p-3 font-mono text-xs text-foreground/90 leading-relaxed">
                    &ldquo;{activePreset.prompt}&rdquo;
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Network Port Exposure:</span>
                    <span className="font-mono text-foreground font-semibold">{activePreset.ports}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Generated Artifacts:</span>
                    <span className="text-blue-400 font-medium">{activePreset.artifacts.length} files</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Static Validation:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Passed (0 errors)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Estimated Monthly Cost:</span>
                    <span className="text-amber-400 font-mono font-bold">~${activePreset.cost} / mo</span>
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  <Link href={`/demo?template=${activePreset.id}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 border-blue-500/40 text-blue-400 hover:bg-blue-500/10">
                      <span>Open in Real Generator</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column: Code Preview with Tabs */}
              <div className="flex flex-col rounded-xl border border-border/60 bg-neutral-950/90 overflow-hidden">
                <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/60 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('docker')}
                      className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                        activeTab === 'docker'
                          ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <FileCode2 className="h-3 w-3" />
                      <span>Dockerfile (Prod)</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('k8s')}
                      className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                        activeTab === 'k8s'
                          ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Layers className="h-3 w-3" />
                      <span>k8s-deployment.yaml</span>
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-neutral-500">
                    Validated output
                  </span>
                </div>

                <div className="p-4 font-mono text-xs text-neutral-200 overflow-x-auto max-h-[300px] leading-relaxed">
                  <pre className="text-blue-200/90 whitespace-pre">
                    {activeTab === 'docker'
                      ? activePreset.dockerfileSnippet
                      : activePreset.k8sSnippet}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
