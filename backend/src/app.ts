import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { requestLogger } from './middlewares/logging.middleware';
import { rateLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler } from './middlewares/error.middleware';
import apiRouter from './routes';
import { NotFoundError } from './utils/errors';

const app: Express = express();

// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing
const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);

      // Check if origin is in the allowed list or if wildcard is enabled
      const isAllowed = allowedOrigins.some((allowed) => allowed === '*' || allowed === origin);

      // Allow Vercel preview/branch deployments for this project
      const isVercelPreview =
        origin.endsWith('.vercel.app') &&
        (origin.includes('user-management-platform') || origin.includes('yashlahases-projects'));

      // Allow localhost origins in non-production environments
      const isLocalhost =
        env.NODE_ENV !== 'production' &&
        (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'));

      if (isAllowed || isVercelPreview || isLocalhost) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-actor'],
    credentials: true,
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use(requestLogger);

// Rate Limiting (Applied globally except tests)
app.use(rateLimiter);

// Swagger Documentation
try {
  const swaggerDocument = YAML.load(path.join(__dirname, './docs/swagger.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.error('Failed to load Swagger documentation:', error);
}

// Health Check API
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// API Routes
app.use('/api/v1', apiRouter);

// Fallback Route (404 Handler)
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError('The requested route does not exist.'));
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
