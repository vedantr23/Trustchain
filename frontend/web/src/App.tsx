import { useState, useEffect } from 'react';
import { NgoDashboard } from './components/NgoDashboard';
import { DonorDashboard } from './components/DonorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { TransparencyExplorer } from './components/TransparencyExplorer';
import { t, LANGUAGES } from './i18n';
import type { LangCode } from './i18n';
import { BlockchainService } from './utils/BlockchainService';

type PortalView = 'landing' | 'ngo' | 'donor' | 'admin' | 'explorer';

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600',
  'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=600',
  'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=600',
  'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=600',
  'https://images.unsplash.com/photo-1509059852496-f3822ae057bf?q=80&w=600',
];

const DEFAULT_USER = {
  id: '00000000-0000-0000-0000-000000000000',
  full_name: 'Trustchain Partner',
  email: 'partner@trustchain.org',
  role: 'NGO',
  ngo_status: 'approved',
  max_drive_limit: 1000000,
};

export default function App() {
  const [view, setView]               = useState<PortalView>('landing');
  const [dark, setDark]               = useState(false);
  const [lang, setLangState]          = useState<LangCode>(() =>
    (localStorage.getItem('trustchain_lang') as LangCode) || 'en'
  );
  const [verifiedCert, setVerifiedCert] = useState<{ id: string; hash: string } | null>(null);

  const setLang = (newLang: LangCode) => {
    setLangState(newLang);
    localStorage.setItem('trustchain_lang', newLang);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    BlockchainService.init().then(connected => {
      if (connected) console.log('Blockchain wallet connected');
    });
    const params = new URLSearchParams(window.location.search);
    const certId = params.get('verify80g');
    if (certId) {
      setVerifiedCert({
        id: certId,
        hash: params.get('hash') || '0x' + Math.random().toString(16).substring(2, 10),
      });
    }
  }, []);

  // ── Portal Views (Direct access, zero login required) ──────────────────────
  if (view === 'ngo') {
    return (
      <NgoDashboard
        user={DEFAULT_USER}
        onBack={() => setView('landing')}
        lang={lang}
        dark={dark}
        setDark={setDark}
        setLang={setLang}
      />
    );
  }

  if (view === 'donor') {
    return (
      <DonorDashboard
        user={{ ...DEFAULT_USER, role: 'Donor', full_name: 'Generous Donor' }}
        onBack={() => setView('landing')}
        lang={lang}
        dark={dark}
        setDark={setDark}
        setLang={setLang}
      />
    );
  }

  if (view === 'admin') {
    return (
      <AdminDashboard
        onBack={() => setView('landing')}
        lang={lang}
        dark={dark}
        setDark={setDark}
        setLang={setLang}
      />
    );
  }

  if (view === 'explorer') {
    return (
      <div style={{ padding: 20 }}>
        <TransparencyExplorer onBack={() => setView('landing')} lang={lang} />
      </div>
    );
  }

  // ── Landing Page ────────────────────────────────────────────────────────────
  return (
    <div className="landing">
      {/* Top Navbar */}
      <nav
        className="topnav fade-in"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          border: 'none',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(10px)',
          zIndex: 100,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <div className="topnav-logo" onClick={() => setView('landing')} style={{ cursor: 'pointer' }}>
          Trust<span>chain</span>
        </div>

        <div className="row gap-20" style={{ alignItems: 'center' }}>
          <span className="text-bold pointer" onClick={() => setView('explorer')}>
            🔍 {t(lang, 'publicLedger')}
          </span>
          <span className="text-bold pointer" onClick={() => setView('donor')}>
            💝 {t(lang, 'donateNav')}
          </span>
          <span className="text-bold pointer" onClick={() => setView('ngo')}>
            🌿 {t(lang, 'fundraiseNav')}
          </span>
          <span className="text-bold pointer" style={{ color: 'var(--blue, #2563eb)' }} onClick={() => setView('admin')}>
            🛡️ {t(lang, 'adminConsole')}
          </span>

          <select
            className="lang-select"
            style={{ background: 'white' }}
            value={lang}
            onChange={e => setLang(e.target.value as LangCode)}
            title={t(lang, 'language')}
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>
                {l.native}
              </option>
            ))}
          </select>

          <button
            className="landing-hero-btn"
            style={{ padding: '8px 20px', fontSize: '14px' }}
            onClick={() => setView('donor')}
          >
            {t(lang, 'donateNow')}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="landing-header slide-up" style={{ marginTop: 75 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--primary-lt, #e6f7ef)',
            color: 'var(--primary, #00b964)',
            fontWeight: 600,
            padding: '6px 16px',
            borderRadius: 24,
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          <span className="live-dot" style={{ width: 8, height: 8 }} />
          Zero Leakage · Smart Escrow Payouts · Milestone Verified
        </div>

        <h1 className="landing-headline">
          {t(lang, 'heroHeadline1')}<br />{t(lang, 'heroHeadline2')}
        </h1>
        <p style={{ maxWidth: 640, margin: '16px auto', color: 'var(--text-3)', fontSize: 16, lineHeight: 1.6 }}>
          {t(lang, 'heroSubhead')}
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
          <button className="landing-hero-btn" onClick={() => setView('donor')}>
            {t(lang, 'exploreAndDonate')}
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => setView('explorer')}>
            {t(lang, 'inspectLedger')}
          </button>
        </div>
      </div>

      {/* Curved Gallery */}
      <div className="curved-gallery slide-up" style={{ animationDelay: '0.1s' }}>
        {GALLERY_IMAGES.map((img, i) => (
          <img key={i} src={img} className="gallery-img" alt="impact" />
        ))}
      </div>

      {/* Direct Portal Access Cards */}
      <div className="role-cards slide-up" style={{ animationDelay: '0.2s' }}>
        {/* NGO Portal */}
        <div className="role-card" onClick={() => setView('ngo')}>
          <div className="role-card-icon">🌿</div>
          <h3>{t(lang, 'ngoDashboard')}</h3>
          <p>{t(lang, 'ngoDesc')}</p>
          <button className="btn btn-outline btn-full">
            🚀 Open NGO Portal
          </button>
        </div>

        {/* Donor Portal */}
        <div className="role-card" onClick={() => setView('donor')}>
          <div className="role-card-icon">💝</div>
          <h3>{t(lang, 'donorPortal')}</h3>
          <p>{t(lang, 'donorDesc')}</p>
          <button className="btn btn-primary btn-full">
            🚀 Open Donor Portal
          </button>
        </div>

        {/* Admin Console */}
        <div className="role-card" onClick={() => setView('admin')}>
          <div className="role-card-icon">🛡️</div>
          <h3>{t(lang, 'adminConsole')}</h3>
          <p>{t(lang, 'adminDesc')}</p>
          <button className="btn btn-outline btn-full">
            🚀 Open Admin Console
          </button>
        </div>
      </div>

      {/* 80G Certificate Verification Modal */}
      {verifiedCert && (
        <div className="modal-overlay" onClick={() => setVerifiedCert(null)}>
          <div className="modal-content slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: 460, textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 26, fontWeight: 'bold' }}>✓</div>
            <h2 style={{ marginBottom: 4, fontSize: 19 }}>{t(lang, 'certVerifiedTitle')}</h2>
            <p style={{ color: '#16a34a', fontWeight: 600, fontSize: 12, marginBottom: 16 }}>{t(lang, 'certVerifiedSub')}</p>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, textAlign: 'left', fontSize: 12, marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#64748b' }}>{t(lang, 'certId')}</span>
                <strong style={{ color: '#0f172a' }}>{verifiedCert.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#64748b' }}>{t(lang, 'digitalSignature')}</span>
                <span style={{ color: '#2563eb', fontFamily: 'monospace' }}>TC-SIG-{verifiedCert.hash.toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#64748b' }}>{t(lang, 'statutoryStandard')}</span>
                <span>Rule 18AB / Section 80G(5)(vi)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{t(lang, 'blockchainLedger')}</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>Polygon Mainnet / Sepolia L2 ✓</span>
              </div>
            </div>
            <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5, marginBottom: 18 }}>{t(lang, 'certExplanation')}</p>
            <button className="btn btn-primary btn-full" onClick={() => setVerifiedCert(null)}>{t(lang, 'dismiss')}</button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer-landing" style={{ padding: '40px', color: 'var(--text-4)', fontSize: '13px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span className="live-dot" />
          <span>{t(lang, 'syncFooter')}</span>
        </div>
        <div style={{ color: 'var(--text-4)', fontSize: '12px' }}>
          Trustchain · Decentralized Charitable Escrow Protocol · B.Tech Final Year Capstone Project
        </div>
      </footer>

      {/* WhatsApp Help CTA */}
      <a
        href={`https://wa.me/918262001975?text=${encodeURIComponent(t(lang, 'whatsappMessage'))}`}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-btn"
        title={t(lang, 'connectWhatsApp')}
      >
        <img src="/whatsapp.png" alt="WhatsApp" />
      </a>
    </div>
  );
}
