import { describe, expect, it } from 'vitest';
import { estimateMonthlyCost } from '@/lib/agent/cost-estimate';
import type { InfraPlan } from '@/lib/agent/types';

const basePlan: InfraPlan = {
  runtime: { language: 'node', version: '20', framework: 'express' },
  services: [
    { name: 'postgres', purpose: 'primary database' },
    { name: 'redis', purpose: 'session cache' },
  ],
  ports: [3000],
  envVars: [],
  scaling: { expectedTraffic: 'medium', statefulness: 'stateless' },
  notes: [],
};

describe('estimateMonthlyCost', () => {
  it('includes a line item for each recognized managed service', () => {
    const estimate = estimateMonthlyCost(basePlan, 2);
    const items = estimate.breakdown.map((b) => b.item);

    expect(items.some((i) => i.includes('postgres'))).toBe(true);
    expect(items.some((i) => i.includes('redis'))).toBe(true);
  });

  it('scales compute cost with replica count', () => {
    const oneReplica = estimateMonthlyCost(basePlan, 1);
    const threeReplicas = estimateMonthlyCost(basePlan, 3);

    expect(threeReplicas.monthlyUsd).toBeGreaterThan(oneReplica.monthlyUsd);
  });
});
