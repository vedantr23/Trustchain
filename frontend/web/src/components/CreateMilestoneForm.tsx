import React, { useState } from 'react';
import { supabase } from '../supabase';

interface CreateMilestoneFormProps {
  driveId: string;
  onSuccess: () => void;
}

export const CreateMilestoneForm: React.FC<CreateMilestoneFormProps> = ({ driveId, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [payoutUpiId, setPayoutUpiId] = useState('');
  
  // Proof Requirements
  const [reqPicture, setReqPicture] = useState(false);
  const [reqVideo, setReqVideo] = useState(false);
  const [reqGps, setReqGps] = useState(false);
  const [reqBill, setReqBill] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const targetNum = parseFloat(targetAmount);
    if (!title || isNaN(targetNum) || targetNum <= 0) {
      setError('Please provide a valid title and required amount.');
      setLoading(false);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      let createdMilestone: any = null;

      // 1. Try Backend API (Service-Role backed, auto audit log)
      try {
        const res = await fetch(`${apiUrl}/milestones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            drive_id: driveId,
            title,
            target_amount: targetNum,
            gps_required: reqGps,
            photo_required: reqPicture,
            video_required: reqVideo,
            invoice_required: reqBill,
            requires_gps: reqGps,
            requires_photo: reqPicture,
            requires_video: reqVideo,
            requires_invoice: reqBill,
          }),
        });
        const resData = await res.json();
        if (res.ok && resData.success && resData.data) {
          createdMilestone = resData.data;
        }
      } catch (backendErr) {
        console.warn('Backend /milestones API unavailable, falling back to Supabase:', backendErr);
      }

      // 2. Fallback to direct Supabase if backend did not succeed
      if (!createdMilestone) {
        const msPayload: any = {
          drive_id: driveId,
          title,
          target_amount: targetNum,
          status: 'pending',
          gps_required: reqGps,
          photo_required: reqPicture,
          video_required: reqVideo,
          invoice_required: reqBill,
        };

        const { data: milestoneData, error: milestoneError } = await supabase
          .from('milestones')
          .insert(msPayload)
          .select()
          .single();

        if (milestoneError) {
          console.error('Direct Supabase insert failed:', milestoneError);
          throw new Error(`Failed to create milestone: ${milestoneError.message}`);
        } else {
          createdMilestone = milestoneData;
        }
      }

      // 3. Fallback to Local ID if offline
      if (!createdMilestone) {
        createdMilestone = {
          id: crypto.randomUUID ? crypto.randomUUID() : `ms-${Date.now()}`,
          drive_id: driveId,
          title,
          target_amount: targetNum,
          status: 'pending',
          created_at: new Date().toISOString(),
        };
      }

      // Update local storage if present
      const localDrivesRaw = localStorage.getItem('trustchain_local_drives');
      if (localDrivesRaw) {
        try {
          const localDrives = JSON.parse(localDrivesRaw);
          const updated = localDrives.map((d: any) => {
            if (d.id === driveId) {
              const ms = d.milestones || [];
              return { ...d, milestones: [...ms, createdMilestone] };
            }
            return d;
          });
          localStorage.setItem('trustchain_local_drives', JSON.stringify(updated));
        } catch (e) {
          /* ignore */
        }
      }

      setTitle('');
      setTargetAmount('');
      setPayoutUpiId('');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create milestone.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-card" style={{ marginTop: '20px' }}>
      <h3 className="section-title">Formulate Milestone</h3>
      <form onSubmit={handleSubmit} className="modern-form">
        {error && <div className="error-banner">{error}</div>}
        
        <div className="input-group">
          <label htmlFor="m_title">Milestone Objective</label>
          <input
            id="m_title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Purchase food packets"
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label htmlFor="m_targetAmount">Fund Required ($)</label>
          <input
            id="m_targetAmount"
            type="number"
            step="0.01"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="5000"
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label htmlFor="m_payoutUpi">Milestone Receiving UPI ID (Optional / Defaults to Drive UPI)</label>
          <input
            id="m_payoutUpi"
            type="text"
            value={payoutUpiId}
            onChange={(e) => setPayoutUpiId(e.target.value.trim())}
            placeholder="e.g. ngo.project@okhdfcbank"
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label>Required Proofs for Admin Approval</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={reqPicture} onChange={() => setReqPicture(!reqPicture)} />
              Photos
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={reqVideo} onChange={() => setReqVideo(!reqVideo)} />
              Videos
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={reqGps} onChange={() => setReqGps(!reqGps)} />
              GPS / Location
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={reqBill} onChange={() => setReqBill(!reqBill)} />
              Bills / Invoice
            </label>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Submitting...' : 'Add Milestone'}
        </button>
      </form>
    </div>
  );
};
