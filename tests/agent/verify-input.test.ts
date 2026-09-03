import { describe, expect, it } from 'vitest';
import {
  buildVerifyPrompt,
  VERIFY_RESPONSE_SCHEMA,
  VERIFY_SYSTEM_INSTRUCTION,
} from '@/lib/agent/prompts';
import type { InputVerification } from '@/lib/agent/types';

describe('AI Input Verification', () => {
  it('builds verification prompt containing input mode and raw input text', () => {
    const prompt = buildVerifyPrompt('Hello harry', 'TEXT');
    expect(prompt).toContain('Input mode: TEXT');
    expect(prompt).toContain('Hello harry');
    expect(prompt).toContain('Analyze this input and determine if it represents a valid application');
  });

  it('contains strict gatekeeping instructions for greetings, gibberish, and off-topic prompts', () => {
    expect(VERIFY_SYSTEM_INSTRUCTION).toContain('hello harry');
    expect(VERIFY_SYSTEM_INSTRUCTION).toContain('greeting_or_chat');
    expect(VERIFY_SYSTEM_INSTRUCTION).toContain('unrelated_topic');
    expect(VERIFY_SYSTEM_INSTRUCTION).toContain('insufficient_detail');
  });

  it('defines the required structured schema with all mandatory fields', () => {
    expect(VERIFY_RESPONSE_SCHEMA.required).toEqual([
      'isValid',
      'confidence',
      'detectedType',
      'reason',
      'suggestions',
    ]);
    expect(VERIFY_RESPONSE_SCHEMA.properties).toHaveProperty('isValid');
    expect(VERIFY_RESPONSE_SCHEMA.properties).toHaveProperty('confidence');
    expect(VERIFY_RESPONSE_SCHEMA.properties).toHaveProperty('detectedType');
    expect(VERIFY_RESPONSE_SCHEMA.properties).toHaveProperty('reason');
    expect(VERIFY_RESPONSE_SCHEMA.properties).toHaveProperty('suggestions');
  });

  it('correctly models an invalid greeting response structure', () => {
    const mockRejectedVerification: InputVerification = {
      isValid: false,
      confidence: 0.98,
      detectedType: 'greeting_or_chat',
      reason: "The input appears to be a personal greeting ('Hello harry') without application details or architecture to containerize.",
      suggestions: [
        "Describe your tech stack (e.g., 'Fullstack Next.js app with PostgreSQL and Redis')",
        'Upload an application manifest like package.json or requirements.txt',
        'Paste your server source code',
      ],
    };

    expect(mockRejectedVerification.isValid).toBe(false);
    expect(mockRejectedVerification.detectedType).toBe('greeting_or_chat');
    expect(mockRejectedVerification.suggestions.length).toBeGreaterThanOrEqual(2);
  });
});
