import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import type { Drive, Milestone } from './useDrives';

interface Donation {
  id: string;
  drive_id: string;
  amount: number;
  donor_name: string;
  created_at: string;
}

export const useDonorDashboard = () => {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDrives = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('drives')
      .select('*, milestones(*)')
      .order('created_at', { ascending: false });

    if (fetchError) { setError(fetchError.message); return; }
    setDrives((data as Drive[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDrives();

    // Real-time listener: refresh whenever drives or milestones change
    const channel = supabase
      .channel('donor-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drives' }, () => fetchDrives())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones' }, () => fetchDrives())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchDrives]);

  const donate = async (driveId: string, amount: number, donorName: string) => {
    setDonating(driveId);
    try {
      // Increment raised_amount on the drive
      const drive = drives.find(d => d.id === driveId);
      if (!drive) throw new Error('Drive not found');
      const newAmount = (drive.raised_amount || 0) + amount;

      const { error: updateError } = await supabase
        .from('drives')
        .update({ raised_amount: newAmount })
        .eq('id', driveId);

      if (updateError) throw updateError;

      // Optimistic update immediately so UI feels instant
      setDrives(prev =>
        prev.map(d => d.id === driveId ? { ...d, raised_amount: newAmount } : d)
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDonating(null);
    }
  };

  return { drives, loading, error, donate, donating };
};
