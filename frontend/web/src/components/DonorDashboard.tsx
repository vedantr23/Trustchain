import { useState } from 'react';
import { useDonorDashboard } from '../hooks/useDonorDashboard';
import { t, td, LANGUAGES } from '../i18n';
import type { LangCode } from '../i18n';
import { generate80GReceipt, generateFYReport } from '../generate80G';
import { PaymentModal } from './PaymentModal';
import { TransparencyExplorer } from './TransparencyExplorer';

interface Props {
  onBack: () => void;
  lang: LangCode;
  dark: boolean;
  setDark: (v: boolean) => void;
  setLang: (v: LangCode) => void;
  user: any;
}

const LEADERBOARD = [
  { rank: 1, name: 'Aryan Sharma', city: 'Mumbai', state: 'Maharashtra', total: 245000 },
  { rank: 2, name: 'Priya Patel', city: 'Surat', state: 'Gujarat', total: 182000 },
  { rank: 3, name: 'Rajesh Kumar', city: 'Nagpur', state: 'Maharashtra', total: 134000 },
  { rank: 4, name: 'Ananya Rao', city: 'Hyderabad', state: 'Telangana', total: 98000 },
  { rank: 5, name: 'Vikram Singh', city: 'Jaipur', state: 'Rajasthan', total: 74000 },
  { rank: 6, name: 'Meena Joshi', city: 'Pune', state: 'Maharashtra', total: 62000 },
  { rank: 7, name: 'You (Jane Doe)', city: 'Chennai', state: 'Tamil Nadu', total: 12500, isMe: true },
];

const PAST_DONATIONS = [
  { id: 'DON-2026-001', drive: 'Flood Relief Nagpur', milestone: 'Emergency Supplies', amount: 2500, date: '1 Apr 2026', ngo: 'India Relief Foundation', ngoAddress: '12, MG Road, Nagpur, Maharashtra 440001', ngoPan: 'AABCI1234F', ngo80g: '80G/2024/IRF/NAG/0042', deduction: 50, payment: 'UPI', txnRef: '0x8f3c71a9b24e6d8012a4b8c9d10e5f2a7b3c4d5e' },
  { id: 'DON-2026-002', drive: 'School Books Drive', milestone: 'Book Procurement', amount: 1000, date: '20 Mar 2026', ngo: 'Vidya Daan Trust', ngoAddress: '45, Linking Road, Mumbai, Maharashtra 400050', ngoPan: 'AABCV5678K', ngo80g: '80G/2023/VDT/MUM/0189', deduction: 100, payment: 'Debit Card', txnRef: '0x4a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b' },
  { id: 'DON-2025-003', drive: 'Clean Water Project', milestone: 'Well Digging', amount: 5000, date: '15 Jan 2026', ngo: 'Jal Seva Sangh', ngoAddress: '78, Civil Lines, Jaipur, Rajasthan 302001', ngoPan: 'AABCJ9012M', ngo80g: '80G/2023/JSS/JAI/0456', deduction: 50, payment: 'Net Banking', txnRef: '0x1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d' },
  { id: 'DON-2025-004', drive: 'Rural Healthcare', milestone: 'Medical Camp Phase 1', amount: 4000, date: '5 Dec 2025', ngo: 'Swasthya Foundation', ngoAddress: '23, Station Road, Pune, Maharashtra 411001', ngoPan: 'AABCS3456P', ngo80g: '80G/2024/SF/PUN/0078', deduction: 50, payment: 'UPI', txnRef: '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f' },
];

const WHATSAPP_NUMBER = '8262001975';

