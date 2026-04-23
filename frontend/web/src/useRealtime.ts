import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export const useRealtime = () => {
  const [drives, setDrives] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);

  useEffect(() => {
    // Initial fetch could go here if managed externally, but for pure realtime syncing:
    const drivesChannel = supabase
      .channel('public:drives')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drives' }, payload => {
        console.log('Realtime Drives Change received!', payload);
        // logic for tracking updates happens in context or local state depending on usage
      })
      .subscribe();

    const milestonesChannel = supabase
      .channel('public:milestones')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones' }, payload => {
        console.log('Realtime Milestones Change received!', payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(drivesChannel);
      supabase.removeChannel(milestonesChannel);
    };
  }, []);

  return { drives, setDrives, milestones, setMilestones };
};
