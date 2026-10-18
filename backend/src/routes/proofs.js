import { Router } from 'express';
import { addProof, getProofsByMilestone } from '../db/proofs.js';
import { logAudit } from '../db/auditLogs.js';
import { validateBody } from '../middleware/validateBody.js';

const router = Router();

/** POST /proofs  – NGO submits IPFS proof for a milestone */
router.post(
  '/',
  validateBody(['milestone_id', 'proof_kind', 'file_url']),
  async (req, res, next) => {
    try {
      const { milestone_id, uploaded_by, proof_kind, ipfs_cid, file_url, gps_latitude, gps_longitude, beneficiary_count, notes, metadata } = req.body;
      const proof = await addProof({ milestone_id, uploaded_by, proof_kind, ipfs_cid, file_url, gps_latitude, gps_longitude, beneficiary_count, notes, metadata });
      await logAudit({ action: 'PROOF_UPLOADED', actorId: uploaded_by, targetTable: 'proofs', targetId: proof.id, details: { milestone_id, proof_kind } });
      res.status(201).json({ success: true, data: proof });
    } catch (err) { next(err); }
  }
);

/** GET /proofs/milestone/:milestoneId */
router.get('/milestone/:milestoneId', async (req, res, next) => {
  try {
    const data = await getProofsByMilestone(req.params.milestoneId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
