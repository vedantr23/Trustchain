import React, { useState } from 'react';
import { supabase } from '../supabase';

interface CreateMilestoneFormProps {
  driveId: string;
  onSuccess: () => void;
}

export const CreateMilestoneForm: React.FC<CreateMilestoneFormProps> = ({ driveId, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  
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
      // Create the Milestone
      const { data: milestoneData, error: milestoneError } = await supabase
        .from('milestones')
        .insert({
          drive_id: driveId,
          title,
          target_amount: targetNum,
          status: 'pending'
        })
        .select()
        .single();

      if (milestoneError) throw milestoneError;
      
      // We log the proof requirements requested by inserting dummy 'pending' proof slots 
      // or handling it structurally in a robust app. For now as V1, we will just create 
      // the milestone logic and the required schema entries can be added here.
      
      // For instance, if reqPicture is true, we could insert a proof slot for 'image' etc.
      const proofEntries = [];
      if (reqPicture) proofEntries.push({ milestone_id: milestoneData.id, proof_type: 'image', proof_url: 'pending', status: 'pending' });
      if (reqVideo) proofEntries.push({ milestone_id: milestoneData.id, proof_type: 'video', proof_url: 'pending', status: 'pending' });
      if (reqGps) proofEntries.push({ milestone_id: milestoneData.id, proof_type: 'gps', proof_url: 'pending', status: 'pending' });
      if (reqBill) proofEntries.push({ milestone_id: milestoneData.id, proof_type: 'pdf', proof_url: 'pending', status: 'pending' });

      if (proofEntries.length > 0) {
         const { error: proofError } = await supabase.from('proofs').insert(proofEntries);
         if (proofError) console.error("Could not append proof constraints", proofError);
      }
      
      setTitle('');
      setTargetAmount('');
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
