import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDatabase } from './db/index.js';
import { seedDatabase } from './db/seed.js';
import healthRoutes from './routes/health.js';
import exerciseRoutes from './routes/exercises.js';
import templateRoutes from './routes/templates.js';
import sessionRoutes from './routes/sessions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize DB and Seed default data on startup
initDatabase();
seedDatabase();

// API Routes
app.use('/api', healthRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/sessions', sessionRoutes);

// Dynamically resolve client dist folder (production build)
let clientDistPath = path.resolve(process.cwd(), 'dist');
if (!fs.existsSync(clientDistPath)) {
  clientDistPath = path.resolve(__dirname, '../dist');
}
if (!fs.existsSync(clientDistPath)) {
  clientDistPath = path.resolve(__dirname, '../../dist');
}

console.log(`Serving static client files from: ${clientDistPath}`);
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Mjolnir Client Build (index.html) not found');
  }
});

app.listen(PORT, () => {
  console.log(`⚡ Mjolnir Gym Tracker running on port ${PORT}`);
});
