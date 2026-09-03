export type InputMode = 'TEXT' | 'FILE' | 'CODE';

/**
 * The structured output of Step 1 (Parse & Plan).
 * This is deliberately shown to the user in the UI as an intermediate
 * artifact — "here's what the AI understood before writing anything" —
 * it's the single best trust-building element in the product.
 */
export interface InfraPlan {
  runtime: {
    language: string; // e.g. "node", "python"
    version: string; // e.g. "20", "3.12"
    framework?: string; // e.g. "express", "fastapi"
  };
  services: Array<{
    name: string; // e.g. "postgres", "redis"
    purpose: string; // e.g. "primary database"
  }>;
  ports: number[];
  envVars: Array<{ name: string; required: boolean; description: string }>;
  scaling: {
    expectedTraffic: 'low' | 'medium' | 'high';
    statefulness: 'stateless' | 'stateful';
  };
  notes: string[]; // anything ambiguous the agent inferred/assumed
}

export type ArtifactType =
  | 'DOCKERFILE'
  | 'DOCKER_COMPOSE'
  | 'K8S_DEPLOYMENT'
  | 'K8S_SERVICE'
  | 'K8S_CONFIGMAP'
  | 'K8S_HPA';

export type ArtifactVariant = 'DEV' | 'PROD';

export interface ConfigArtifact {
  type: ArtifactType;
  variant: ArtifactVariant;
  content: string;
  explanation?: string;
}

export interface ValidationIssue {
  artifactType: ArtifactType;
  variant: ArtifactVariant;
  severity: 'error' | 'warning';
  message: string;
  line?: number;
}

export interface ValidationResult {
  passed: boolean;
  issues: ValidationIssue[];
}

export interface CostEstimate {
  monthlyUsd: number;
  breakdown: Array<{ item: string; monthlyUsd: number }>;
  assumptions: string[];
}

/**
 * Events streamed to the client over SSE so the UI can render the
 * live "step tracker". Keep this shape stable — it's the contract
 * between backend pipeline and frontend.
 */
export type AgentEvent =
  | { type: 'step_started'; step: PipelineStep; attempt: number }
  | { type: 'step_succeeded'; step: PipelineStep; attempt: number; data?: unknown }
  | { type: 'step_failed'; step: PipelineStep; attempt: number; error: string }
  | { type: 'infra_plan'; plan: InfraPlan }
  | { type: 'artifacts'; artifacts: ConfigArtifact[] }
  | { type: 'validation'; result: ValidationResult }
  | { type: 'cost_estimate'; estimate: CostEstimate }
  | { type: 'complete'; generationId: string }
  | { type: 'fatal_error'; error: string };

export type PipelineStep = 'parse' | 'generate' | 'validate' | 'explain';
