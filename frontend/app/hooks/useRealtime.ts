import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export const useRealtime = () => {
  const [drives, setDrives] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);

  useEffect(() => {
    // Utilizing exactly the same real-time behavior inside React Native
    const drivesChannel = supabase
      .channel('public:drives')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drives' }, payload => {
        console.log('Realtime Drives Change (App) received!', payload);
      })
      .subscribe();

    const milestonesChannel = supabase
      .channel('public:milestones')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones' }, payload => {
        console.log('Realtime Milestones Change (App) received!', payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(drivesChannel);
      supabase.removeChannel(milestonesChannel);
    };
  }, []);

  return { drives, setDrives, milestones, setMilestones };
};
