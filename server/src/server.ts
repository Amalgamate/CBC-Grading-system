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
    console.log(`[CORS] Processing request from origin: "${origin}" (type: ${typeof origin})`);
    
    if (!origin) {
      console.log('[CORS] No origin header (likely same-origin or direct request)');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log(`[CORS] ✓ Origin in allowedOrigins list`);
      return callback(null, true);
    }

    // Allow any localhost ports for development (HTTP OR HTTPS)
    if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost')) {
      console.log(`[CORS] ✓ Localhost (any scheme/port) allowed`);
      return callback(null, true);
    }
    // Allow localhost subdomains (e.g mary.localhost:3000)
    if (/^https?:\/\/.*\.localhost(:\d+)?$/.test(origin)) {
      console.log(`[CORS] ✓ Localhost subdomain allowed`);
      return callback(null, true);
    }
    if (origin.startsWith('http://127.') || origin.startsWith('https://127.')) {
      console.log(`[CORS] ✓ 127.x.x.x allowed`);
      return callback(null, true);
    }
    
    // Allow Capacitor/Mobile app origins (Android WebView)
    if (origin === 'capacitor://localhost') {
      console.log('[CORS] ✓ Capacitor localhost allowed');
      return callback(null, true);
    }
    if (origin?.startsWith('capacitor://')) {
      console.log('[CORS] ✓ Capacitor origin allowed');
      return callback(null, true);
    }
    if (origin === 'file://localhost') {
      console.log('[CORS] ✓ file://localhost allowed');
      return callback(null, true);
    }
    if (origin?.startsWith('file://')) {
      console.log('[CORS] ✓ file:// origin allowed');
      return callback(null, true);
    }

    // Check wildcard pattern for deployment domain
    if (process.env.NODE_ENV !== 'production' || process.env.SUBDOMAIN_ENABLED === 'true') {
      if (subdomainPattern.test(origin)) {
        console.log(`[CORS] ✓ Subdomain pattern matched`);
        return callback(null, true);
      }
    }

    console.log(`[CORS] ✗ REJECTED - Origin not in allowed list: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-School-Id', 'X-Branch-Id', 'X-Portal-School-Id', 'Accept'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400
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
