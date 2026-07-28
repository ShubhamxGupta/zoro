import os from 'os';
import { config, logger } from '@repo-intel/shared';
import { createAppServer } from './server.js';

async function startServer(): Promise<void> {
  const app = createAppServer();

  try {
    const address = await app.listen({
      port: config.PORT,
      host: config.HOST,
    });

    const hostForDoc = config.HOST === '0.0.0.0' ? 'localhost' : config.HOST;
    const docUrl = `http://${hostForDoc}:${config.PORT}/documentation`;
    const version = '0.6.0';
    const commit = process.env.GIT_COMMIT || 'a8f9210';
    const env = config.NODE_ENV || 'development';
    const hostPort = `${config.HOST}:${config.PORT}`;
    const providers = ['openai', 'anthropic', 'ollama', 'vllm'];
    const extensions = ['org.example.custom-security-agent'];
    const plugins = ['security', 'swagger', 'operations', 'rbac', 'circuit-breaker'];

    // Concise Startup Console Banner
    console.log(`
┌────────────────────────────────────────────────────────────────────────────┐
│                    REPO INTELLIGENCE PLATFORM GATEWAY                      │
├────────────────────────────────────────────────────────────────────────────┤
│ Version:          ${version.padEnd(56)}                                    │
│ Git Commit:       ${commit.padEnd(56)}                                     │
│ Environment:      ${env.padEnd(56)}                                        │
│ Host / Port:      ${hostPort.padEnd(56)}                                   │
│ Documentation:    ${docUrl.padEnd(56)}                                     │
│ Loaded Providers: ${providers.join(', ').padEnd(56)}                       │
│ Loaded Extensions:${extensions.join(', ').padEnd(56)}                      │
│ Enabled Plugins:  ${plugins.join(', ').padEnd(56)}                         │
└────────────────────────────────────────────────────────────────────────────┘
`);

    // Structured JSON Startup Log Entry
    logger.info({
      msg: 'REST API Gateway Initialized',
      appName: 'repo-intelligence-platform',
      version,
      buildVersion: process.env.BUILD_VERSION || 'v0.6.0-beta',
      gitCommitHash: commit,
      nodeVersion: process.version,
      operatingSystem: `${os.platform()} (${os.release()})`,
      cpuArchitecture: os.arch(),
      environment: env,
      startupTimestamp: new Date().toISOString(),
      configuredPort: config.PORT,
      configuredHost: config.HOST,
      listenAddress: address,
      documentationUrl: docUrl,
      enabledProviders: providers,
      loadedExtensions: extensions,
      enabledPlugins: plugins,
      service: 'repo-intel-service',
      component: 'System-Startup',
    });

    const shutdown = async (signal: string) => {
      logger.info({
        msg: `Received ${signal}, initiating graceful server shutdown...`,
        service: 'repo-intel-service',
        component: 'System-Shutdown',
      });
      try {
        await app.close();
        logger.info({
          msg: 'REST API Gateway successfully closed. Exiting process.',
          service: 'repo-intel-service',
          component: 'System-Shutdown',
        });
        process.exit(0);
      } catch (err) {
        logger.error({
          msg: 'Error during server shutdown',
          error: (err as Error).message,
          service: 'repo-intel-service',
          component: 'System-Shutdown',
        });
        process.exit(1);
      }
    };

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
  } catch (err) {
    logger.fatal({
      msg: 'Failed to start REST API Gateway server',
      error: (err as Error).message,
      service: 'repo-intel-service',
      component: 'System-Startup',
    });
    process.exit(1);
  }
}

void startServer();
