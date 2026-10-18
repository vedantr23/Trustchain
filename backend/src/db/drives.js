/**
 * Data Access Layer – Drives
 */
import { supabase } from '../config/supabase.js';

export async function getAllDrives({ status } = {}) {
  let query = supabase
    .from('drives')
    .select(`
      *,
      milestones ( id, title, status, target_amount )
    `)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getDriveById(id) {
  const { data, error } = await supabase
    .from('drives')
    .select(`
      *,
      milestones ( *, proofs ( * ) )
    `)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createDrive(payload) {
  const { data, error } = await supabase
    .from('drives')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDrive(id, patch) {
  const { data, error } = await supabase
    .from('drives')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
