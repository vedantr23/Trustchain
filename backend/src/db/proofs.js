/**
 * Data Access Layer – Proofs (IPFS evidence)
 */
import { supabase } from '../config/supabase.js';

export async function addProof(payload) {
  const { data, error } = await supabase
    .from('proofs')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getProofsByMilestone(milestoneId) {
  const { data, error } = await supabase
    .from('proofs')
    .select('*')
    .eq('milestone_id', milestoneId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