export const DonorDashboard: React.FC<Props> = ({ onBack, lang, dark, setDark, setLang, user }) => {
  const { drives, loading, donate } = useDonorDashboard();
  const [tab, setTab] = useState<'browse' | 'explorer' | 'profile' | 'leaderboard'>('browse');
  const [selectedDrive, setSelectedDrive] = useState<any | null>(null);
  const [fundingDrive, setFundingDrive] = useState<any | null>(null);
  const [fundingMs, setFundingMs] = useState<any | null>(null);
  const [ratingModal, setRatingModal] = useState<any | null>(null);
  const [certificateModal, setCertificateModal] = useState<any | null>(null);
  const [completedDonation, setCompletedDonation] = useState<any | null>(null);
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [locationFilter, setLocationFilter] = useState({ state: 'All', city: 'All' });
  const [pastDonationsState, setPastDonationsState] = useState(PAST_DONATIONS);
  const [reviews, setReviews] = useState<any[]>([
    { id: 1, ngo_id: 'any', donor: 'Rohan M.', rating: 5, comment: 'Excellent transparency! Love how every milestone is verified.', date: '2 days ago' },
    { id: 2, ngo_id: 'any', donor: 'Sanya G.', rating: 4, comment: 'Very reliable NGO. Keep up the good work.', date: '1 week ago' },
  ]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePaymentSuccess = async (amount: number, donorName: string, txHash: string, alreadyRecorded: boolean = false) => {
    if (!fundingDrive) return;

    await donate(fundingDrive.id, amount, donorName, txHash, fundingMs?.id, fundingMs?.title, alreadyRecorded);

    // Add to past donations
    const newDon = {
      id: `DON-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      drive: fundingDrive.title,
      milestone: fundingMs?.title || 'General Milestone Allocation',
      amount: amount,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      ngo: 'Trustchain Verified NGO',
      ngoAddress: fundingDrive.location || 'India',
      ngoPan: 'AABCI1234F',
      ngo80g: '80G/2025/TC/IND/0981',
      deduction: 50,
      payment: 'UPI / Digital Payment',
      txnRef: txHash
    };
    setPastDonationsState([newDon, ...pastDonationsState]);

    setCompletedDonation(newDon);
    setCertificateModal(newDon);
    setFundingDrive(null);
    setFundingMs(null);
    showToast(t(lang, 'thanksDonation'));
  };

  const submitReview = () => {
    if (stars === 0) { showToast('Please select a star rating.', 'error'); return; }
    const newRev = {
      id: Date.now(),
      ngo_id: ratingModal?.ngo_id || 'any',
      donor: user?.name || 'Anonymous',
      rating: stars,
      comment: review,
      date: 'Just now'
    };
    setReviews([newRev, ...reviews]);
    setRatingModal(null);
    setStars(0);
    setReview('');
    showToast(t(lang, 'limitUpdated'));
  };

  const handleDownload80G = (don: typeof PAST_DONATIONS[0]) => {
    const doc = generate80GReceipt({
      donorName: user?.name || 'Jane Doe', donorEmail: user?.email || 'jane@example.com', donorPan: 'ABCPD1234K',
      donationId: don.id, donationDate: don.date, donationAmount: don.amount,
      paymentMethod: don.payment, transactionRef: don.txnRef,
      driveName: don.drive, milestoneFunded: don.milestone,
      ngoName: don.ngo, ngoAddress: don.ngoAddress, ngoPan: don.ngoPan,
      ngo80gNumber: don.ngo80g, deductionPercent: don.deduction,
    });
    doc.save(`TrustChain_80G_Receipt_${don.id}.pdf`);
  };

  const handleDownloadFYReport = () => {
    const allData = pastDonationsState.map(d => ({
      donorName: user?.name || 'Jane Doe', donorEmail: user?.email || 'jane@example.com', donorPan: 'ABCPD1234K',
      donationId: d.id, donationDate: d.date, donationAmount: d.amount,
      paymentMethod: d.payment, transactionRef: d.txnRef,
      driveName: d.drive, milestoneFunded: d.milestone,
      ngoName: d.ngo, ngoAddress: d.ngoAddress, ngoPan: d.ngoPan,
      ngo80gNumber: d.ngo80g, deductionPercent: d.deduction,
    }));
    const doc = generateFYReport(allData);
    doc.save(`TrustChain_FY_Tax_Report_${new Date().getFullYear()}.pdf`);
  };

  const filteredLB = LEADERBOARD.filter(u =>
    (locationFilter.state === 'All' || u.state === locationFilter.state) &&
    (locationFilter.city === 'All' || u.city === locationFilter.city)
  );

  const totalEligible = pastDonationsState.reduce((s, d) => s + d.amount, 0);
  const totalDeduction = pastDonationsState.reduce((s, d) => s + Math.round(d.amount * d.deduction / 100), 0);

  return (
    <div>
      <nav className="topnav">
        <div className="topnav-logo" onClick={onBack}>Trust<span>Chain</span></div>
        <div className="tabs">
          <button className={`tab ${tab === 'browse' ? 'active' : ''}`} onClick={() => { setTab('browse'); setSelectedDrive(null); }}>{t(lang, 'browseDrives')}</button>
          <button className={`tab ${tab === 'explorer' ? 'active' : ''}`} onClick={() => { setTab('explorer'); setSelectedDrive(null); }}>{t(lang, 'transparencyLedger')}</button>
          <button className={`tab ${tab === 'leaderboard' ? 'active' : ''}`} onClick={() => setTab('leaderboard')}>{t(lang, 'rankings')}</button>
          <button className={`tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>{t(lang, 'myProfile')}</button>
        </div>
        <div className="row gap-8">
          <select className="lang-select" value={lang} onChange={e => setLang(e.target.value as LangCode)} title={t(lang, 'language')}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.native}</option>)}
          </select>
          <button className="theme-toggle" onClick={() => setDark(!dark)} title={dark ? 'Light' : 'Dark'}>{dark ? '☀️' : '🌙'}</button>
          <span className="live-dot" />
          <span className="text-sm text-muted">{user?.name || t(lang, 'donor')} — {t(lang, 'live')}</span>
        </div>
      </nav>

      <div className="page">
        {/* ── TRANSPARENCY LEDGER TAB ── */}
        {tab === 'explorer' && (
          <TransparencyExplorer onBack={() => setTab('browse')} lang={lang} />
        )}

        {/* ── BROWSE TAB ── */}
        {tab === 'browse' && !selectedDrive && (
          <div className="slide-up">
            <div className="text-center mb-32">
              <p style={{ fontSize: 16, color: 'var(--text-3)', maxWidth: 640, margin: '0 auto' }}>
                {t(lang, 'donorMissionSubhead')}
              </p>
            </div>

            <div className="section-head">
              <h3>{t(lang, 'activeCampaigns')}</h3>
              <span className="text-sm text-muted">{drives.length} {t(lang, 'drivesOpen')}</span>
            </div>

            {loading && <div className="empty"><div className="pulse">{t(lang, 'loadingDrives')}</div></div>}

            <div className="drive-card-grid">
              {drives.map((d, i) => {
                const pct = d.target_amount > 0 ? Math.min(100, Math.round((d.raised_amount / d.target_amount) * 100)) : 0;
                const images = [
                  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600',
                  'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=600',
                  'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=600',
                  'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?q=80&w=600'
                ];
                const coverImg = images[i % images.length];

                return (
                  <div key={d.id} className="drive-card card-hover" onClick={() => setSelectedDrive(d)}>
                    <div style={{ position: 'relative' }}>
                      <img src={coverImg} className="drive-img" alt={d.title} />
                      <div className="tax-badge">{t(lang, 'taxExemptionBadge')}</div>
                    </div>

                    <div className="drive-content">
                      <div className="row-sb mb-4">
                        <span className="badge badge-blue">{td(lang, d.category || 'General')}</span>
                        <span className={`badge ${d.urgency_level === 'Critical' ? 'badge-red' : 'badge-orange'}`}>
                          {td(lang, d.urgency_level || 'Active')}
                        </span>
                      </div>
                      <div className="drive-title">{td(lang, d.title)}</div>
                      <p className="text-sm text-3 mb-16" style={{ minHeight: 40, overflow: 'hidden' }}>
                        {d.problem_statement || d.description || 'Support this verified cause and track milestone disbursements transparently.'}
                      </p>
                      {d.target_amount > 0 && d.raised_amount >= d.target_amount ? (
                        <div
                          className="badge badge-green"
                          style={{ width: '100%', padding: '8px 12px', textAlign: 'center', fontWeight: 700, justifyContent: 'center' }}
                        >
                          ✓ 100% {t(lang, 'goal')} Achieved
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm btn-full"
                          style={{ fontWeight: 700 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFundingDrive(d);
                            setFundingMs(d.milestones?.[0] || null);
                          }}
                        >
                          {t(lang, 'donateViaUpi')}
                        </button>
                      )}
                    </div>

                    <div className="drive-card-footer">
                      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '4px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                        {pct}%
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="row gap-4 mb-2">
                          <span className="text-bold" style={{ color: 'var(--text)' }}>₹{d.raised_amount.toLocaleString('en-IN')}</span>
                          <span className="text-xs text-muted" style={{ position: 'relative', top: 1 }}>{t(lang, 'raisedOf')} ₹{d.target_amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="row gap-4">
                          <span style={{ fontSize: 13 }}>👥</span>
                          <span className="text-xs text-muted"><span className="text-bold">{(d.milestones || []).length}</span> {t(lang, 'milestonesAttached')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── DRIVE DETAIL + TRANSPARENCY VIEW ── */}
        {tab === 'browse' && selectedDrive && (() => {
          const activeDrive = drives.find(d => d.id === selectedDrive.id) || selectedDrive;
          const isDriveCompleted = activeDrive.target_amount > 0 && activeDrive.raised_amount >= activeDrive.target_amount;
          const completionPct = activeDrive.target_amount > 0 ? Math.min(100, Math.round((activeDrive.raised_amount / activeDrive.target_amount) * 100)) : 0;

          return (
            <div className="slide-up">
              <button className="back-btn" onClick={() => setSelectedDrive(null)}>← {t(lang, 'browseDrives')}</button>
              <div className="row-sb mb-24">
                <div>
                  <div className="row gap-8 mb-4">
                    <span className="badge badge-green">{t(lang, 'verifiedNgo')}</span>
                    <span className="badge badge-blue">{td(lang, activeDrive.category)}</span>
                    {isDriveCompleted ? (
                      <span className="badge badge-green">✓ 100% {t(lang, 'goal')} Achieved</span>
                    ) : (
                      <span className="badge badge-orange">{completionPct}% Funded</span>
                    )}
                  </div>
                  <h2 style={{ fontSize: 26 }}>{td(lang, activeDrive.title)}</h2>
                  <div className="drive-meta">📍 {activeDrive.location || 'India'} &nbsp;·&nbsp; 👥 {activeDrive.beneficiaries_count || 500} {t(lang, 'beneficiaries')}</div>
                  <div className="row mt-4 gap-4" style={{ color: '#facc15' }}>
                    {'★'.repeat(4)}{'☆'.repeat(1)} <span style={{ color: 'var(--text-3)', fontSize: 13 }}>(4.6/5 · {reviews.length} {t(lang, 'reviews')})</span>
                  </div>
                </div>
                {!isDriveCompleted ? (
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => {
                      setFundingDrive(activeDrive);
                      setFundingMs(activeDrive.milestones?.[0] || null);
                    }}
                  >
                    {t(lang, 'donateNowUpi')}
                  </button>
                ) : (
                  <div className="badge badge-green" style={{ padding: '10px 16px', fontSize: 14 }}>
                    🎉 {t(lang, 'goal')} Achieved
                  </div>
                )}
              </div>

              <div className="grid-3 mb-24">
                <div className="stat-card"><div className="stat-label">{t(lang, 'amountRaised')}</div><div className="stat-value blue" style={{ fontSize: 22 }}>₹{activeDrive.raised_amount.toLocaleString('en-IN')}</div></div>
                <div className="stat-card"><div className="stat-label">{t(lang, 'goal')}</div><div className="stat-value" style={{ fontSize: 22 }}>₹{activeDrive.target_amount.toLocaleString('en-IN')}</div></div>
                <div className="stat-card"><div className="stat-label">{t(lang, 'completion')}</div><div className="stat-value green" style={{ fontSize: 22 }}>{completionPct}%</div></div>
              </div>

              {activeDrive.problem_statement && (
                <div className="card mb-24" style={{ background: 'var(--primary-lt)', border: '1px solid var(--primary)' }}>
                  <div className="text-sm text-bold mb-4" style={{ color: 'var(--primary)' }}>{t(lang, 'problemStatement')}</div>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-2)' }}>{activeDrive.problem_statement}</p>
                </div>
              )}

              <div className="card">
                <h3 className="mb-16">🎯 {t(lang, 'milestonesTransparency')}</h3>
                {(activeDrive.milestones || []).map((m: any, i: number) => (
                  <div key={m.id} style={{ paddingBottom: 20, marginBottom: 20, borderBottom: '1px solid var(--border-lt)' }}>
                    <div className="row-sb mb-12">
                      <div className="row gap-12">
                        <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: m.status === 'approved' ? 'var(--green-lt)' : 'var(--border-lt)', color: m.status === 'approved' ? 'var(--green)' : 'var(--text-3)', flexShrink: 0 }}>
                          {m.status === 'approved' ? '✓' : i + 1}
                        </div>
                        <div>
                          <div className="text-bold">{td(lang, m.title)}</div>
                          <div className="text-sm text-muted">{m.target_date ? new Date(m.target_date).toLocaleDateString('en-IN') : t(lang, 'escrowStage')}</div>
                        </div>
                      </div>
                      <div className="row gap-16">
                        <span style={{ fontWeight: 700, fontSize: 15 }}>₹{m.target_amount.toLocaleString('en-IN')}</span>
                        <span className={`badge ${m.status === 'approved' ? 'badge-green' : m.status === 'rejected' ? 'badge-red' : 'badge-orange'}`}>
                          {m.status === 'approved' ? t(lang, 'verifiedOnContract') : td(lang, m.status)}
                        </span>
                        {!isDriveCompleted && m.status !== 'approved' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setFundingDrive(activeDrive);
                              setFundingMs(m);
                            }}
                          >
                            {t(lang, 'fundMilestone')}
                          </button>
                        )}
                      </div>
                    </div>
                    {m.status === 'approved' && (
                      <div style={{ background: 'var(--green-lt)', padding: '12px 16px', borderRadius: 8, fontSize: 12, color: 'var(--green)' }}>
                        {t(lang, 'proofVerifiedAdmin')}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* NGO Reviews Section */}
              <div className="card mt-24">
                <div className="section-head"><h3>{t(lang, 'reviews')}</h3></div>
                <div className="col gap-12">
                  {reviews.length === 0 ? (
                    <div className="empty text-muted">{t(lang, 'noReviews')}</div>
                  ) : (
                    reviews.map(r => (
                      <div key={r.id} className="review-card" style={{ borderBottom: '1px solid var(--border-lt)', paddingBottom: 16 }}>
                        <div className="row-sb mb-8">
                          <span className="text-bold">{r.donor}</span>
                          <span className="text-muted text-xs">{r.date}</span>
                        </div>
                        <div className="mb-8" style={{ color: '#facc15' }}>
                          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                        </div>
                        <p className="text-sm text-2" style={{ lineHeight: 1.6 }}>{r.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── LEADERBOARD ── */}
        {tab === 'leaderboard' && (
          <div className="slide-up">
            <h3 className="mb-4">{t(lang, 'donorRankings')}</h3>
            <p className="text-muted mb-24">{t(lang, 'rankingsDesc')}</p>
            <div className="row mb-24 gap-12">
              <select className="form-group" style={{ width: 180 }} value={locationFilter.state} onChange={e => setLocationFilter(p => ({ ...p, state: e.target.value, city: 'All' }))}>
                <option value="All">{t(lang, 'allStates')}</option>
                <option>Maharashtra</option><option>Gujarat</option><option>Telangana</option><option>Rajasthan</option><option>Tamil Nadu</option>
              </select>
              <select className="form-group" style={{ width: 180 }} value={locationFilter.city} onChange={e => setLocationFilter(p => ({ ...p, city: e.target.value }))}>
                <option value="All">{t(lang, 'allCities')}</option>
                <option>Mumbai</option><option>Nagpur</option><option>Pune</option><option>Surat</option><option>Hyderabad</option><option>Jaipur</option><option>Chennai</option>
              </select>
            </div>
            <div className="card table-wrap">
              <table>
                <thead><tr><th>#</th><th>{t(lang, 'donor')}</th><th>{t(lang, 'location')}</th><th className="text-right">{t(lang, 'totalImpact')}</th></tr></thead>
                <tbody>
                  {filteredLB.map(u => (
                    <tr key={u.rank} style={{ background: (u as any).isMe ? 'var(--primary-lt)' : '' }}>
                      <td><span style={{ fontWeight: 700, fontSize: 15 }}>{u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : u.rank === 3 ? '🥉' : `#${u.rank}`}</span></td>
                      <td><span className="text-bold">{u.name}</span>{(u as any).isMe && <span className="badge badge-blue" style={{ marginLeft: 8 }}>{t(lang, 'youBadge')}</span>}</td>
                      <td className="text-muted text-sm">{u.city}, {u.state}</td>
                      <td className="text-right text-bold" style={{ color: 'var(--green)' }}>₹{u.total.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PROFILE + TAX SECTION ── */}
        {tab === 'profile' && (
          <div className="slide-up" style={{ maxWidth: 740, margin: '0 auto' }}>
            <div className="card mb-16" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>👤</div>
              <h2 style={{ fontSize: 22, marginBottom: 4 }}>{user?.name || 'Jane Doe'}</h2>
              <p className="text-muted mb-16">{user?.email || 'jane@example.com'} &nbsp;·&nbsp; Mumbai, Maharashtra</p>
              <div className="row" style={{ justifyContent: 'center', gap: 8 }}>
                <span className="badge badge-green">{t(lang, 'verifiedDonor')}</span>
                <span className="badge badge-blue">{t(lang, 'silverImpact')}</span>
              </div>
            </div>

            <div className="grid-2 mb-16">
              <div className="stat-card"><div className="stat-label">{t(lang, 'myGlobalRank')}</div><div className="stat-value blue">#1,248</div></div>
              <div className="stat-card"><div className="stat-label">{t(lang, 'lifetimeImpact')}</div><div className="stat-value green">₹{totalEligible.toLocaleString('en-IN')}</div></div>
              <div className="stat-card"><div className="stat-label">{t(lang, 'drivesFunded')}</div><div className="stat-value">{pastDonationsState.length}</div></div>
              <div className="stat-card"><div className="stat-label">{t(lang, 'verifiedTxHashes')}</div><div className="stat-value" style={{ fontSize: 18 }}>{t(lang, 'onChain100')}</div></div>
            </div>

            {/* Tax Savings Summary */}
            <div className="card mb-16" style={{ background: 'var(--green-lt)', border: '1px solid var(--green)' }}>
              <div className="row-sb mb-16">
                <div>
                  <h3 style={{ color: 'var(--green)', fontSize: 16 }}>🧾 {t(lang, 'taxSavingTitle')}</h3>
                  <p className="text-sm text-muted">{t(lang, 'taxSavingDesc')}</p>
                </div>
                <button className="btn btn-green btn-sm" onClick={handleDownloadFYReport}>
                  📥 {t(lang, 'downloadFYReport')}
                </button>
              </div>
              <div className="grid-3" style={{ gap: 12 }}>
                <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
                  <div className="stat-label">{t(lang, 'totalEligible')}</div>
                  <div className="stat-value green" style={{ fontSize: 20 }}>₹{totalEligible.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
                  <div className="stat-label">{t(lang, 'estimatedDeduction')}</div>
                  <div className="stat-value blue" style={{ fontSize: 20 }}>₹{totalDeduction.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
                  <div className="stat-label">{t(lang, 'eligibleDonations')}</div>
                  <div className="stat-value" style={{ fontSize: 20 }}>{pastDonationsState.length}</div>
                </div>
              </div>
            </div>

            {/* Certificates Table */}
            <div className="card">
              <div className="row-sb mb-16">
                <h3>{t(lang, 'donationCertificates')}</h3>
                <button className="btn btn-outline btn-sm" onClick={handleDownloadFYReport}>📥 {t(lang, 'downloadAllReceipts')}</button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t(lang, 'idProofHash')}</th>
                      <th>{t(lang, 'ngoDrive')}</th>
                      <th>{t(lang, 'amount')}</th>
                      <th>80G %</th>
                      <th>{t(lang, 'action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastDonationsState.map(d => (
                      <tr key={d.id}>
                        <td>
                          <div className="text-bold" style={{ fontSize: 12 }}>{d.id}</div>
                          <div className="text-sm text-muted">{d.date}</div>
                          <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--blue)' }}>{d.txnRef.substring(0, 14)}...</div>
                        </td>
                        <td>
                          <div className="text-bold" style={{ fontSize: 12 }}>{d.ngo}</div>
                          <div className="text-sm text-muted">{td(lang, d.drive)}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-4)' }}>PAN: {d.ngoPan} · 80G: {d.ngo80g}</div>
                        </td>
                        <td className="text-bold" style={{ color: 'var(--green)' }}>₹{d.amount.toLocaleString('en-IN')}</td>
                        <td>
                          <span className="badge badge-blue">{d.deduction}%</span>
                          <div className="text-sm text-muted" style={{ marginTop: 4 }}>
                            {t(lang, 'saveAmount')} ₹{Math.round(d.amount * d.deduction / 100).toLocaleString('en-IN')}
                          </div>
                        </td>
                        <td>
                          <button className="btn btn-green btn-sm" onClick={() => handleDownload80G(d)}>
                            📄 {t(lang, 'downloadPdf')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Seamless Web2 Payment Modal */}
      {fundingDrive && (
        <PaymentModal
          drive={fundingDrive}
          milestone={fundingMs}
          lang={lang}
          onClose={() => {
            setFundingDrive(null);
            setFundingMs(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* WhatsApp Button */}
      <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t(lang, 'whatsappMessage'))}`} target="_blank" rel="noreferrer" className="whatsapp-btn" title={t(lang, 'connectWhatsApp')}>
        <img src="/whatsapp.png" alt="WhatsApp" />
      </a>

      {/* Automatic 80G Certificate & Financial Year (FYG) Report Page Modal */}
      {certificateModal && (
        <div className="modal-overlay">
          <div
            className="modal slide-up"
            style={{
              maxWidth: 580,
              textAlign: 'center',
              padding: '32px 28px',
              borderRadius: 24,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <div
              style={{
                display: 'inline-block',
                background: '#dcfce7',
                color: '#15803d',
                fontSize: 12,
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: 20,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: 10,
              }}
            >
              {t(lang, 'paymentDoneEscrow')}
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: '0 0 6px' }}>
              {t(lang, 'donationCompleted')}
            </h2>
            <p className="text-muted" style={{ fontSize: 14, margin: '0 0 20px' }}>
              {t(lang, 'donationSuccessDesc')} (<strong style={{ color: 'var(--green)' }}>₹{certificateModal.amount.toLocaleString('en-IN')}</strong> - {td(lang, certificateModal.drive)})
            </p>

            {/* Receipt Summary Card */}
            <div
              style={{
                background: 'var(--surface-2, #f8fafc)',
                border: '1px solid var(--border, #e2e8f0)',
                borderRadius: 16,
                padding: 18,
                textAlign: 'left',
                marginBottom: 20,
                fontSize: 13,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="text-muted">{t(lang, 'certReceiptId')}</span>
                <strong style={{ fontFamily: 'monospace', color: 'var(--blue)' }}>{certificateModal.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="text-muted">{t(lang, 'donorNameLabel')}</span>
                <strong style={{ color: 'var(--text)' }}>{user?.name || 'Jane Doe'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="text-muted">{t(lang, 'adminEscrowLabel')}</span>
                <strong style={{ color: 'var(--text)' }}>Ayush Sahu (ayushsahu882004@oksbi)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="text-muted">{t(lang, 'sec80gExemption')}</span>
                <span className="badge badge-green">{t(lang, 'deductionEligible')}</span>
              </div>
              <div>
                <span className="text-muted" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
                  {t(lang, 'ledgerTxProof')}
                </span>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 11,
                    background: '#0f172a',
                    color: '#38bdf8',
                    padding: '8px 12px',
                    borderRadius: 8,
                    wordBreak: 'break-all',
                  }}
                >
                  {certificateModal.txnRef}
                </div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="col gap-10">
              <button
                className="btn btn-green btn-lg btn-full"
                style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onClick={() => handleDownload80G(certificateModal)}
              >
                <span>📄</span> {t(lang, 'downloadOfficial80G')}
              </button>

              <button
                className="btn btn-outline btn-lg btn-full"
                style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onClick={handleDownloadFYReport}
              >
                <span>📊</span> {t(lang, 'downloadFYReport')} (FY {new Date().getFullYear()})
              </button>

              <button
                className="btn btn-primary btn-sm btn-full mt-4"
                onClick={() => {
                  setCertificateModal(null);
                  if (completedDonation) {
                    setRatingModal(completedDonation);
                  }
                }}
              >
                {t(lang, 'continueBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal && (
        <div className="modal-overlay">
          <div className="modal slide-up" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💖</div>
            <h2 className="mb-8">{t(lang, 'thanksDonation')}</h2>
            <p className="text-muted mb-24">{t(lang, 'rateNgo')}: <strong>{td(lang, ratingModal.title || ratingModal.drive)}</strong></p>

            <div className="col gap-16">
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, fontSize: 32, cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <span key={n} onClick={() => setStars(n)} style={{ color: n <= stars ? '#facc15' : '#e2e8f0' }}>{n <= stars ? '★' : '☆'}</span>
                ))}
              </div>
              <div className="form-group">
                <textarea
                  value={review}
                  onChange={e => setReview(e.target.value)}
                  placeholder={t(lang, 'writeReview')}
                  style={{ minHeight: 80, padding: 12 }}
                />
              </div>
            </div>

            <div className="row mt-24 gap-12">
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={submitReview}>{t(lang, 'submitReview')}</button>
              <button className="btn btn-outline btn-lg" onClick={() => setRatingModal(null)}>{t(lang, 'cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
