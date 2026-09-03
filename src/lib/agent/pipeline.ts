import { generateStructured, generateText } from '@/lib/gemini';
import { getGenerationLogger } from '@/lib/logger';
import {
  buildExplainPrompt,
  buildGeneratePrompt,
  buildParsePrompt,
  EXPLAIN_SYSTEM_INSTRUCTION,
  GENERATE_SYSTEM_INSTRUCTION,
  PARSE_RESPONSE_SCHEMA,
  PARSE_SYSTEM_INSTRUCTION,
} from './prompts';
import { validateArtifacts } from './validators';
import { estimateMonthlyCost } from './cost-estimate';
import type { AgentEvent, ArtifactType, ArtifactVariant, ConfigArtifact, InfraPlan } from './types';

const MAX_VALIDATION_RETRIES = 3;

const ARTIFACT_MATRIX: Array<{ type: ArtifactType; variant: ArtifactVariant }> = [
  { type: 'DOCKERFILE', variant: 'DEV' },
  { type: 'DOCKERFILE', variant: 'PROD' },
  { type: 'DOCKER_COMPOSE', variant: 'DEV' },
  { type: 'K8S_DEPLOYMENT', variant: 'PROD' },
  { type: 'K8S_SERVICE', variant: 'PROD' },
  { type: 'K8S_CONFIGMAP', variant: 'PROD' },
  { type: 'K8S_HPA', variant: 'PROD' },
];

/**
 * Runs the full agentic pipeline for one generation request, emitting
 * AgentEvents as it goes via `emit`. Designed to be called from an SSE
 * route handler, but has no framework dependency itself — easy to unit test.
 */
export async function runAgentPipeline(
  generationId: string,
  rawInput: string,
  inputMode: string,
  emit: (event: AgentEvent) => void,
): Promise<void> {
  const log = getGenerationLogger(generationId);

  // ---- Step 1: Parse & Plan ----
  emit({ type: 'step_started', step: 'parse', attempt: 1 });
  let plan: InfraPlan;
  try {
    plan = await generateStructured<InfraPlan>({
      prompt: buildParsePrompt(rawInput, inputMode),
      systemInstruction: PARSE_SYSTEM_INSTRUCTION,
      responseSchema: PARSE_RESPONSE_SCHEMA,
    });
    log.info({ plan }, 'infra plan parsed');
    emit({ type: 'step_succeeded', step: 'parse', attempt: 1, data: plan });
    emit({ type: 'infra_plan', plan });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown parse error';
    log.error({ err }, 'parse step failed');
    emit({ type: 'step_failed', step: 'parse', attempt: 1, error: message });
    emit({ type: 'fatal_error', error: `Could not understand the input: ${message}` });
    return;
  }

  // ---- Step 2 + 3: Generate, then Validate with bounded retry loop ----
  emit({ type: 'step_started', step: 'generate', attempt: 1 });
  let artifacts: ConfigArtifact[] = [];
  let attempt = 1;
  let priorIssuesByArtifact = new Map<string, Parameters<typeof buildGeneratePrompt>[3]>();

  while (attempt <= MAX_VALIDATION_RETRIES) {
    artifacts = await Promise.all(
      ARTIFACT_MATRIX.map(async ({ type, variant }) => {
        const key = `${type}:${variant}`;
        const content = await generateText(
          buildGeneratePrompt(plan, type, variant, priorIssuesByArtifact.get(key)),
          GENERATE_SYSTEM_INSTRUCTION,
        );
        return { type, variant, content: stripCodeFences(content) };
      }),
    );

    emit({ type: 'step_succeeded', step: 'generate', attempt, data: { count: artifacts.length } });
    emit({ type: 'artifacts', artifacts });

    emit({ type: 'step_started', step: 'validate', attempt });
    const result = await validateArtifacts(artifacts);
    emit({ type: 'validation', result });

    if (result.passed) {
      emit({ type: 'step_succeeded', step: 'validate', attempt });
      log.info({ attempt }, 'validation passed');
      break;
    }

    log.warn({ attempt, issues: result.issues }, 'validation failed, retrying with feedback');
    emit({
      type: 'step_failed',
      step: 'validate',
      attempt,
      error: `${result.issues.length} issue(s) found`,
    });

    if (attempt === MAX_VALIDATION_RETRIES) {
      // Bounded retry exhausted — surface the last known issues rather than
      // looping forever or silently shipping broken config.
      log.error({ issues: result.issues }, 'max retries exhausted, shipping best-effort result');
      break;
    }

    // Feed each artifact's own issues back in as generation context for the next attempt.
    priorIssuesByArtifact = new Map(
      ARTIFACT_MATRIX.map(({ type, variant }) => [
        `${type}:${variant}`,
        result.issues.filter((i) => i.artifactType === type && i.variant === variant),
      ]),
    );
    attempt += 1;
    emit({ type: 'step_started', step: 'generate', attempt });
  }

  // ---- Step 4: Explain + Cost Estimate ----
  emit({ type: 'step_started', step: 'explain', attempt: 1 });
  try {
    const explained = await Promise.all(
      artifacts.map(async (artifact) => ({
        ...artifact,
        explanation: await generateText(
          buildExplainPrompt(artifact.type, artifact.variant, artifact.content),
          EXPLAIN_SYSTEM_INSTRUCTION,
        ),
      })),
    );
    artifacts = explained;
    emit({ type: 'artifacts', artifacts });

    const estimate = estimateMonthlyCost(plan, /* replicas */ 2);
    emit({ type: 'cost_estimate', estimate });

    emit({ type: 'step_succeeded', step: 'explain', attempt: 1 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown explain error';
    log.error({ err }, 'explain step failed (non-fatal, continuing without explanations)');
    emit({ type: 'step_failed', step: 'explain', attempt: 1, error: message });
  }

  emit({ type: 'complete', generationId });
}

function stripCodeFences(text: string): string {
  return text.replace(/^```[a-z]*\n?/i, '').replace(/```\s*$/i, '').trim();
}
