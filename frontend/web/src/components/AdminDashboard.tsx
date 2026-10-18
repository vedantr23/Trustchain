import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { t, td, LANGUAGES } from '../i18n';
import type { LangCode } from '../i18n';
import { RealtimeService } from '../utils/realtimeService';
import { PinataService } from '../utils/pinataService';
// useDrives - no demo data

interface Proof {
  id: string;
  proof_type: 'image' | 'pdf' | 'gps';
  proof_url: string;
  ipfsHash?: string;
  fileName?: string;
  metadata?: { ipfsHash?: string; fileName?: string };
  localPreview?: string;
}

interface Milestone {
  id: string;
  drive_id: string;
  title: string;
  target_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  drives?: { title: string; payout_upi_id?: string };
  payout_upi_id?: string;
  proofs?: Proof[];
}

const ADMIN_ID = 'admin-governance-001';

const ProofThumb: React.FC<{ urls: string[]; alt: string }> = ({ urls, alt }) => {
  const [idx, setIdx] = useState(0);
  const src = urls[idx] || '';
  if (!src) return <div className="proof-doc">📷</div>;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => {
        if (idx + 1 < urls.length) setIdx(idx + 1);
      }}
    />
  );
};

export const AdminDashboard: React.FC<{ onBack: () => void; lang: LangCode; dark: boolean; setDark: (v: boolean) => void; setLang: (v: LangCode) => void }> = ({ onBack, lang, dark, setDark, setLang }) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [ngos, setNgos] = useState<any[]>([
    { id: 'ngo-1', full_name: 'India Relief Foundation', email: 'irf@trustchain.org', max_drive_limit: 1000000 },
    { id: 'ngo-2', full_name: 'Vidya Daan Education Trust', email: 'vidya@trustchain.org', max_drive_limit: 500000 },
    { id: 'ngo-3', full_name: 'Jal Seva Sangh', email: 'jalseva@trustchain.org', max_drive_limit: 800000 },
  ]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'queue' | 'audit' | 'ngos'>('queue');
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selected, setSelected] = useState<Milestone | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showTickId, setShowTickId] = useState<string | null>(null);
  const [showRejectId, setShowRejectId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [editingLimit, setEditingLimit] = useState<{ id: string, limit: number } | null>(null);
  const [viewer, setViewer] = useState<{ urls: string[]; title: string } | null>(null);
  const [releaseModal, setReleaseModal] = useState<Milestone | null>(null);
  const [releaseUtr, setReleaseUtr] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const normalizeProof = (p: any, localProofs: any[]): Proof => {
    const local = localProofs.find((lp: any) => lp.id === p.id || (lp.ipfsHash && lp.ipfsHash === (p.metadata?.ipfsHash || p.ipfsHash)));
    return {
      ...p,
      ipfsHash: p.ipfsHash || p.metadata?.ipfsHash || local?.ipfsHash,
      fileName: p.fileName || p.metadata?.fileName || local?.fileName,
      localPreview: local?.localPreview,
      proof_url: local?.localPreview || p.proof_url,
    };
  };

  const fetchAllData = useCallback(async () => {
    const localProofs = RealtimeService.getProofs();
    try {
      const { data: sbMs, error: msErr } = await supabase.from('milestones').select('*, drives(title), proofs(*)').order('created_at', { ascending: false });
      const { data: sbLogs } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
      const { data: sbNgos } = await supabase.from('profiles').select('*').eq('role', 'NGO');

      if (msErr) console.error('Supabase milestones fetch error:', msErr);

      if (sbMs && sbMs.length > 0) {
        const mapped = (sbMs as Milestone[]).map(m => {
          const fromDb = (m.proofs || []).map(p => normalizeProof(p, localProofs));
          const extraLocal = localProofs.filter(lp => lp.milestone_id === m.id && !fromDb.some(p => p.id === lp.id));
          return {
            ...m,
            payout_upi_id: m.payout_upi_id || m.drives?.payout_upi_id || 'ngo.trustchain@okaxis',
            proofs: [...fromDb, ...extraLocal],
          };
        });
        setMilestones(mapped);
        if (sbLogs) setAuditLogs(sbLogs);
        if (sbNgos && sbNgos.length > 0) setNgos(sbNgos);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Supabase admin fetch fallback', e);
    }

    // 2. Realtime / Local Fallback
    const savedDrives = localStorage.getItem('trustchain_local_drives');
    const drivesList = savedDrives ? JSON.parse(savedDrives) : [];
    const allProofs = RealtimeService.getProofs();

    const flattenedMs: Milestone[] = [];
    drivesList.forEach((d: any) => {
      (d.milestones || []).forEach((m: any) => {
        const msProofs = allProofs.filter(p => p.milestone_id === m.id);
        flattenedMs.push({
          id: m.id,
          drive_id: d.id,
          title: m.title,
          target_amount: m.target_amount,
          status: m.status,
          drives: { title: d.title, payout_upi_id: d.payout_upi_id || 'ngo.trustchain@okaxis' },
          payout_upi_id: m.payout_upi_id || d.payout_upi_id || 'ngo.trustchain@okaxis',
          proofs: msProofs,
        });
      });
    });

    setMilestones(flattenedMs);
    setAuditLogs(RealtimeService.getAuditLogs());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllData();

    const handleSync = () => fetchAllData();
    window.addEventListener('trustchain-sync', handleSync);

    try {
      const ch = supabase.channel('admin-full-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones' }, fetchAllData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchAllData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, fetchAllData)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'proofs' }, fetchAllData)
        .subscribe();
      return () => {
        window.removeEventListener('trustchain-sync', handleSync);
        supabase.removeChannel(ch);
      };
    } catch (e) {
      return () => {
        window.removeEventListener('trustchain-sync', handleSync);
      };
    }
  }, [fetchAllData]);

  const updateNgoLimit = async (id: string, limit: number) => {
    setActionLoading(id);
    setNgos(prev => prev.map(n => n.id === id ? { ...n, max_drive_limit: limit } : n));
    showToast(t(lang, 'limitUpdated'));
    setEditingLimit(null);
    setActionLoading(null);
  };

  const handleAction = async (milestoneId: string, status: 'approved' | 'rejected', customUtr?: string) => {
    setActionLoading(milestoneId);
    try {
      const targetMilestone = milestones.find(m => m.id === milestoneId);
      const amount = targetMilestone?.target_amount || 50000;
      const ngoUpi = targetMilestone?.payout_upi_id || targetMilestone?.drives?.payout_upi_id || 'ngo.trustchain@okaxis';
      const utrRef = customUtr || `UPI-DISBURSE-${Date.now().toString(36).toUpperCase()}`;

      // Try Supabase update
      try {
        const { error: upErr } = await supabase
          .from('milestones')
          .update({ status })
          .eq('id', milestoneId);
        if (upErr) console.error('Milestone update failed:', upErr);

        const { error: logErr } = await supabase.from('audit_logs').insert({
          action: status === 'approved' ? 'FUNDS_RELEASED' : 'MILESTONE_REJECTED',
          target_table: 'milestones',
          target_id: milestoneId,
          details: status === 'approved'
            ? { amount, ngo_upi: ngoUpi, utr_ref: utrRef, note: `Released ₹${amount.toLocaleString('en-IN')} to ${ngoUpi}` }
            : { reason: 'Proof rejected - verification criteria not met' }
        });
        if (logErr) console.error('Audit log insert failed:', logErr);
      } catch (sbErr) {
        console.warn('Supabase admin action fallback', sbErr);
      }

      // Update LocalStorage Drives
      const savedDrives = localStorage.getItem('trustchain_local_drives');
      const drivesList = savedDrives ? JSON.parse(savedDrives) : [];
      const updatedDrives = drivesList.map((d: any) => ({
        ...d,
        milestones: (d.milestones || []).map((m: any) => m.id === milestoneId ? {
          ...m,
          status,
          release_upi_ref: utrRef,
          released_at: new Date().toISOString(),
        } : m)
      }));
      localStorage.setItem('trustchain_local_drives', JSON.stringify(updatedDrives));

      // Add local Audit log
      RealtimeService.addAuditLog({
        id: `log-${Date.now()}`,
        milestone_id: milestoneId,
        action: status === 'approved' ? 'FUNDS_RELEASED' : 'MILESTONE_REJECTED',
        admin_id: ADMIN_ID,
        notes: status === 'approved'
          ? `Verified IPFS proofs & released ₹${amount.toLocaleString('en-IN')} to NGO UPI (${ngoUpi}). UTR Ref: ${utrRef}`
          : 'Proof rejected due to verification criteria.',
        timestamp: 'Just now',
      });

      // Update local state
      setSelected(prev => prev?.id === milestoneId ? { ...prev, status } : prev);
      setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, status } : m));

      if (status === 'approved') {
        setShowTickId(milestoneId);
        setReleaseModal(null);
        setTimeout(() => {
          setShowTickId(null);
          setSelected(null);
          setFilter('approved');
          showToast(`✅ Released ₹${amount.toLocaleString('en-IN')} to NGO UPI (${ngoUpi})!`);
        }, 1200);
      } else {
        setShowRejectId(milestoneId);
        setTimeout(() => {
          setShowRejectId(null);
          setSelected(null);
          setFilter('rejected');
          showToast('Milestone rejected.');
        }, 1200);
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
          <button className={`tab ${tab === 'ngos' ? 'active' : ''}`} onClick={() => setTab('ngos')}>{t(lang, 'ngoManagement')}</button>
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
                <h2 style={{ fontSize: 22 }}>{t(lang, 'approvalQueue')}</h2>
                <p className="text-muted" style={{ fontSize: 13 }}>{t(lang, 'reviewProof')}</p>
              </div>
              <div className="row gap-8">
                {(['pending', 'approved', 'rejected'] as const).map(f => (
                  <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>
                    {f === 'pending' ? t(lang, 'pendingTab') : f === 'approved' ? t(lang, 'approvedTab') : t(lang, 'rejectedTab')} ({milestones.filter(m => m.status === f).length})
                  </button>
                ))}
              </div>
            </div>

            {loading && <div className="empty"><div className="pulse">Loading queue...</div></div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(m => (
                <div key={m.id} className="card card-sm card-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onClick={() => setSelected(m)}>
                  <div>
                    <div className="text-sm text-muted mb-4">{td(lang, m.drives?.title)}</div>
                    <div className="text-bold" style={{ fontSize: 15 }}>{td(lang, m.title)}</div>
                    <div className="row gap-8 mt-4">
                      <span className="text-sm text-bold" style={{ color: 'var(--green)' }}>₹{m.target_amount.toLocaleString('en-IN')}</span>
                      <span className="badge badge-blue">{(m.proofs?.length || 0)} IPFS Proofs Attached</span>
                    </div>
                  </div>
                  <div className="row gap-12">
                    <span className={`badge ${m.status === 'approved' ? 'badge-green' : m.status === 'rejected' ? 'badge-red' : 'badge-orange'}`}>
                      {td(lang, m.status).toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>Review Proofs →</span>
                  </div>
                </div>
              ))}
              {!loading && filtered.length === 0 && (
                <div className="empty"><div className="empty-icon">📭</div><h4>No milestones in {filter} queue</h4></div>
              )}
            </div>
          </div>
        )}

        {/* ── MILESTONE DETAIL VIEW ── */}
        {tab === 'queue' && selected && (
          <div className="slide-up">
            <button className="back-btn" onClick={() => setSelected(null)}>← {t(lang, 'backBtn')}</button>

            <div className="grid-2" style={{ gap: 32 }}>
              {/* Left: Details & Proof */}
              <div>
                <div className="text-sm text-muted mb-4">{td(lang, selected.drives?.title)}</div>
                <h2 style={{ fontSize: 24, marginBottom: 16 }}>{td(lang, selected.title)}</h2>
                <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
                  <div className="stat-card" style={{ minWidth: 200, flex: 1 }}>
                    <div className="stat-label">{t(lang, 'releaseAmount')}</div>
                    <div className="stat-value blue" style={{ fontSize: 26 }}>₹{selected.target_amount.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="stat-card" style={{ minWidth: 220, flex: 1 }}>
                    <div className="stat-label">{t(lang, 'ngoPayoutUpi')}</div>
                    <div className="stat-value" style={{ fontSize: 15, fontFamily: 'monospace', color: 'var(--text-1)' }}>
                      {selected.payout_upi_id || selected.drives?.payout_upi_id || 'ngo.trustchain@okaxis'}
                    </div>
                  </div>
                </div>

                <h3 className="mb-12">{t(lang, 'submittedProof')}</h3>
                {selected.proofs && selected.proofs.length > 0 ? (
                  <div className="proof-grid">
                    {selected.proofs.map((p) => {
                      const urls = PinataService.getPreviewUrls(p.localPreview || p.ipfsHash, p.proof_url);
                      const openProof = (e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!urls.length) return;
                        setViewer({ urls, title: p.fileName || p.ipfsHash || p.proof_type });
                      };
                      return (
                        <div key={p.id} className="proof-tile" onClick={openProof} role="button" tabIndex={0}>
                          {p.proof_type === 'image' ? (
                            <ProofThumb urls={urls} alt={p.fileName || 'Proof'} />
                          ) : p.proof_type === 'gps' ? (
                            <div className="proof-doc" style={{ fontSize: 13, fontWeight: 700, padding: 8 }}>📍 {p.proof_url}</div>
                          ) : (
                            <div className="proof-doc">📄 {p.fileName || 'PDF Invoice'}</div>
                          )}
                          <div className="proof-tile-label">
                            {p.proof_type.toUpperCase()} · {p.ipfsHash ? `${p.ipfsHash.substring(0, 10)}...` : 'IPFS'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="card" style={{ background: 'var(--surface-2)', textAlign: 'center', padding: 24 }}>
                    <p className="text-muted">No uploaded files yet for this milestone.</p>
                  </div>
                )}
              </div>

              {/* Right: Actions */}
              <div className="card" style={{ height: 'fit-content', padding: 28 }}>
                <h3 style={{ marginBottom: 12 }}>{t(lang, 'verificationAction')}</h3>
                <p className="text-muted text-sm mb-24">
                  {t(lang, 'reviewProof')}
                </p>

                {selected.status === 'pending' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button
                      className="btn btn-green btn-lg btn-full"
                      onClick={() => {
                        setReleaseUtr('');
                        setReleaseModal(selected);
                      }}
                      disabled={Boolean(actionLoading)}
                    >
                      {actionLoading === selected.id ? `${t(lang, 'live')}...` : `✅ ${t(lang, 'releaseFunds')}`}
                    </button>
                    <button
                      className="btn btn-outline btn-full"
                      style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                      onClick={() => handleAction(selected.id, 'rejected')}
                      disabled={Boolean(actionLoading)}
                    >
                      {t(lang, 'rejectSubmission')}
                    </button>
                  </div>
                ) : (
                  <div style={{ background: selected.status === 'approved' ? 'var(--green-lt)' : 'var(--red-lt)', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{selected.status === 'approved' ? '✅' : '❌'}</div>
                    <div className="text-bold" style={{ color: selected.status === 'approved' ? 'var(--green)' : 'var(--red)' }}>
                      This milestone has been {selected.status.toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── AUDIT TRAIL ── */}
        {tab === 'audit' && (
          <div className="slide-up">
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>{t(lang, 'globalLedger')}</h2>
            <p className="text-muted mb-24">{t(lang, 'ledgerDesc')}</p>

            <div className="card table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t(lang, 'timestamp')}</th>
                    <th>{t(lang, 'action')}</th>
                    <th>Authorized Admin</th>
                    <th>{t(lang, 'detailsContext')}</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log, idx) => (
                    <tr key={log.id || idx}>
                      <td className="text-sm text-muted">{log.timestamp || 'Just now'}</td>
                      <td>
                        <span className={`badge ${log.action === 'approved' || log.action?.includes('APPROVE') ? 'badge-green' : 'badge-orange'}`}>
                          {log.action?.toUpperCase() || 'VERIFIED'}
                        </span>
                      </td>
                      <td className="text-bold" style={{ fontSize: 13 }}>{log.admin_id || ADMIN_ID}</td>
                      <td className="text-sm">{log.notes || log.details?.notes || 'Milestone verification logged.'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── NGO MANAGEMENT ── */}
        {tab === 'ngos' && (
          <div className="slide-up">
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>NGO Partner Management</h2>
            <p className="text-muted mb-24">Verify partner NGOs and manage their maximum drive fundraising limits.</p>

            <div className="card table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Organization Name</th>
                    <th>Contact Email</th>
                    <th>Fundraising Limit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ngos.map(ngo => (
                    <tr key={ngo.id}>
                      <td className="text-bold">{ngo.full_name}</td>
                      <td className="text-muted text-sm">{ngo.email}</td>
                      <td className="text-bold" style={{ color: 'var(--blue)' }}>
                        {editingLimit && editingLimit.id === ngo.id ? (
                          <input
                            type="number"
                            value={editingLimit.limit}
                            onChange={e => setEditingLimit({ id: ngo.id, limit: parseFloat(e.target.value) || 0 })}
                            style={{ width: 140, padding: 4 }}
                          />
                        ) : (
                          `₹${(ngo.max_drive_limit || 1000000).toLocaleString('en-IN')}`
                        )}
                      </td>
                      <td>
                        {editingLimit && editingLimit.id === ngo.id ? (
                          <div className="row gap-4">
                            <button className="btn btn-primary btn-sm" onClick={() => updateNgoLimit(ngo.id, editingLimit.limit)}>Save</button>
                            <button className="btn btn-outline btn-sm" onClick={() => setEditingLimit(null)}>Cancel</button>
                          </div>
                        ) : (
                          <button className="btn btn-outline btn-sm" onClick={() => setEditingLimit({ id: ngo.id, limit: ngo.max_drive_limit || 1000000 })}>
                            Edit Limit
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

      {showTickId && (
        <div className="toast success">✅ Milestone Approved & Escrow Funds Released!</div>
      )}
      {showRejectId && (
        <div className="toast error">❌ Milestone Rejected.</div>
      )}

      {viewer && (
        <div className="proof-lightbox" onClick={() => setViewer(null)}>
          <div className="proof-lightbox-inner" onClick={e => e.stopPropagation()}>
            <div className="row-sb mb-12">
              <strong>{viewer.title}</strong>
              <button className="btn btn-outline btn-sm" onClick={() => setViewer(null)}>Close</button>
            </div>
            {viewer.urls[0] && (
              <p className="text-sm mb-12">
                <a href={viewer.urls[0]} target="_blank" rel="noreferrer">Open original file ↗</a>
              </p>
            )}
            {viewer.title.toLowerCase().endsWith('.pdf') ? (
              <p className="text-sm">PDF preview: use the link above if it does not render here.</p>
            ) : (
              <ProofThumb urls={viewer.urls} alt={viewer.title} />
            )}
            <p className="text-sm text-muted mt-8">If the image is blank, the CID is still propagating. Try the Pinata link in a new tab.</p>
          </div>
        </div>
      )}

      {/* ── REAL UPI ESCROW RELEASE MODAL ── */}
      {releaseModal && (
        <div className="modal-overlay" onClick={() => setReleaseModal(null)}>
          <div
            className="modal-content slide-up"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 500, padding: 26, borderRadius: 18 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <span className="badge badge-green mb-4">Milestone Escrow Payout</span>
                <h3 style={{ fontSize: 19, margin: '4px 0' }}>Release Funds to NGO</h3>
                <p className="text-sm text-muted" style={{ margin: 0 }}>
                  Campaign: <strong>{releaseModal.drives?.title}</strong>
                </p>
              </div>
              <button
                onClick={() => setReleaseModal(null)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-3)' }}
              >
                ✕
              </button>
            </div>

            {/* Payout Details */}
            <div style={{ background: 'var(--surface-2, #f8fafc)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Amount to Disburse:</span>
                <strong style={{ fontSize: 18, color: 'var(--green)' }}>₹{releaseModal.target_amount.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Destination NGO UPI ID:</span>
                <strong style={{ fontFamily: 'monospace', fontSize: 13 }}>
                  {releaseModal.payout_upi_id || releaseModal.drives?.payout_upi_id || 'ngo.trustchain@okaxis'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Milestone Objective:</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{releaseModal.title}</span>
              </div>
            </div>

            {/* Real UPI QR & Intent Dispatch */}
            {(() => {
              const destUpi = releaseModal.payout_upi_id || releaseModal.drives?.payout_upi_id || 'ngo.trustchain@okaxis';
              const payoutUpiUri = `upi://pay?pa=${destUpi}&pn=NGO&am=${releaseModal.target_amount}&tn=${encodeURIComponent(`MilestoneRelease_${releaseModal.id.slice(0, 6)}`)}&cu=INR`;
              const payoutQr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(payoutUpiUri)}&margin=6`;
              return (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 10 }}>
                    Scan with your Admin banking / UPI app to transfer locked escrow funds directly to NGO:
                  </p>
                  <div style={{ display: 'inline-block', padding: 10, background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                    <img src={payoutQr} alt="Payout QR" style={{ width: 160, height: 160, display: 'block' }} />
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <a href={payoutUpiUri} className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}>
                      ⚡ Open Admin UPI App (GPay / PhonePe / Paytm / BHIM)
                    </a>
                  </div>
                </div>
              );
            })()}

            {/* Payout Reference / Bank UTR */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--text-2)' }}>
                Bank Payout Reference / UPI UTR Number:
              </label>
              <input
                type="text"
                placeholder="e.g. 428901239845 (or leave empty for auto)"
                value={releaseUtr}
                onChange={e => setReleaseUtr(e.target.value.trim())}
                style={{ fontSize: 13, fontFamily: 'monospace' }}
              />
              <small style={{ color: 'var(--text-3)', fontSize: 11, display: 'block', marginTop: 4 }}>
                This reference number will be anchored to the blockchain audit log.
              </small>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => setReleaseModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-green"
                style={{ flex: 2, padding: 12, fontWeight: 700 }}
                onClick={() => handleAction(releaseModal.id, 'approved', releaseUtr)}
                disabled={Boolean(actionLoading)}
              >
                {actionLoading === releaseModal.id ? 'Releasing...' : 'Confirm & Release from Escrow →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast success">{toast}</div>}
    </div>
  );
};
