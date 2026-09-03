import type { CostEstimate, InfraPlan } from './types';

/**
 * Simplified on-demand pricing references (approx, us-east / single region,
 * as of general public rate cards). Intentionally rough — this estimate is
 * meant to give directional signal ("~$40/mo" vs "~$400/mo"), not a bill.
 * Swap for a live pricing API (e.g. AWS Price List API) if you want this
 * to be more than directional.
 */
const PRICING = {
  vcpuHourUsd: 0.04,
  gbRamHourUsd: 0.005,
  managedDbBaseUsd: 15,
  cacheBaseUsd: 12,
  hoursPerMonth: 730,
};

export function estimateMonthlyCost(plan: InfraPlan, replicas: number): CostEstimate {
  const breakdown: CostEstimate['breakdown'] = [];

  const cpuCount = plan.scaling.expectedTraffic === 'high' ? 1 : 0.5;
  const ramGb = plan.scaling.expectedTraffic === 'high' ? 1 : 0.5;

  const computeCost =
    (cpuCount * PRICING.vcpuHourUsd + ramGb * PRICING.gbRamHourUsd) * PRICING.hoursPerMonth * replicas;
  breakdown.push({ item: `App compute (${replicas} replica(s))`, monthlyUsd: round(computeCost) });

  for (const service of plan.services) {
    if (/postgres|mysql|mongo|database|db/i.test(service.name)) {
      breakdown.push({ item: `Managed DB (${service.name})`, monthlyUsd: PRICING.managedDbBaseUsd });
    } else if (/redis|cache/i.test(service.name)) {
      breakdown.push({ item: `Cache (${service.name})`, monthlyUsd: PRICING.cacheBaseUsd });
    }
  }

  const monthlyUsd = round(breakdown.reduce((sum, b) => sum + b.monthlyUsd, 0));

  return {
    monthlyUsd,
    breakdown,
    assumptions: [
      `${replicas} replica(s) at ${plan.scaling.expectedTraffic} traffic tier`,
      'On-demand pricing, single region, no reserved/spot discounts',
      'Managed DB/cache costs are flat-rate estimates for smallest viable tier',
    ],
  };
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
