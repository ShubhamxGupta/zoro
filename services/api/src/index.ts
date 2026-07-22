import { config, logger } from '@repo-intel/shared';
import { createAppServer } from './server.js';

async function startServer(): Promise<void> {
  const app = createAppServer();

  try {
    const address = await app.listen({
      port: config.PORT,
      host: config.HOST,
    });

    logger.info({
      msg: 'REST API Gateway Initialized',
      address,
      port: config.PORT,
      host: config.HOST,
      environment: config.NODE_ENV,
      documentation: `http://${config.HOST === '0.0.0.0' ? 'localhost' : config.HOST}:${config.PORT}/documentation`,
    });

    const shutdown = async (signal: string) => {
      logger.info({ msg: `Received ${signal}, initiating graceful server shutdown...` });
      try {
        await app.close();
        logger.info({ msg: 'REST API Gateway successfully closed. Exiting process.' });
        process.exit(0);
      } catch (err) {
        logger.error({ msg: 'Error during server shutdown', error: (err as Error).message });
        process.exit(1);
      }
    };

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
  } catch (err) {
    logger.fatal({ msg: 'Failed to start REST API Gateway server', error: (err as Error).message });
    process.exit(1);
  }
}

void startServer();
