import { Router } from 'express';
import { getAllDrives, getDriveById, createDrive, updateDrive } from '../db/drives.js';
import { logAudit } from '../db/auditLogs.js';
import { validateBody } from '../middleware/validateBody.js';

const router = Router();

/** GET /drives  – list all (optionally filter by ?status=active) */
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const drives = await getAllDrives({ status });
    res.json({ success: true, data: drives });
  } catch (err) { next(err); }
});

/** GET /drives/:id */
router.get('/:id', async (req, res, next) => {
  try {
    const drive = await getDriveById(req.params.id);
    res.json({ success: true, data: drive });
  } catch (err) { next(err); }
});

/** POST /drives  – create a new drive */
router.post(
  '/',
  validateBody(['title', 'target_amount', 'category']),
  async (req, res, next) => {
    try {
      const { title, description, problem_statement, category, location,
              target_amount, image_url, start_date, end_date,
              beneficiaries_count, urgency_level, ngo_id,
              blockchain_id, blockchain_tx_hash, payout_upi_id } = req.body;

      const drive = await createDrive({
        ngo_id: ngo_id || '00000000-0000-0000-0000-000000000000',
        title, description, problem_statement, category, location,
        target_amount, image_url, start_date, end_date,
        beneficiaries_count, urgency_level,
        blockchain_id, blockchain_tx_hash,
        payout_upi_id: payout_upi_id || null,
      });

      await logAudit({ action: 'DRIVE_CREATED', actorId: ngo_id, targetTable: 'drives', targetId: drive.id, details: { title } });
      res.status(201).json({ success: true, data: drive });
    } catch (err) { next(err); }
  }
);

/** PATCH /drives/:id  – update status or fields */
router.patch('/:id', async (req, res, next) => {
  try {
    const drive = await updateDrive(req.params.id, req.body);
    await logAudit({ action: 'DRIVE_UPDATED', targetTable: 'drives', targetId: drive.id, details: req.body });
    res.json({ success: true, data: drive });
  } catch (err) { next(err); }
});

export default router;
