import { Router } from 'express';
import { getAuditLogs } from '../db/auditLogs.js';

const router = Router();

/** GET /audit  – full audit trail for admin */
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const data = await getAuditLogs({ limit });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
