import { SchemaType } from '@/lib/gemini';
import type { ArtifactType, ArtifactVariant, InfraPlan, ValidationIssue } from './types';

export const PARSE_SYSTEM_INSTRUCTION = `You are an infrastructure requirements analyst.
Given a description of an application (as free text, file contents, or source code),
extract a structured infrastructure plan. Be conservative: only include services and
env vars you have real evidence for. Where the input is ambiguous, make a reasonable
assumption and record it in "notes" rather than inventing unsupported detail.
Never include secrets, credentials, or API keys you see in the input verbatim in your
output — reference them by name only.`;

export function buildParsePrompt(rawInput: string, inputMode: string) {
  return `Input mode: ${inputMode}
---
${rawInput}
---
Extract the infrastructure plan as JSON matching the provided schema.`;
}

export const PARSE_RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    runtime: {
      type: SchemaType.OBJECT,
      properties: {
        language: { type: SchemaType.STRING },
        version: { type: SchemaType.STRING },
        framework: { type: SchemaType.STRING },
      },
      required: ['language', 'version'],
    },
    services: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          purpose: { type: SchemaType.STRING },
        },
        required: ['name', 'purpose'],
      },
    },
    ports: { type: SchemaType.ARRAY, items: { type: SchemaType.NUMBER } },
    envVars: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          required: { type: SchemaType.BOOLEAN },
          description: { type: SchemaType.STRING },
        },
        required: ['name', 'required', 'description'],
      },
    },
    scaling: {
      type: SchemaType.OBJECT,
      properties: {
        expectedTraffic: { type: SchemaType.STRING },
        statefulness: { type: SchemaType.STRING },
      },
      required: ['expectedTraffic', 'statefulness'],
    },
    notes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: ['runtime', 'services', 'ports', 'envVars', 'scaling', 'notes'],
};

export const GENERATE_SYSTEM_INSTRUCTION = `You are a senior DevOps engineer generating
production-grade Docker and Kubernetes configuration files. Follow these hard rules:
- PROD variants: multi-stage builds, non-root user, pinned (non-"latest") base image
  tags, explicit resource requests/limits, liveness+readiness probes.
- DEV variants: optimize for fast iteration (bind mounts, hot reload), it's fine to
  run as root and skip resource limits.
- Never hardcode secrets; reference them via env vars / k8s Secrets.
- Output ONLY the raw file content for the requested artifact, no markdown fences,
  no commentary.`;

export function buildGeneratePrompt(
  plan: InfraPlan,
  artifactType: ArtifactType,
  variant: ArtifactVariant,
  priorIssues?: ValidationIssue[],
) {
  const feedback =
    priorIssues && priorIssues.length > 0
      ? `\nThe previous version of this file failed validation with these issues — fix them:\n${priorIssues
          .map((i) => `- [${i.severity}] ${i.message}`)
          .join('\n')}`
      : '';

  return `Infra plan:\n${JSON.stringify(plan, null, 2)}\n
Generate the ${variant} variant of: ${artifactType}${feedback}`;
}

export const EXPLAIN_SYSTEM_INSTRUCTION = `You are a senior engineer leaving a concise,
high-signal PR review comment. Explain the 2-4 most important design decisions in the
given config file in plain language, as a hiring manager or junior dev would want to
read it. No fluff, no restating the obvious. Max 120 words.`;

export function buildExplainPrompt(artifactType: ArtifactType, variant: ArtifactVariant, content: string) {
  return `File: ${artifactType} (${variant})\n---\n${content}\n---\nExplain the key decisions.`;
}
