/**
 * Data Access Layer – Milestones
 */
import { supabase } from '../config/supabase.js';

export async function getMilestonesByDrive(driveId) {
  const { data, error } = await supabase
    .from('milestones')
    .select('*, proofs(*)')
    .eq('drive_id', driveId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getMilestoneById(id) {
  const { data, error } = await supabase
    .from('milestones')
    .select('*, proofs(*), drives(id, title, ngo_id)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createMilestone(payload) {
  const { data, error } = await supabase
    .from('milestones')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMilestoneStatus(id, status) {
  const { data, error } = await supabase
    .from('milestones')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Return all milestones with status = 'pending' or 'under_review' for admin queue */
export async function getPendingMilestones() {
  const { data, error } = await supabase
    .from('milestones')
    .select('*, proofs(*), drives(id, title)')
    .in('status', ['pending'])
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}
