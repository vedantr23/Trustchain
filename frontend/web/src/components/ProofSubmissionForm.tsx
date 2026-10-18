import React, { useState } from 'react';
import { supabase } from '../supabase';
import { BlockchainService } from '../utils/BlockchainService';
import { PinataService } from '../utils/pinataService';
import { RealtimeService } from '../utils/realtimeService';
import { t, td } from '../i18n';
import type { LangCode } from '../i18n';

interface Props {
  milestones: any[];
  onSuccess: () => void;
  lang?: LangCode;
}

export const ProofSubmissionForm: React.FC<Props> = ({ milestones, onSuccess, lang = 'en' }) => {
  const [milestoneId, setMilestoneId] = useState('');
  const [summary, setSummary]         = useState('');
  const [benefCount, setBenefCount]   = useState('');
  const [gpsLocation, setGpsLocation] = useState('');
  const [photoFile, setPhotoFile]     = useState<File | null>(null);
  const [billFile, setBillFile]       = useState<File | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [uploadedIpfsHash, setUploadedIpfsHash] = useState<string | null>(null);

  const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `proof-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneId) { setError('Please select a milestone.'); return; }
    if (!photoFile && !billFile) { setError('Upload at least one photo or bill.'); return; }
    setLoading(true);
    setError(null);
    try {
      const inserts: any[] = [];
      let primaryIpfsHash = '';

      if (photoFile) {
        const pinResult = await PinataService.uploadFile(photoFile, `proof-photo-${photoFile.name}`);
        primaryIpfsHash = pinResult.ipfsHash;
        const localDataUrl = await fileToDataUrl(photoFile);
        const gatewayUrl = pinResult.pinataUrl;
        const proofId = newId();

        RealtimeService.addProof({
          id: proofId,
          milestone_id: milestoneId,
          proof_type: 'image',
          proof_url: gatewayUrl,
          ipfsHash: pinResult.ipfsHash,
          fileName: photoFile.name,
          gps_location: gpsLocation,
          created_at: new Date().toISOString(),
          localPreview: localDataUrl,
        });

        inserts.push({
          id: proofId,
          milestone_id: milestoneId,
          proof_type: 'image',
          proof_url: gatewayUrl,
          status: 'pending',
          gps_location: gpsLocation || null,
          metadata: { ipfsHash: pinResult.ipfsHash, fileName: photoFile.name }
        });
      }

      if (billFile) {
        const pinResult = await PinataService.uploadFile(billFile, `proof-invoice-${billFile.name}`);
        if (!primaryIpfsHash) primaryIpfsHash = pinResult.ipfsHash;
        const localDataUrl = await fileToDataUrl(billFile);
        const gatewayUrl = pinResult.pinataUrl;
        const proofId = newId();

        RealtimeService.addProof({
          id: proofId,
          milestone_id: milestoneId,
          proof_type: billFile.type.includes('pdf') ? 'pdf' : 'image',
          proof_url: gatewayUrl,
          ipfsHash: pinResult.ipfsHash,
          fileName: billFile.name,
          gps_location: gpsLocation,
          created_at: new Date().toISOString(),
          localPreview: localDataUrl,
        });

        inserts.push({
          id: proofId,
          milestone_id: milestoneId,
          proof_type: billFile.type.includes('pdf') ? 'pdf' : 'image',
          proof_url: gatewayUrl,
          status: 'pending',
          gps_location: gpsLocation || null,
          metadata: { ipfsHash: pinResult.ipfsHash, fileName: billFile.name }
        });
      }

      if (inserts.length > 0) {
        const { data: pData, error: pErr } = await supabase.from('proofs').insert(inserts).select();
        if (pErr) {
          console.error('Supabase proof insert error:', pErr);
        }
        console.log('Proof saved to Supabase:', pData);
      }

      try {
        const ms = milestones.find(m => m.id === milestoneId);
        if (ms) {
          const { data: drive } = await supabase.from('drives').select('blockchain_id').eq('id', ms.drive_id).single();
          if (drive && drive.blockchain_id) {
            await BlockchainService.submitMilestone(drive.blockchain_id, ms.title, primaryIpfsHash || 'N/A');
          }
        }
      } catch (bcErr) {
        console.warn('Blockchain milestone submission fallback:', bcErr);
      }

      setUploadedIpfsHash(primaryIpfsHash);
      setTimeout(() => onSuccess(), 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to upload proof');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="col gap-16 slide-up">
      {error && <div className="card" style={{ background: 'var(--red-lt)', color: 'var(--red)', border: '1px solid #fecaca' }}>{error}</div>}

      {uploadedIpfsHash && (
        <div className="card" style={{ background: 'var(--green-lt)', color: 'var(--green)', border: '1px solid #bbf7d0' }}>
          ✅ Proof Pinned to IPFS. CID: <code>{uploadedIpfsHash}</code>
        </div>
      )}

      <div className="form-group">
        <label>{t(lang, 'selectMilestone')} *</label>
        <select value={milestoneId} onChange={e => setMilestoneId(e.target.value)} required>
          <option value="">-- {t(lang, 'selectMilestone')} --</option>
          {milestones.map(m => (
            <option key={m.id} value={m.id}>
              {td(lang, m.driveTitle || m.title)} → {td(lang, m.title)}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>📍 {t(lang, 'gpsLocation')}</label>
        <input value={gpsLocation} onChange={e => setGpsLocation(e.target.value)} placeholder="e.g. 18.2323 N, 72.3434 E" />
      </div>

      <div className="form-group">
        <label>{t(lang, 'fieldWorkReport')}</label>
        <textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Brief summary of work done..." rows={3} />
      </div>

      <div className="form-group">
        <label>{t(lang, 'actualBeneficiaries')}</label>
        <input type="number" value={benefCount} onChange={e => setBenefCount(e.target.value)} placeholder="e.g. 250" />
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label>📷 {t(lang, 'uploadPhotos')}</label>
          <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} />
          {photoFile && <span className="text-sm text-muted">{photoFile.name}</span>}
        </div>
        <div className="form-group">
          <label>📄 {t(lang, 'uploadBills')}</label>
          <input type="file" accept="image/*,application/pdf" onChange={e => setBillFile(e.target.files?.[0] || null)} />
          {billFile && <span className="text-sm text-muted">{billFile.name}</span>}
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
        {loading ? `${t(lang, 'live')}...` : `${t(lang, 'submitProofAdmin')} →`}
      </button>
    </form>
  );
};
