/**
 * Data Access Layer – Donations
 */
import { supabase } from '../config/supabase.js';

export async function createDonation(payload) {
  const { data, error } = await supabase
    .from('donations')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getDonationsByDrive(driveId) {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('drive_id', driveId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getDonationsByDonor(donorId) {
  const { data, error } = await supabase
    .from('donations')
    .select('*, drives(id, title, image_url)')
    .eq('donor_id', donorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
