'use client';

import * as React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileCode2,
  Layers,
  RotateCw,
  DollarSign,
  FileCheck2,
  Radio,
} from 'lucide-react';

const FEATURES = [
  {
    icon: FileCode2,
    badge: 'Multi-Stage',
    title: 'Hardened Dockerfiles',
    description:
      'Creates production-grade Dockerfiles with distinct dev and prod variants, optimized build cache layers, and secure non-root users.',
    gradient: 'from-blue-500/20 to-cyan-500/10',
    iconColor: 'text-blue-400',
  },
  {
    icon: Layers,
    badge: 'Kubernetes',
    title: 'Full K8s Manifest Suite',
    description:
      'Generates Deployments, Services, ConfigMaps, and Horizontal Pod Autoscalers (HPA) tailored with appropriate health probes and resource limits.',
    gradient: 'from-indigo-500/20 to-purple-500/10',
    iconColor: 'text-indigo-400',
  },
  {
    icon: RotateCw,
    badge: 'Self-Correction',
    title: 'Self-Healing Validation Loop',
    description:
      'The agent verifies its own output against linter rules. When issues like unpinned base images or missing env variables occur, it automatically retries and fixes them.',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    iconColor: 'text-emerald-400',
  },
  {
    icon: DollarSign,
    badge: 'Cost Intelligence',
    title: 'Monthly Cloud Cost Estimates',
    description:
      'Instantly calculates a realistic monthly dollar estimate ($/mo) itemized by CPU, memory, persistent storage, and cluster control planes.',
    gradient: 'from-amber-500/20 to-orange-500/10',
    iconColor: 'text-amber-400',
  },
  {
    icon: FileCheck2,
    badge: 'Transparency',
    title: 'Plain-English Decision Log',
    description:
      'Every config comes with clear architectural rationale explaining why specific base images, ports, and replica limits were chosen.',
    gradient: 'from-cyan-500/20 to-blue-500/10',
    iconColor: 'text-cyan-400',
  },
  {
    icon: Radio,
    badge: 'Live Streaming',
    title: 'Real-time SSE Pipeline',
    description:
      'Experience zero dead time. Server-Sent Events stream each agent phase (parsing, generating, validating, estimating) as it executes.',
    gradient: 'from-violet-500/20 to-fuchsia-500/10',
    iconColor: 'text-violet-400',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 md:py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-3 border-blue-500/30 text-blue-400 bg-blue-500/10">
            Engineered for Developers &amp; DevOps
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Everything your app needs to run in production
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            Built from scratch to eliminate infrastructure friction. No more searching StackOverflow for sample YAML or debugging Docker cache layer invalidation.
          </p>
        </div>

        {/* Feature Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map((f, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <Card className="h-full border-border/70 bg-card/60 hover:bg-card/90 hover:border-blue-500/40 transition-all duration-300 group hover:-translate-y-1 shadow-lg hover:shadow-blue-500/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} border border-white/5 shadow-inner group-hover:scale-105 transition-transform`}
                    >
                      <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                    </div>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono">
                      {f.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-300 transition-colors">
                    {f.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                    {f.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
