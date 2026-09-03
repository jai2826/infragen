import { NextRequest } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { runAgentPipeline } from '@/lib/agent/pipeline';
import type { AgentEvent } from '@/lib/agent/types';
import { logger } from '@/lib/logger';

// This route needs a full Node runtime (child processes for real validation
// tools land here in week 2) so it must NOT run on the Edge runtime.
export const runtime = 'nodejs';

const requestSchema = z.object({
  inputMode: z.enum(['TEXT', 'FILE', 'CODE']),
  rawInput: z.string().min(1).max(20_000),
});

export async function POST(req: NextRequest) {
  let session = null;
  try {
    session = await auth.api.getSession({ headers: req.headers });
  } catch (authErr) {
    logger.warn({ authErr }, 'Could not resolve auth session, proceeding as guest');
  }

  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });
  }
  const { inputMode, rawInput } = parsed.data;

  const generationId = nanoid();
  let dbPersisted = false;

  if (session?.user?.id) {
    try {
      await prisma.generation.create({
        data: {
          id: generationId,
          userId: session.user.id,
          inputMode,
          rawInput,
          status: 'PENDING',
        },
      });
      dbPersisted = true;
    } catch (dbErr) {
      logger.warn({ dbErr, generationId }, 'Failed to persist initial generation in database');
    }
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: AgentEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        await runAgentPipeline(generationId, rawInput, inputMode, emit);
        if (dbPersisted) {
          await prisma.generation.update({
            where: { id: generationId },
            data: { status: 'COMPLETE' },
          }).catch((err: unknown) => logger.warn({ err }, 'Failed to update generation status to COMPLETE'));
        }
      } catch (err) {
        logger.error({ err, generationId }, 'pipeline crashed');
        emit({ type: 'fatal_error', error: 'Internal error while generating configs.' });
        if (dbPersisted) {
          await prisma.generation.update({
            where: { id: generationId },
            data: { status: 'FAILED' },
          }).catch((err: unknown) => logger.warn({ err }, 'Failed to update generation status to FAILED'));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
