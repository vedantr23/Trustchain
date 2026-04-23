import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { t, LANGUAGES } from '../i18n';
import type { LangCode } from '../i18n';

interface Proof { id: string; proof_type: 'image' | 'pdf' | 'gps'; proof_url: string; }
interface Milestone {
  id: string; title: string; target_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  drives?: { title: string };
  proofs?: Proof[];
}

const ADMIN_ID = 'admin-placeholder-id';

export const AdminDashboard: React.FC<{ onBack: () => void; lang: LangCode; dark: boolean; setDark: (v: boolean) => void; setLang: (v: LangCode) => void }> = ({ onBack, lang, dark, setDark, setLang }) => {
  const [milestones, setMilestones]     = useState<Milestone[]>([]);
  const [auditLogs, setAuditLogs]       = useState<any[]>([]);
  const [ngos, setNgos]                 = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [tab, setTab]                   = useState<'queue' | 'audit' | 'ngos'>('queue');
  const [filter, setFilter]             = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selected, setSelected]         = useState<Milestone | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showTickId, setShowTickId]     = useState<string | null>(null);
  const [showRejectId, setShowRejectId] = useState<string | null>(null);
  const [toast, setToast]               = useState<string | null>(null);
  const [editingLimit, setEditingLimit] = useState<{ id: string, limit: number } | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchMs = useCallback(async () => {
    const { data } = await supabase.from('milestones').select('*, drives(title), proofs(*)').order('created_at', { ascending: false });
    if (data) setMilestones(data as Milestone[]);
    setLoading(false);
  }, []);

  const fetchLogs = useCallback(async () => {
    const { data } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(50);
    if (data) setAuditLogs(data);
  }, []);

  const fetchNgos = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'NGO');
    if (data) setNgos(data);
  }, []);

  useEffect(() => {
    fetchMs();
    fetchLogs();
    fetchNgos();
    const ch = supabase.channel('admin-full-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones' }, fetchMs)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchNgos)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, fetchLogs)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchMs, fetchLogs, fetchNgos]);

  const updateNgoLimit = async (id: string, limit: number) => {
    setActionLoading(id);
    const { error } = await supabase.from('profiles').update({ max_drive_limit: limit }).eq('id', id);
    if (error) showToast('Error: ' + error.message);
    else {
      showToast(t(lang, 'limitUpdated'));
      setEditingLimit(null);
      fetchNgos();
    }
    setActionLoading(null);
  };

  const handleAction = async (milestoneId: string, status: 'approved' | 'rejected') => {
    setActionLoading(milestoneId);
    try {
      // 1. Update the milestone status directly in Supabase
      const { data: milestoneData, error: mErr } = await supabase
        .from('milestones')
        .update({ status })
        .eq('id', milestoneId)
        .select()
        .single();
      
      if (mErr) throw mErr;

      // 2. Log this in the Audit Trail
      await supabase.from('audit_logs').insert({
        milestone_id: milestoneId,
        action: status,
        admin_id: ADMIN_ID,
        notes: status === 'approved' 
          ? `Verified proof and released ₹${milestoneData.target_amount} to NGO.` 
          : 'Proof rejected due to verification failure.'
      });

      // 3. Immediately patch local state for smooth UI
      setSelected(prev => prev?.id === milestoneId ? { ...prev, status } : prev);
      setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, status } : m));

      if (status === 'approved') {
        setShowTickId(milestoneId);
        setTimeout(() => {
          setShowTickId(null);
          setSelected(null);
          setFilter('approved');
          showToast('✅ Funds released & credited to NGO!');
        }, 1500);
      } else {
        setShowRejectId(milestoneId);
        setTimeout(() => {
          setShowRejectId(null);
          setSelected(null);
          setFilter('rejected');
          showToast('Milestone rejected.');
        }, 1500);
      }
    } catch (err: any) {
      showToast('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = milestones.filter(m => m.status === filter);

  return (
    <div>
      <nav className="topnav">
        <div className="topnav-logo" onClick={onBack}>Trust<span>Chain</span></div>
        <div className="tabs">
          <button className={`tab ${tab === 'queue' ? 'active' : ''}`} onClick={() => { setTab('queue'); setSelected(null); }}>{t(lang, 'approvalQueue')}</button>
          <button className={`tab ${tab === 'audit' ? 'active' : ''}`} onClick={() => setTab('audit')}>{t(lang, 'auditTrail')}</button>
          <button className={`tab ${tab === 'ngos'  ? 'active' : ''}`} onClick={() => setTab('ngos')}>{t(lang, 'ngoManagement')}</button>
        </div>
        <div className="row gap-8">
          <select className="lang-select" value={lang} onChange={e => setLang(e.target.value as LangCode)} title={t(lang, 'language')}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.native}</option>)}
          </select>
          <button className="theme-toggle" onClick={() => setDark(!dark)} title={dark ? 'Light' : 'Dark'}>{dark ? '☀️' : '🌙'}</button>
          <span className="live-dot" />
          <span className="text-sm text-muted">Admin — {t(lang, 'live')}</span>
        </div>
      </nav>

      <div className="page">
        {/* ── APPROVAL QUEUE ── */}
        {tab === 'queue' && !selected && (
          <div className="slide-up">
            <div className="row-sb mb-24">
              <div>
                <h2 style={{ fontSize: 22 }}>Approval Queue</h2>
                <p className="text-muted" style={{ fontSize: 13 }}>Click any milestone to review proof before approving funds.</p>
              </div>
              <div className="row gap-8">
                {(['pending', 'approved', 'rejected'] as const).map(f => (
                  <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)} ({milestones.filter(m => m.status === f).length})
                  </button>
                ))}
              </div>
            </div>

            {loading && <div className="empty"><div className="pulse">Loading...</div></div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(m => (
                <div key={m.id} className="card card-sm card-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => setSelected(m)}>
                  <div>
                    <div className="text-sm text-muted mb-4">{m.drives?.title}</div>
                    <div className="text-bold" style={{ fontSize: 15 }}>{m.title}</div>
                    <div className="row gap-8 mt-4">
                      <span className="text-sm">₹{m.target_amount.toLocaleString('en-IN')}</span>
                      <span className="text-sm text-muted">{(m.proofs?.length || 0)} files uploaded</span>
                    </div>
                  </div>
                  <div className="row gap-12">
                    <span className={`badge ${m.status === 'approved' ? 'badge-green' : m.status === 'rejected' ? 'badge-red' : 'badge-orange'}`}>
                      {m.status}
                    </span>
                    <span style={{ color: 'var(--primary)', fontSize: 13 }}>View Details →</span>
                  </div>
                </div>
              ))}
              {!loading && filtered.length === 0 && (
                <div className="empty"><div className="empty-icon">📭</div><h4>No milestones in {filter}</h4></div>
              )}
            </div>
          </div>
        )}

        {/* ── MILESTONE DETAIL VIEW ── */}
        {tab === 'queue' && selected && (
          <div className="slide-up">
            <button className="back-btn" onClick={() => setSelected(null)}>← Back to Queue</button>
            
            <div className="grid-2" style={{ gap: 32 }}>
              {/* Left: Details & Proof */}
              <div>
                <div className="text-sm text-muted mb-4">{selected.drives?.title}</div>
                <h2 style={{ fontSize: 24, marginBottom: 16 }}>{selected.title}</h2>
                <div className="stat-card mb-24" style={{ display: 'inline-block', minWidth: 200 }}>
                  <div className="stat-label">Amount to Release</div>
                  <div className="stat-value blue" style={{ fontSize: 28 }}>₹{selected.target_amount.toLocaleString('en-IN')}</div>
                </div>

                <h3 className="mb-12">Submitted Proof</h3>
                {selected.proofs && selected.proofs.length > 0 ? (
                  <div className="proof-grid">
                    {selected.proofs.map(p => (
                      <div key={p.id} className="proof-tile" onClick={() => window.open(p.proof_url)}>
                        {p.proof_type === 'image' ? (
                          <img src={p.proof_url} alt="Proof" />
                        ) : p.proof_type === 'gps' ? (
                          <div className="proof-doc" style={{ fontSize: 13, fontWeight: 700, padding: 8 }}>📍 {p.proof_url}</div>
                        ) : (
                          <div className="proof-doc">📄</div>
                        )}
                        <div className="proof-tile-label">{p.proof_type.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card" style={{ background: 'var(--orange-lt)', border: '1px solid #fde68a' }}>
                    <p className="text-sm" style={{ color: 'var(--orange)' }}>⚠️ No proof uploaded yet by NGO.</p>
                  </div>
                )}
              </div>

              {/* Right: Action Panel */}
              <div>
                <div className="card" style={{ position: 'sticky', top: 80 }}>
                  <h3 className="mb-24">Verification Action</h3>

                  {showTickId === selected.id ? (
                    <div className="approve-overlay">
                      <div className="approve-checkmark">✅</div>
                      <div className="approve-text">APPROVED</div>
                      <p className="text-sm text-muted">Funds credited to NGO</p>
                    </div>
                  ) : showRejectId === selected.id ? (
                    <div className="approve-overlay" style={{ color: 'var(--red)' }}>
                      <div className="approve-checkmark" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, animation: 'none' }}>❌</div>
                      <div className="approve-text" style={{ color: 'var(--red)' }}>REJECTED</div>
                      <p className="text-sm text-muted">NGO has been notified</p>
                    </div>
                  ) : selected.status === 'pending' ? (
                    <div className="col gap-12">
                      <p className="text-sm text-muted mb-8">
                        Review all proof carefully before approving fund release.
                      </p>
                      <button className="btn btn-green btn-lg btn-full" onClick={() => handleAction(selected.id, 'approved')} disabled={actionLoading === selected.id}>
                        {actionLoading === selected.id ? 'Processing...' : 'Release Funds 💸 (₹' + selected.target_amount.toLocaleString('en-IN') + ')'}
                      </button>
                      <button className="btn btn-danger btn-full" onClick={() => handleAction(selected.id, 'rejected')} disabled={actionLoading === selected.id}>
                        ✕ Reject Submission
                      </button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>{selected.status === 'approved' ? '✅' : '❌'}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: selected.status === 'approved' ? 'var(--green)' : 'var(--red)', fontFamily: 'Poppins, sans-serif' }}>
                        {selected.status === 'approved' ? 'FUNDS APPROVED' : 'REJECTED'}
                      </div>
                      <p className="text-sm text-muted mt-8">
                        {selected.status === 'approved' ? 'Funds have been credited to the NGO.' : 'Milestone has been rejected.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── AUDIT TRAIL ── */}
        {tab === 'audit' && (
          <div className="slide-up">
            <div className="row-sb mb-24">
              <div>
                <h3 style={{ fontSize: 22 }}>Global Governance Ledger</h3>
                <p className="text-muted" style={{ fontSize: 13 }}>Immutable record of all fund releases and governance actions.</p>
              </div>
              <div className="stat-card" style={{ borderLeft: '3px solid var(--green)', minWidth: 240 }}>
                <div className="stat-label" style={{ color: 'var(--green)' }}>Total Funds Released</div>
                <div className="stat-value green" style={{ fontSize: 24 }}>₹{auditLogs.filter(l => l.action === 'approved').reduce((acc, l) => {
                  const m = milestones.find(ms => ms.id === l.milestone_id);
                  return acc + (m?.target_amount || 0);
                }, 0).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="card table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Details & Proof Context</th>
                    <th className="text-right">Fund Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => {
                    const m = milestones.find(ms => ms.id === log.milestone_id);
                    return (
                      <tr key={log.id}>
                        <td className="text-sm" style={{ whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`badge ${log.action === 'approved' ? 'badge-green' : 'badge-red'}`}>
                            {log.action === 'approved' ? 'FUND RELEASED' : 'REJECTED'}
                          </span>
                        </td>
                        <td>
                          <div className="text-bold" style={{ fontSize: 13 }}>{m?.title || 'Unknown Milestone'}</div>
                          <div className="text-sm text-muted">{log.notes}</div>
                        </td>
                        <td className="text-right text-bold" style={{ color: log.action === 'approved' ? 'var(--green)' : 'var(--text-4)' }}>
                          {log.action === 'approved' ? `+ ₹${m?.target_amount.toLocaleString('en-IN')}` : '--'}
                        </td>
                      </tr>
                    );
                  })}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>
                        No audit records found in the governance ledger.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── NGO MANAGEMENT ── */}
        {tab === 'ngos' && (
          <div className="slide-up">
            <h3 className="mb-4">{t(lang, 'ngoManagement')}</h3>
            <p className="text-muted mb-24">Monitor NGOs and set their maximum fundraising limits.</p>
            
            <div className="card table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>NGO ID / Name</th>
                    <th>Created At</th>
                    <th className="text-right">{t(lang, 'maxLimit')}</th>
                    <th className="text-right">{t(lang, 'action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ngos.map(n => (
                    <tr key={n.id}>
                      <td>
                        <div className="text-bold">{n.name || 'NGO ' + n.id.slice(0, 5)}</div>
                        <div className="text-xs text-muted">{n.id}</div>
                      </td>
                      <td className="text-sm">{new Date(n.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="text-right text-bold">
                        {editingLimit?.id === n.id ? (
                          <input 
                            type="number" 
                            className="form-group text-right" 
                            style={{ width: 120, display: 'inline' }}
                            value={editingLimit?.limit || 0}
                            onChange={e => setEditingLimit({ id: n.id, limit: parseInt(e.target.value) || 0 })}
                          />
                        ) : (
                          `₹${(n.max_drive_limit || 1000000).toLocaleString('en-IN')}`
                        )}
                      </td>
                      <td className="text-right">
                        {editingLimit?.id === n.id ? (
                          <div className="row gap-8" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn btn-primary btn-sm" onClick={() => editingLimit && updateNgoLimit(n.id, editingLimit.limit)} disabled={actionLoading === n.id}>
                              {actionLoading === n.id ? '...' : t(lang, 'saveLimit')}
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => setEditingLimit(null)}>✕</button>
                          </div>
                        ) : (
                          <button className="btn btn-outline btn-sm" onClick={() => setEditingLimit({ id: n.id, limit: n.max_drive_limit || 1000000 })}>
                            ✏️ {t(lang, 'setDriveLimit')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {toast && <div className="toast success">{toast}</div>}
    </div>
  );
};
