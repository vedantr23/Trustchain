/**
 * Trustchain Real-Time Demo Sync Service
 * Ensures live synchronized data across NGO, Donor, and Admin views
 * even when running locally without a cloud Supabase database.
 */

export interface MockProof {
  id: string;
  milestone_id: string;
  proof_type: 'image' | 'pdf' | 'gps';
  proof_url: string;
  ipfsHash?: string;
  fileName?: string;
  gps_location?: string;
  created_at: string;
  localPreview?: string;
}

export interface MockMilestone {
  id: string;
  drive_id: string;
  title: string;
  target_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  drives?: { title: string };
  proofs?: MockProof[];
}

export interface MockAuditLog {
  id: string;
  milestone_id?: string;
  action: string;
  admin_id: string;
  notes: string;
  timestamp: string;
}

export interface MockDonation {
  id: string;
  txHash: string;
  campaignTitle: string;
  donorName: string;
  amount: number;
  timestamp: string;
  milestoneTitle: string;
  ipfsProofHash?: string;
  status: 'confirmed' | 'released' | 'verified';
}

const inMemoryMediaMap = new Map<string, string>();

const DEFAULT_PROOFS: MockProof[] = [];

const DEFAULT_AUDIT_LOGS: MockAuditLog[] = [];

const DEFAULT_DONATIONS: MockDonation[] = [];

export class RealtimeService {
  static getProofs(): MockProof[] {
    try {
      const saved = localStorage.getItem('trustchain_proofs');
      const parsed: MockProof[] = saved ? JSON.parse(saved) : DEFAULT_PROOFS;
      return parsed.map(p => {
        const preview = inMemoryMediaMap.get(p.id);
        return {
          ...p,
          localPreview: preview,
          proof_url: preview || p.proof_url,
        };
      });
    } catch (e) {
      return DEFAULT_PROOFS;
    }
  }

  static addProof(proof: MockProof) {
    const preview = proof.localPreview || (proof.proof_url?.startsWith('data:') ? proof.proof_url : '');
    if (preview) {
      inMemoryMediaMap.set(proof.id, preview);
    }

    const storageCopy: MockProof = {
      ...proof,
      localPreview: undefined,
      proof_url: proof.ipfsHash
        ? `https://gateway.pinata.cloud/ipfs/${proof.ipfsHash}`
        : (proof.proof_url?.startsWith('data:') ? proof.proof_url.slice(0, 80) : proof.proof_url),
    };

    try {
      const current = this.getProofs();
      const updated = [storageCopy, ...current];
      localStorage.setItem('trustchain_proofs', JSON.stringify(updated.slice(0, 30)));
    } catch (e) {
      console.warn("Storage quota exceeded, keeping in memory:", e);
    }
    this.broadcast();
  }

  static getAuditLogs(): MockAuditLog[] {
    try {
      const saved = localStorage.getItem('trustchain_audit_logs');
      return saved ? JSON.parse(saved) : DEFAULT_AUDIT_LOGS;
    } catch (e) {
      return DEFAULT_AUDIT_LOGS;
    }
  }

  static addAuditLog(log: MockAuditLog) {
    try {
      const logs = this.getAuditLogs();
      const updated = [log, ...logs];
      localStorage.setItem('trustchain_audit_logs', JSON.stringify(updated.slice(0, 50)));
    } catch (e) {
      console.warn("Storage quota log fallback:", e);
    }
    this.broadcast();
  }

  static getDonations(): MockDonation[] {
    try {
      const saved = localStorage.getItem('trustchain_donations');
      return saved ? JSON.parse(saved) : DEFAULT_DONATIONS;
    } catch (e) {
      return DEFAULT_DONATIONS;
    }
  }

  static addDonation(don: MockDonation) {
    try {
      const current = this.getDonations();
      const updated = [don, ...current];
      localStorage.setItem('trustchain_donations', JSON.stringify(updated.slice(0, 50)));
    } catch (e) {
      console.warn("Storage quota donation fallback:", e);
    }
    this.broadcast();
  }

  static broadcast() {
    window.dispatchEvent(new CustomEvent('trustchain-sync'));
  }
}
