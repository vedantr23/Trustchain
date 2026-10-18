/**
 * Trustchain – Backend API
 * Entry point: registers all route modules and starts the Express server.
 */
import express   from 'express';
import cors      from 'cors';
import dotenv    from 'dotenv';

import drivesRouter     from './src/routes/drives.js';
import milestonesRouter from './src/routes/milestones.js';
import donationsRouter  from './src/routes/donations.js';
import proofsRouter     from './src/routes/proofs.js';
import profilesRouter   from './src/routes/profiles.js';
import auditRouter      from './src/routes/audit.js';
import { errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());



// ── Routes ───────────────────────────────────────────────────
app.use('/drives',     drivesRouter);
app.use('/milestones', milestonesRouter);
app.use('/donations',  donationsRouter);
app.use('/proofs',     proofsRouter);
app.use('/profiles',   profilesRouter);
app.use('/audit',      auditRouter);

// Health check
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'Trustchain API', timestamp: new Date().toISOString() })
);

// ── Error handler (must be last) ─────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Trustchain API running → http://localhost:${PORT}`);
});
