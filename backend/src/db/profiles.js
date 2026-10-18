/**
 * Data Access Layer – Profiles (Users / NGOs)
 */
import { supabase } from '../config/supabase.js';

export async function getProfileById(id) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getAllNGOs() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, max_drive_limit, ngo_status, ngo_org_name, ngo_phone, created_at')
    .eq('role', 'NGO')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateNgoLimit(id, maxDriveLimit) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ max_drive_limit: maxDriveLimit })
    .eq('id', id)
    .select('id, full_name, max_drive_limit')
    .single();
  if (error) throw error;
  return data;
}

export async function updateNgoStatus(id, ngoStatus) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ngo_status: ngoStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, email, full_name, role, ngo_status, max_drive_limit')
    .single();
  if (error) throw error;
  return data;
}

