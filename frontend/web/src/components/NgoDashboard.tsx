import React, { useState } from 'react';
import { useDrives } from '../hooks/useDrives';
import { supabase } from '../supabase';
import { CreateDriveForm } from './CreateDriveForm';
import { ProofSubmissionForm } from './ProofSubmissionForm';
import { t, LANGUAGES } from '../i18n';
import type { LangCode } from '../i18n';

interface Props { onBack: () => void; lang: LangCode; dark: boolean; setDark: (v: boolean) => void; setLang: (v: LangCode) => void; }

export const NgoDashboard: React.FC<Props> = ({ onBack, lang, dark, setDark, setLang }) => {
  const { drives, loading, refetch } = useDrives();
  const [tab, setTab] = useState<'home' | 'create' | 'proof'>('home');
  const [selectedDrive, setSelectedDrive] = useState<any | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  React.useEffect(() => {
    const ch = supabase.channel('ngo-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones' }, refetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drives' }, refetch)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refetch]);

  // Metrics
  const totalRaised    = drives.reduce((s, d) => s + (d.raised_amount || 0), 0);
  const totalCredited  = drives.reduce((acc, d) => acc + (d.milestones || []).filter(m => m.status === 'approved').reduce((s, m) => s + (m.target_amount || 0), 0), 0);
  const pendingApprovals = drives.reduce((s, d) => s + (d.milestones || []).filter(m => m.status === 'pending').length, 0);
  const allMilestones  = drives.flatMap(d => (d.milestones || []).map(m => ({ ...m, driveTitle: d.title })));
  const pendingMs      = allMilestones.filter(m => m.status === 'pending');

  return (
    <div>
      <nav className="topnav">
        <div className="topnav-logo" onClick={onBack}>Trust<span>Chain</span></div>
        <div className="tabs">
          <button className={`tab ${tab === 'home'   ? 'active' : ''}`} onClick={() => { setTab('home'); setSelectedDrive(null); }}>{t(lang, 'dashboard')}</button>
          <button className={`tab ${tab === 'create' ? 'active' : ''}`} onClick={() => setTab('create')}>{t(lang, 'newDrive')}</button>
          <button className={`tab ${tab === 'proof'  ? 'active' : ''}`} onClick={() => setTab('proof')}>{t(lang, 'submitProof')}</button>
        </div>
        <div className="row gap-8">
          <select className="lang-select" value={lang} onChange={e => setLang(e.target.value as LangCode)} title={t(lang, 'language')}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.native}</option>)}
          </select>
          <button className="theme-toggle" onClick={() => setDark(!dark)} title={dark ? 'Light' : 'Dark'}>{dark ? '☀️' : '🌙'}</button>
          <span className="live-dot" />
          <span className="text-sm text-muted">NGO — {t(lang, 'live')}</span>
        </div>
      </nav>

      <div className="page">
        {/* Stat Cards */}
        {tab === 'home' && !selectedDrive && (
          <>
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-label">{t(lang, 'totalRaised')}</div>
                <div className="stat-value blue">₹{totalRaised.toLocaleString('en-IN')}</div>
              </div>
              <div className="stat-card" style={{ borderLeft: '3px solid var(--green)' }}>
                <div className="stat-label" style={{ color: 'var(--green)' }}>{t(lang, 'fundsCredited')}</div>
                <div className="stat-value green">₹{totalCredited.toLocaleString('en-IN')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">{t(lang, 'pendingApprovals')}</div>
                <div className="stat-value">{pendingApprovals}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">{t(lang, 'activeDrives')}</div>
                <div className="stat-value">{drives.length}</div>
              </div>
            </div>

            <div className="section-head">
              <h3>{t(lang, 'myDonationDrives')}</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setTab('create')}>+ {t(lang, 'newDrive')}</button>
            </div>

            {loading && <div className="empty"><div className="pulse">{t(lang, 'live')}...</div></div>}

            <div className="drive-card-grid">
              {drives.map(d => {
                const pct = d.target_amount > 0 ? Math.min(100, Math.round((d.raised_amount / d.target_amount) * 100)) : 0;
                const approved = (d.milestones || []).filter(m => m.status === 'approved').length;
                const total    = (d.milestones || []).length;
                return (
                  <div key={d.id} className="drive-card card-hover" onClick={() => setSelectedDrive(d)}>
                    <div className="row-sb mb-8">
                      <span className="badge badge-blue">{d.category || 'General'}</span>
                      <span className={`badge ${d.urgency_level === 'Critical' ? 'badge-red' : d.urgency_level === 'High' ? 'badge-orange' : 'badge-gray'}`}>
                        {d.urgency_level}
                      </span>
                    </div>
                    <div className="drive-title">{d.title}</div>
                    <div className="drive-meta">📍 {d.location || 'India'} &nbsp;·&nbsp; 👥 {d.beneficiaries_count || 0} {t(lang, 'beneficiaries')}</div>
                    <div className="prog-wrap">
                      <div className="prog-bar"><div className="prog-fill" style={{ width: `${pct}%` }} /></div>
                      <div className="prog-labels">
                        <span className="text-bold">₹{d.raised_amount.toLocaleString('en-IN')}</span>
                        <span className="text-muted">₹{d.target_amount.toLocaleString('en-IN')} {t(lang, 'goal')}</span>
                      </div>
                    </div>
                    <div className="row mt-8">
                      <span className="badge badge-green">{approved}/{total} {t(lang, 'milestones')} {t(lang, 'verified')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Drive Detail */}
        {tab === 'home' && selectedDrive && (
          <div className="slide-up">
            <button className="back-btn" onClick={() => setSelectedDrive(null)}>← {t(lang, 'dashboard')}</button>
            <div className="row-sb mb-16">
              <div>
                <h2 style={{ fontSize: 24 }}>{selectedDrive.title}</h2>
                <div className="drive-meta">📍 {selectedDrive.location} &nbsp;·&nbsp; {selectedDrive.category}</div>
              </div>
              <span className={`badge ${selectedDrive.urgency_level === 'Critical' ? 'badge-red' : 'badge-orange'}`}>
                {selectedDrive.urgency_level}
              </span>
            </div>

            {selectedDrive.problem_statement && (
              <div className="card mb-24" style={{ background: 'var(--primary-lt)', border: '1px solid #bfdbfe' }}>
                <div className="text-sm text-bold mb-4" style={{ color: 'var(--primary)' }}>{t(lang, 'problemStatement')}</div>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{selectedDrive.problem_statement}</p>
              </div>
            )}

            <div className="grid-3 mb-24">
              <div className="stat-card"><div className="stat-label">{t(lang, 'totalRaised')}</div><div className="stat-value blue" style={{ fontSize: 22 }}>₹{selectedDrive.raised_amount.toLocaleString('en-IN')}</div></div>
              <div className="stat-card"><div className="stat-label">{t(lang, 'goal')}</div><div className="stat-value" style={{ fontSize: 22 }}>₹{selectedDrive.target_amount.toLocaleString('en-IN')}</div></div>
              <div className="stat-card"><div className="stat-label">{t(lang, 'beneficiaries')}</div><div className="stat-value" style={{ fontSize: 22 }}>{selectedDrive.beneficiaries_count}</div></div>
            </div>

            <div className="card">
              <div className="section-head"><h3>{t(lang, 'milestones')}</h3></div>
              {(selectedDrive.milestones || []).map((m: any, i: number) => (
                <div key={m.id} className="milestone-row">
                  <div className="row">
                    <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: m.status === 'approved' ? 'var(--green-lt)' : 'var(--border-lt)', color: m.status === 'approved' ? 'var(--green)' : 'var(--text-3)' }}>
                      {m.status === 'approved' ? '✓' : i + 1}
                    </div>
                    <div>
                      <div className="text-bold">{m.title}</div>
                      <div className="text-sm text-muted">{m.target_date ? new Date(m.target_date).toLocaleDateString('en-IN') : 'No date'}</div>
                    </div>
                  </div>
                  <div className="row gap-16">
                    <span className="text-bold">₹{m.target_amount.toLocaleString('en-IN')}</span>
                    <span className={`badge ${m.status === 'approved' ? 'badge-green' : m.status === 'rejected' ? 'badge-red' : 'badge-orange'}`}>
                      {m.status === 'approved' ? t(lang, 'verified') : m.status === 'rejected' ? t(lang, 'rejected') : m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'create' && (
          <div className="slide-up">
            <button className="back-btn" onClick={() => setTab('home')}>← {t(lang, 'dashboard')}</button>
            <h2 style={{ fontSize: 22, marginBottom: 24 }}>{t(lang, 'newDrive')}</h2>
            <div className="card">
              <CreateDriveForm onSuccess={() => { showToast(t(lang, 'live') + '...'); setTab('home'); refetch(); }} />
            </div>
          </div>
        )}

        {tab === 'proof' && (
          <div className="slide-up">
            <button className="back-btn" onClick={() => setTab('home')}>← {t(lang, 'dashboard')}</button>
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>{t(lang, 'submitProof')}</h2>
            <p className="text-muted mb-24">{t(lang, 'reviewProof')}</p>
            {pendingMs.length === 0 ? (
              <div className="empty"><div className="empty-icon">📭</div><h4>{t(lang, 'noAuditRecords')}</h4></div>
            ) : (
              <div className="card"><ProofSubmissionForm milestones={pendingMs} onSuccess={() => { showToast(t(lang, 'live') + '...'); setTab('home'); }} /></div>
            )}
          </div>
        )}
      </div>

      {toast && <div className="toast success">{toast}</div>}
    </div>
  );
};
