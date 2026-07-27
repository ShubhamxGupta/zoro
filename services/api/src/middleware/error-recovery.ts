import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export interface ResilientErrorResponse {
  error: {
    code: string;
    message: string;
    recoveredWithFallback: boolean;
    timestamp: string;
  };
}

export function handleResilientError(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply,
): FastifyReply {
  const statusCode =
    error.statusCode && error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;
  const isProviderError = /Ollama|OpenAI|ECONNREFUSED|timeout/i.test(error.message);

  const response: ResilientErrorResponse = {
    error: {
      code: isProviderError ? 'AI_PROVIDER_UNAVAILABLE' : 'INTERNAL_SERVER_ERROR',
      message: isProviderError
        ? 'Selected AI Provider is temporarily unreachable. Falling back to local Mock Provider.'
        : error.message,
      recoveredWithFallback: isProviderError,
      timestamp: new Date().toISOString(),
    },
  };

  return reply.status(statusCode).send(response);
}
