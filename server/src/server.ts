import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { extractSubdomain, extractPathTenant } from './middleware/subdomain.middleware';
import { subdomainAuth } from './middleware/subdomain-auth.middleware';

const app: Application = express();

// Trust proxy (required for Vercel/Render/Heroku)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS Configuration - Support wildcard subdomains
const deploymentDomain = process.env.DEPLOYMENT_DOMAIN || 'elimcrown.co.ke';
const allowedOrigins = [
  process.env.FRONTEND_URL || '',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
].filter(Boolean);

// Build subdomain pattern for CORS
const subdomainPattern = new RegExp(
  `https?://([a-z0-9-]+\\.)?${deploymentDomain.replace(/\./g, '\\.')}(:\\d+)?$`
);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    
    // Allow any localhost ports for development
    if (origin.startsWith('http://localhost:')) return callback(null, true);
    if (origin.startsWith('http://127.')) return callback(null, true);
    
    // Check wildcard pattern for deployment domain
    if (process.env.NODE_ENV !== 'production' || process.env.SUBDOMAIN_ENABLED === 'true') {
      if (subdomainPattern.test(origin)) return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// IMPORTANT: Subdomain extraction middleware must be early in pipeline
// This extracts subdomain from host header before any routing
app.use(extractSubdomain);
app.use(extractPathTenant);

// API Routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
