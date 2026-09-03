import type { ConfigArtifact, ValidationIssue, ValidationResult } from './types';

/**
 * ---------------------------------------------------------------------------
 * MOCKED VALIDATION LAYER
 * ---------------------------------------------------------------------------
 * This module intentionally mirrors the exact shape a real implementation
 * would have, so swapping mock -> real is a one-file change, not a redesign:
 *
 *   Real Dockerfile validation -> spawn `hadolint` as a child process,
 *     parse its JSON output (`hadolint --format json <path>`).
 *   Real k8s manifest validation -> spawn `kubeconform`, parse its output.
 *
 * Both real tools need a writable temp file and a shell with the binary
 * installed — which is why this app's validation step must run somewhere
 * with a full runtime (Render/Railway/VPS), not on serverless/edge.
 *
 * Until that's wired up, this layer runs cheap static checks so the
 * generate -> validate -> retry loop is fully functional end-to-end.
 * ---------------------------------------------------------------------------
 */

function checkDockerfile(content: string, variant: 'DEV' | 'PROD'): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (/FROM\s+\S+:latest/i.test(content)) {
    issues.push({
      artifactType: 'DOCKERFILE',
      variant,
      severity: variant === 'PROD' ? 'error' : 'warning',
      message: 'Base image uses the "latest" tag — pin an explicit version for reproducible builds.',
    });
  }

  if (variant === 'PROD' && !/USER\s+(?!root)\S+/i.test(content)) {
    issues.push({
      artifactType: 'DOCKERFILE',
      variant,
      severity: 'error',
      message: 'Production image does not switch to a non-root USER.',
    });
  }

  if (/(password|secret|api[_-]?key)\s*=\s*['"][^'"]+['"]/i.test(content)) {
    issues.push({
      artifactType: 'DOCKERFILE',
      variant,
      severity: 'error',
      message: 'Possible hardcoded secret detected in Dockerfile — use env vars / build secrets instead.',
    });
  }

  return issues;
}

function checkK8sManifest(content: string, type: string, variant: 'DEV' | 'PROD'): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (type === 'K8S_DEPLOYMENT' && variant === 'PROD') {
    if (!/resources:\s*\n\s*(requests|limits):/i.test(content)) {
      issues.push({
        artifactType: type as ValidationIssue['artifactType'],
        variant,
        severity: 'error',
        message: 'Production Deployment is missing resource requests/limits.',
      });
    }
    if (!/(readinessProbe|livenessProbe):/i.test(content)) {
      issues.push({
        artifactType: type as ValidationIssue['artifactType'],
        variant,
        severity: 'error',
        message: 'Production Deployment is missing liveness/readiness probes.',
      });
    }
  }

  return issues;
}

/**
 * Runs all applicable checks against a batch of generated artifacts.
 * This is the function call-site (agent pipeline) depends on — its
 * signature won't need to change when the internals become real tool calls.
 */
export async function validateArtifacts(artifacts: ConfigArtifact[]): Promise<ValidationResult> {
  const issues: ValidationIssue[] = [];

  for (const artifact of artifacts) {
    if (artifact.type === 'DOCKERFILE') {
      issues.push(...checkDockerfile(artifact.content, artifact.variant));
    } else if (artifact.type.startsWith('K8S_')) {
      issues.push(...checkK8sManifest(artifact.content, artifact.type, artifact.variant));
    }
    // DOCKER_COMPOSE: add compose-specific checks here as needed.
  }

  const hasErrors = issues.some((i) => i.severity === 'error');
  return { passed: !hasErrors, issues };
}
