import express from 'express';
import cors from 'cors';
import { initDatabase } from './db/index.js';
import { seedDatabase } from './db/seed.js';
import healthRoutes from './routes/health.js';
import exerciseRoutes from './routes/exercises.js';
import templateRoutes from './routes/templates.js';
import sessionRoutes from './routes/sessions.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize DB and Seed default data
initDatabase();
seedDatabase();

// API Routes
app.use('/api', healthRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/sessions', sessionRoutes);

app.listen(PORT, () => {
  console.log(`⚡ Mjolnir Gym Tracker API Server running on http://localhost:${PORT}`);
});
