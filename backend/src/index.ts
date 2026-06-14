import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AuthController } from './controllers/AuthController';
import { ResearchController } from './controllers/ResearchController';
import { authenticateToken } from './middleware/AuthMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: '*', // Allow all origins for dev simplicity
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Authentication Routes
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);
app.get('/api/auth/profile', authenticateToken as any, AuthController.getProfile as any);
app.post('/api/auth/subscribe', authenticateToken as any, AuthController.updateSubscription as any);

// Research & Agent Orchestration Routes
app.post('/api/research/new', authenticateToken as any, ResearchController.createSession as any);
app.get('/api/research/stream/:id', authenticateToken as any, ResearchController.streamSession as any);
app.get('/api/research/history', authenticateToken as any, ResearchController.getHistory as any);
app.get('/api/research/session/:id', authenticateToken as any, ResearchController.getSessionDetails as any);
app.get('/api/research/session/:id/pdf', authenticateToken as any, ResearchController.exportPDF as any);

// Saved Reports Management Routes
app.get('/api/research/saved', authenticateToken as any, ResearchController.getSavedReports as any);
app.post('/api/research/saved', authenticateToken as any, ResearchController.saveReport as any);
app.delete('/api/research/saved/:id', authenticateToken as any, ResearchController.deleteSavedReport as any);

// Start server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`  RESEARCHGPT BACKEND RUNNING ON PORT ${PORT}      `);
  console.log(`===================================================`);
});
