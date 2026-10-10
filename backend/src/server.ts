import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { checkDatabaseConnection } from './config/db.js';

async function bootstrap() {
  try {
    const isDbConnected = await checkDatabaseConnection();
    if (isDbConnected) {
      logger.info('Database connection established successfully.');
    } else {
      logger.warn('Database connection unavailable. Running in fallback/development mode.');
    }

    const server = app.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          env: env.NODE_ENV,
          url: `http://localhost:${env.PORT}`,
          health: `http://localhost:${env.PORT}/api/health`,
        },
        `🚀 Campus 360 API Server running on port ${env.PORT}`
      );
    });

    const shutdown = () => {
      logger.info('Shutting down server gracefully...');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.fatal({ error }, 'Failed to start Campus 360 API Server');
    process.exit(1);
  }
}

bootstrap();
