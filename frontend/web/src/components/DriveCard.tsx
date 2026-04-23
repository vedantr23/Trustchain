import React, { useState } from 'react';
import type { Drive } from '../hooks/useDrives';

interface DriveCardProps {
  drive: Drive;
  onDonate: (driveId: string, amount: number, name: string) => Promise<void>;
  donating: string | null;
}

export const DriveCard: React.FC<DriveCardProps> = ({ drive, onDonate, donating }) => {
  const [showDonate, setShowDonate] = useState(false);
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');

  const pct = drive.target_amount > 0
    ? Math.min(100, Math.round((drive.raised_amount / drive.target_amount) * 100))
    : 0;

  const approvedMilestones = (drive.milestones || []).filter(m => m.status === 'approved').length;
  const totalMilestones = (drive.milestones || []).length;

  const handleDonate = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0 || !donorName.trim()) return;
    await onDonate(drive.id, amt, donorName);
    setAmount('');
    setDonorName('');
    setShowDonate(false);
  };

  return (
    <div className="drive-card glass-panel">
      <div className="drive-card-header">
        <div>
          <h3 className="drive-title">{drive.title}</h3>
          <div className="drive-meta">
            <span className="milestone-badge">
              ✅ {approvedMilestones}/{totalMilestones} milestones verified
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a
            href="https://wa.me/918262001975"
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-icon-inline"
            title="Contact NGO via WhatsApp"
          >
            <img src="/whatsapp.png" alt="WhatsApp" />
          </a>
          <div className="drive-pct-ring">
            <span>{pct}%</span>
          </div>
        </div>
      </div>

      <div className="progress-wrap">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-labels">
          <span className="raised">${drive.raised_amount.toLocaleString()} raised</span>
          <span className="target">of ${drive.target_amount.toLocaleString()}</span>
        </div>
      </div>

      {totalMilestones > 0 && (
        <div className="milestones-list">
          {(drive.milestones || []).map(m => (
            <div key={m.id} className={`milestone-chip ${m.status}`}>
              <span className="chip-dot" />
              <span>{m.title}</span>
              <span className="chip-status">{m.status}</span>
            </div>
          ))}
        </div>
      )}

      {!showDonate ? (
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setShowDonate(true)}>
          Donate Now
        </button>
      ) : (
        <div className="donate-form fade-in">
          <input
            type="text"
            placeholder="Your name"
            value={donorName}
            onChange={e => setDonorName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount ($)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              className="btn-primary"
              onClick={handleDonate}
              disabled={donating === drive.id}
              style={{ flex: 1 }}
            >
              {donating === drive.id ? 'Processing...' : 'Confirm Donation'}
            </button>
            <button
              className="btn-ghost"
              onClick={() => setShowDonate(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
