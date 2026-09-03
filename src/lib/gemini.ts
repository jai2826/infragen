import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const rawApiKey = process.env.GEMINI_API_KEY;
const apiKey = rawApiKey && rawApiKey !== '[SENSITIVE]' ? rawApiKey : undefined;

if (!apiKey) {
  // Fail loudly at boot rather than silently at first request.
  // eslint-disable-next-line no-console
  console.warn('[gemini] GEMINI_API_KEY is not set — AI calls will fail.');
}

const genAI = new GoogleGenerativeAI(apiKey ?? '');

const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
].filter(Boolean) as string[];

async function executeWithRetry<T>(fn: (modelName: string) => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const modelName = CANDIDATE_MODELS[attempt % CANDIDATE_MODELS.length] ?? 'gemini-3.5-flash';
    try {
      return await fn(modelName);
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      const message = (err as Error)?.message ?? '';
      const isRetryable =
        status === 503 ||
        status === 429 ||
        message.includes('503') ||
        message.includes('high demand') ||
        message.includes('429');

      if (!isRetryable || attempt === maxRetries - 1) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, (attempt + 1) * 1000));
    }
  }
  throw lastError;
}

/**
 * Plain text generation — used for Step 4 (explanations, human-readable output).
 */
export async function generateText(prompt: string, systemInstruction?: string) {
  return executeWithRetry(async (modelName) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction,
    });

    const result = await model.generateContent(prompt);
    return result.response.text();
  });
}

/**
 * Structured JSON generation — used for Step 1 (Parse & Plan), where we need
 * a reliable, typed object rather than free text we then have to parse ourselves.
 * Pass a Gemini responseSchema so the model is constrained at the API level.
 */
export async function generateStructured<T>({
  prompt,
  systemInstruction,
  responseSchema,
}: {
  prompt: string;
  systemInstruction?: string;
  responseSchema: object;
}): Promise<T> {
  return executeWithRetry(async (modelName) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema as never,
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error(`Gemini returned non-JSON output despite schema constraint: ${text}`);
    }
  });
}

export { SchemaType };
