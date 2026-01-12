import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import corsOptions from './config/cors.config.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { apiLimiter } from './middlewares/rateLimiter.middleware.js';

// Import routes
import routes from './routes/index.js';

const app = express();

// ============== Security Middlewares ==============
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // CORS configuration

// ============== Body Parsers ==============
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

// ============== Rate Limiting ==============
app.use('/api', apiLimiter);

// ============== Health Check Route ==============
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Chugli Server is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ============== API Routes ==============
app.use('/api/v1', routes);

// ============== Error Handlers ==============
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
