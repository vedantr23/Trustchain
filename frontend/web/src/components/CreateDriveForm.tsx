import React, { useState } from 'react';
import { supabase } from '../supabase';
import { t, td } from '../i18n';
import type { LangCode } from '../i18n';

interface MilestoneItem {
  title: string;
  amount: string;
  description: string;
  targetDate: string;
  gps: boolean;
  photo: boolean;
  video: boolean;
  bill: boolean;
}

interface Props {
  onSuccess: () => void;
  lang?: LangCode;
}

export const CreateDriveForm: React.FC<Props> = ({ onSuccess, lang = 'en' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [step, setStep]     = useState<1 | 2>(1);

  // Step 1
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [problem, setProblem]         = useState('');
  const [category, setCategory]       = useState('Disaster Relief');
  const [location, setLocation]       = useState('');
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');
  const [beneficiaries, setBeneficiaries] = useState('');
  const [urgency, setUrgency]         = useState('High');
  const [payoutUpiId, setPayoutUpiId] = useState('');

  // Step 2
  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    { title: '', amount: '', description: '', targetDate: '', gps: false, photo: true, video: false, bill: true },
  ]);

  const addMilestone = () =>
    setMilestones((prev: MilestoneItem[]) => [...prev, { title: '', amount: '', description: '', targetDate: '', gps: false, photo: true, video: false, bill: true }]);

  const updateM = (i: number, field: keyof MilestoneItem, val: any) =>
    setMilestones((prev: MilestoneItem[]) => prev.map((m: MilestoneItem, idx: number) => idx === i ? { ...m, [field]: val } : m));

  const removeM = (i: number) =>
    setMilestones((prev: MilestoneItem[]) => prev.filter((_: MilestoneItem, idx: number) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const totalTarget = milestones.reduce((s: number, m: MilestoneItem) => s + (parseFloat(m.amount) || 0), 0);
    try {
      // NGO Limit check
      const limit = 1000000;
      if (totalTarget > limit) {
        throw new Error(`Your fundraising limit is ₹${limit.toLocaleString('en-IN')}. Please contact Admin to increase it.`);
      }

      const emptyToNull = (v: string) => v.trim() === '' ? null : v.trim();

      // 1. Create Drive on Supabase
      const payload: any = {
        title,
        description: emptyToNull(description),
        problem_statement: emptyToNull(problem),
        category,
        location: emptyToNull(location),
        target_amount: totalTarget || 100000,
        raised_amount: 0,
        urgency_level: urgency,
        beneficiaries_count: parseInt(beneficiaries) || null,
        payout_upi_id: payoutUpiId || null,
        ngo_id: '00000000-0000-0000-0000-000000000000',
      };
      if (startDate) payload.start_date = startDate;
      if (endDate)   payload.end_date   = endDate;

      const { data: driveData, error: dErr } = await supabase.from('drives').insert([payload]).select().single();
      if (dErr) {
        console.error("Supabase drive insert error:", dErr);
        throw new Error(`Failed to create drive: ${dErr.message}`);
      }

      const insertedDriveId = driveData.id;

      // 2. Audit Log (non-blocking)
      try {
        await supabase
          .from('audit_logs')
          .insert({
            action: 'DRIVE_CREATED',
            target_table: 'drives',
            details: { title, target_amount: totalTarget, category },
          });
      } catch (aErr) {
        console.warn("Audit log notice:", aErr);
      }

      // 3. Create Milestones on Supabase with accurate column names
      if (milestones.length) {
        const mp = milestones.map((m: MilestoneItem) => ({
          drive_id: insertedDriveId,
          title: m.title,
          description: emptyToNull(m.description),
          target_amount: parseFloat(m.amount) || 0,
          target_date: emptyToNull(m.targetDate),
          gps_required: Boolean(m.gps),
          photo_required: Boolean(m.photo),
          video_required: Boolean(m.video),
          invoice_required: Boolean(m.bill),
          status: 'pending',
        }));

        const { error: mErr } = await supabase.from('milestones').insert(mp);
        if (mErr) {
          console.error("Supabase milestone insert error:", mErr);
          throw new Error(`Drive created, but milestone failed to save: ${mErr.message}`);
        }
      }

      onSuccess();
    } catch (err: any) {
      console.error("Create drive failed:", err);
      setError(err.message || 'Failed to create drive');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Step indicator */}
      <div className="row mb-24" style={{ gap: 0 }}>
        {[1, 2].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 12, fontWeight: 700,
              background: step >= s ? 'var(--primary)' : 'var(--border)',
              color: step >= s ? '#fff' : 'var(--text-3)',
            }}>{s}</div>
            <span style={{ marginLeft: 8, fontSize: 13, fontWeight: step === s ? 600 : 400, color: step === s ? 'var(--text)' : 'var(--text-3)' }}>
              {s === 1 ? t(lang, 'step1Details') : t(lang, 'step2Milestones')}
            </span>
            {s < 2 && <div style={{ width: 40, height: 2, background: step > s ? 'var(--primary)' : 'var(--border)', margin: '0 12px' }} />}
          </div>
        ))}
      </div>

      {error && <div className="card mb-16" style={{ background: 'var(--red-lt)', border: '1px solid #fecaca', color: 'var(--red)' }}>{error}</div>}

      {step === 1 && (
        <div className="slide-up">
          <div className="form-grid mb-16">
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>{t(lang, 'driveTitle')} *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Food Relief for Flood Victims" required />
            </div>
            <div className="form-group">
              <label>{t(lang, 'category')}</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="Disaster Relief">{td(lang, 'Disaster Relief')}</option>
                <option value="Education">{td(lang, 'Education')}</option>
                <option value="Healthcare">{td(lang, 'Healthcare')}</option>
                <option value="Clean Water">{td(lang, 'Clean Water')}</option>
                <option value="Animal Welfare">{td(lang, 'Animal Welfare')}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t(lang, 'urgencyLevel')}</label>
              <select value={urgency} onChange={e => setUrgency(e.target.value)}>
                <option value="Critical">{td(lang, 'Critical')}</option>
                <option value="High">{td(lang, 'High')}</option>
                <option value="Medium">{td(lang, 'Medium')}</option>
                <option value="Active">{td(lang, 'Active')}</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>{t(lang, 'description')}</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this drive about?" rows={2} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>{t(lang, 'problemStatement')}</label>
              <textarea value={problem} onChange={e => setProblem(e.target.value)} placeholder="Describe the crisis in detail..." rows={3} />
            </div>
            <div className="form-group">
              <label>{t(lang, 'location')}</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Nagpur, Maharashtra" />
            </div>
            <div className="form-group">
              <label>{t(lang, 'estimatedBeneficiaries')}</label>
              <input type="number" value={beneficiaries} onChange={e => setBeneficiaries(e.target.value)} placeholder="500" />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>{t(lang, 'ngoPayoutUpi')} *</label>
              <input
                value={payoutUpiId}
                onChange={e => setPayoutUpiId(e.target.value.trim())}
                placeholder="e.g. relief.foundation@okaxis or ngochildcare@okhdfcbank"
                required
              />
              <small style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 4, display: 'block' }}>
                🛡️ <strong>Milestone Escrow:</strong> Donors pay to Admin Escrow. Funds remain securely locked per milestone and are released automatically to this UPI ID once your proof is approved.
              </small>
            </div>
            <div className="form-group">
              <label>{t(lang, 'startDate')}</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>{t(lang, 'endDate')}</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          {!payoutUpiId && (
            <div style={{ color: "var(--red, #ef4444)", fontSize: 13, marginBottom: 12, fontWeight: 500 }}>
              * NGO receiving UPI ID is required for receiving released milestone funds.
            </div>
          )}
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => setStep(2)}
            disabled={!title || !payoutUpiId}
          >
            {t(lang, 'nextMilestones')} →
          </button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="slide-up">
          <div className="section-head">
            <h3>{t(lang, 'milestones')}</h3>
            <button type="button" className="btn btn-outline btn-sm" onClick={addMilestone}>{t(lang, 'addMilestone')}</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            {milestones.map((m: MilestoneItem, i: number) => (
              <div key={i} className="card card-sm" style={{ background: 'var(--bg)' }}>
                <div className="row-sb mb-8">
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)' }}>{t(lang, 'milestones').toUpperCase()} {i + 1}</span>
                  {milestones.length > 1 && <button type="button" className="btn-ghost btn-sm" style={{ fontSize: 18, lineHeight: 1 }} onClick={() => removeM(i)}>×</button>}
                </div>
                <div className="form-grid" style={{ gap: 10, marginBottom: 10 }}>
                  <div className="form-group">
                    <label>{t(lang, 'milestoneTitle')} *</label>
                    <input value={m.title} onChange={e => updateM(i, 'title', e.target.value)} placeholder="Buy food packets" required />
                  </div>
                  <div className="form-group">
                    <label>{t(lang, 'timestamp')} *</label>
                    <input type="date" value={m.targetDate} onChange={e => updateM(i, 'targetDate', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>{t(lang, 'targetAmount')} *</label>
                    <input type="number" value={m.amount} onChange={e => updateM(i, 'amount', e.target.value)} placeholder="20000" required />
                  </div>
                  <div className="form-group">
                    <label>{t(lang, 'description')}</label>
                    <input value={m.description} onChange={e => updateM(i, 'description', e.target.value)} placeholder="Brief summary..." />
                  </div>
                </div>
                <div className="row" style={{ flexWrap: 'wrap', gap: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>{t(lang, 'requiredProofs')}:</span>
                  {(['gps', 'photo', 'video', 'bill'] as const).map(f => (
                    <label key={f} className="check-row">
                      <input type="checkbox" checked={m[f]} onChange={e => updateM(i, f, e.target.checked)} />
                      {f.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="row">
            <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>{t(lang, 'backBtn')}</button>
            <button type="submit" className="btn btn-green btn-lg" disabled={loading}>
              {loading ? `${t(lang, 'live')}...` : t(lang, 'publishDrive')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
