import { Router } from 'express';
import { getProfileById, getAllNGOs, updateNgoLimit, updateNgoStatus } from '../db/profiles.js';
import { logAudit } from '../db/auditLogs.js';
import { validateBody } from '../middleware/validateBody.js';

const router = Router();

/** GET /profiles/ngos  – list all NGOs (for Admin panel) */
router.get('/ngos', async (req, res, next) => {
  try {
    const data = await getAllNGOs();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

/** GET /profiles/:id */
router.get('/:id', async (req, res, next) => {
  try {
    const data = await getProfileById(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

/** PATCH /profiles/:id/limit  – admin updates NGO max_drive_limit */
router.patch(
  '/:id/limit',
  validateBody(['max_drive_limit']),
  async (req, res, next) => {
    try {
      const { max_drive_limit, admin_id } = req.body;
      const actorId = req.user?.id || admin_id || 'admin';
      const profile = await updateNgoLimit(req.params.id, max_drive_limit);
      await logAudit({
        action: 'NGO_LIMIT_UPDATED',
        actorId,
        targetTable: 'profiles',
        targetId: profile.id,
        details: { max_drive_limit },
      });
      res.json({ success: true, data: profile });
    } catch (err) { next(err); }
  }
);

/** PATCH /profiles/:id/status  – admin approves or rejects NGO */
router.patch(
  '/:id/status',
  validateBody(['ngo_status']),
  async (req, res, next) => {
    try {
      const { ngo_status, admin_id } = req.body;
      if (!['pending', 'approved', 'rejected'].includes(ngo_status)) {
        return res.status(400).json({ success: false, error: 'Invalid ngo_status value' });
      }
      const actorId = req.user?.id || admin_id || 'admin';
      const profile = await updateNgoStatus(req.params.id, ngo_status);
      await logAudit({
        action: `NGO_${ngo_status.toUpperCase()}`,
        actorId,
        targetTable: 'profiles',
        targetId: profile.id,
        details: { status: ngo_status },
      });
      res.json({ success: true, data: profile });
    } catch (err) { next(err); }
  }
);

export default router;

