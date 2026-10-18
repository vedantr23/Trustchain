import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

export interface Drive {
  id: string;
  title: string;
  problem_statement?: string;
  description?: string;
  category?: string;
  location?: string;
  target_amount: number;
  raised_amount: number;
  start_date?: string;
  end_date?: string;
  beneficiaries_count?: number;
  urgency_level?: string;
  ngo_id: string | null;
  payout_upi_id?: string;
  blockchain_id?: number;
  created_at: string;
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  drive_id: string;
  title: string;
  description?: string;
  target_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  target_date?: string;
  requires_gps?: boolean;
  requires_photo?: boolean;
  requires_video?: boolean;
  requires_invoice?: boolean;
  gps_required?: boolean;
  photo_required?: boolean;
  video_required?: boolean;
  invoice_required?: boolean;
  expected_beneficiaries?: number;
  created_at: string;
}

export const useDrives = () => {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
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
        .channel('drives-global')
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

  return { drives, loading, error, refetch: fetchDrives, setDrives };
};
