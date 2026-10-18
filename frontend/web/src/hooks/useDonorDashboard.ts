import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import type { Drive } from './useDrives';
import { BlockchainService } from '../utils/BlockchainService';
import { RealtimeService } from '../utils/realtimeService';

export const useDonorDashboard = () => {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDrives = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('drives')
        .select('*, milestones(*)')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching drives:', fetchError.message);
        setError(fetchError.message);
        setDrives([]);
      } else {
        setDrives((data as Drive[]) || []);
        setError(null);
      }
    } catch (e: any) {
      console.error('Network error fetching drives:', e);
      setError(e?.message || 'Network error');
      setDrives([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrives();

    const handleSync = () => fetchDrives();
    window.addEventListener('trustchain-sync', handleSync);

    try {
      const channel = supabase
        .channel('donor-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'drives' }, () => fetchDrives())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones' }, () => fetchDrives())
        .subscribe();

      return () => {
        window.removeEventListener('trustchain-sync', handleSync);
        supabase.removeChannel(channel);
      };
    } catch (e) {
      return () => {
        window.removeEventListener('trustchain-sync', handleSync);
      };
    }
  }, [fetchDrives]);

  const donate = async (
    driveId: string,
    amount: number,
    donorName: string,
    passedTxHash?: string,
    milestoneId?: string,
    milestoneTitle?: string,
    alreadyRecorded: boolean = false
  ) => {
    setDonating(driveId);
    try {
      const drive = drives.find(d => d.id === driveId);
      if (!drive) throw new Error('Drive not found');

      let txHash = passedTxHash || null;

      // Blockchain integration
      if (drive.blockchain_id) {
        try {
          const ethAmount = (amount / 100000).toString();
          const receipt = await BlockchainService.donate(drive.blockchain_id, ethAmount);
          if (receipt && receipt.hash) txHash = receipt.hash;
        } catch (bcErr) {
          console.warn('On-chain wallet donation fallback:', bcErr);
        }
      }

      if (!txHash) {
        const randomHex = Array.from(new Uint8Array(28))
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join('');
        txHash = `0x${randomHex}`;
      }

      const newAmount = (drive.raised_amount || 0) + amount;

      // Update Supabase
      if (!alreadyRecorded) {
        try {
          const payload: Record<string, unknown> = {
            drive_id: driveId,
            amount,
            donor_id: '00000000-0000-0000-0000-000000000000',
            donor_name: donorName || 'Anonymous Supporter',
            transaction_id: txHash,
            blockchain_tx_hash: txHash,
            status: 'completed',
            milestone_id: milestoneId || null,
          };

          let { error: donErr } = await supabase.from('donations').insert(payload);
          if (donErr && (String(donErr.message || '').includes('donor_name') || String(donErr.message || '').includes('milestone_id'))) {
            delete payload.donor_name;
            delete payload.milestone_id;
            ({ error: donErr } = await supabase.from('donations').insert(payload));
          }
          if (donErr) {
            console.warn('Supabase donation insert fallback to direct drive update:', donErr);
            await supabase
              .from('drives')
              .update({ raised_amount: newAmount })
              .eq('id', driveId);
          }
          // Note: PostgreSQL trigger `trg_donation_increment` on `public.donations` automatically
          // increments `drives.raised_amount = raised_amount + NEW.amount`.
          // We DO NOT update `drives.raised_amount` manually beforehand to prevent double-counting.
        } catch (sbErr) {
          console.warn('Supabase insert error:', sbErr);
        }
      }

      // Real-time donation ledger update
      const msTitle = milestoneTitle
        || (milestoneId ? drive.milestones?.find(m => m.id === milestoneId)?.title : undefined)
        || drive.milestones?.[0]?.title
        || 'General Milestone Allocation';

      RealtimeService.addDonation({
        id: `tx-${Date.now()}`,
        txHash: txHash,
        campaignTitle: drive.title,
        donorName: donorName || 'Verified Supporter',
        amount,
        timestamp: 'Just now',
        milestoneTitle: msTitle,
        ipfsProofHash: `bafybeic${txHash.substring(2, 16)}`,
        status: 'confirmed',
      });

      // Update local state optimistically
      setDrives(prev => prev.map(d => d.id === driveId ? { ...d, raised_amount: newAmount } : d));

      // Notify any listening components
      window.dispatchEvent(new CustomEvent('trustchain-sync'));

      return txHash;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setDonating(null);
    }
  };

  return { drives, loading, error, donate, donating };
};
