import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
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
