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
  expected_beneficiaries?: number;
  created_at: string;
}

export const useDrives = () => {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrives = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('drives')
      .select('*, milestones(*)')
      .order('created_at', { ascending: false });

    if (fetchError) { setError(fetchError.message); setLoading(false); return; }
    setDrives((data as Drive[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDrives();

    const channel = supabase
      .channel('drives-global')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drives' }, () => fetchDrives())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones' }, () => fetchDrives())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchDrives]);

  return { drives, loading, error, refetch: fetchDrives };
};
