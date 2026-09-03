import { describe, expect, it } from 'vitest';
import { validateArtifacts } from '@/lib/agent/validators';
import type { ConfigArtifact } from '@/lib/agent/types';

describe('validateArtifacts', () => {
  it('flags a prod Dockerfile running as root', async () => {
    const artifacts: ConfigArtifact[] = [
      {
        type: 'DOCKERFILE',
        variant: 'PROD',
        content: 'FROM node:20-slim\nWORKDIR /app\nCOPY . .\nCMD ["node", "index.js"]',
      },
    ];

    const result = await validateArtifacts(artifacts);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ message: expect.stringContaining('non-root USER') }),
    );
  });

  it('passes a prod Dockerfile with a pinned image and non-root user', async () => {
    const artifacts: ConfigArtifact[] = [
      {
        type: 'DOCKERFILE',
        variant: 'PROD',
        content: 'FROM node:20.11-slim\nUSER appuser\nWORKDIR /app\nCOPY . .\nCMD ["node", "index.js"]',
      },
    ];

    const result = await validateArtifacts(artifacts);
    expect(result.passed).toBe(true);
  });

  it('allows root user in dev Dockerfiles (warning only, not blocking)', async () => {
    const artifacts: ConfigArtifact[] = [
      {
        type: 'DOCKERFILE',
        variant: 'DEV',
        content: 'FROM node:20\nWORKDIR /app\nCOPY . .\nCMD ["npm", "run", "dev"]',
      },
    ];

    const result = await validateArtifacts(artifacts);
    expect(result.passed).toBe(true);
  });

  it('flags a prod k8s Deployment missing resource limits and probes', async () => {
    const artifacts: ConfigArtifact[] = [
      {
        type: 'K8S_DEPLOYMENT',
        variant: 'PROD',
        content: 'apiVersion: apps/v1\nkind: Deployment\nspec:\n  replicas: 2',
      },
    ];

    const result = await validateArtifacts(artifacts);

    expect(result.passed).toBe(false);
    expect(result.issues.length).toBeGreaterThanOrEqual(2);
  });
});
