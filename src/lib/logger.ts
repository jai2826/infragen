import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

const VALID_LEVELS = new Set(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']);

function getLogLevel(): string {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  if (envLevel && VALID_LEVELS.has(envLevel)) {
    return envLevel;
  }
  return isDev ? 'debug' : 'info';
}

export const logger = pino({
  level: getLogLevel(),
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
      }
    : undefined,
});

/**
 * Creates a child logger scoped to a single generation run,
 * so every log line for a request can be filtered by generationId.
 */
export function getGenerationLogger(generationId: string) {
  return logger.child({ generationId });
}
