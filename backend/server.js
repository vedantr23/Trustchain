import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Use service role for backend admin tasks

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Trustchain backend is running' });
});

app.post('/approve-milestone', async (req, res) => {
  try {
    const { milestoneId, adminId, status } = req.body;

    if (!milestoneId || !adminId || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Bypass check for prototype placeholder ID, otherwise verify in DB
    if (adminId !== 'admin-placeholder-id') {
      const { data: adminData, error: adminError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', adminId)
        .single();

      if (adminError || !adminData || adminData.role !== 'Admin') {
        return res.status(403).json({ error: 'Unauthorized: Admins only', details: adminError });
      }
    }

    // Process approval
    const { data: milestoneData, error: mErr } = await supabase
      .from('milestones')
      .update({ status })
      .eq('id', milestoneId)
      .select('drive_id, target_amount')
      .single();

    if (mErr) throw mErr;

    // Log the approval action for Audit History
    await supabase.from('audit_logs').insert({
      action: `MILESTONE_${status.toUpperCase()}`,
      actor_id: adminId === 'admin-placeholder-id' ? null : adminId,
      target_table: 'milestones',
      target_id: milestoneId,
      details: {
        amount: milestoneData.target_amount,
        notes: `Funds of ₹${milestoneData.target_amount} released/processed.`
      }
    });

    return res.status(200).json({ success: true, message: `Milestone ${status}`, data: milestoneData });

  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
