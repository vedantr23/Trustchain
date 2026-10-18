/**
 * Data Access Layer – Audit Logs
 */
import { supabase } from '../config/supabase.js';

export async function logAudit({ action, actorId, targetTable, targetId, details = {} }) {
  const { error } = await supabase.from('audit_logs').insert({
    action,
    actor_id: actorId || null,
    target_table: targetTable || null,
    target_id: targetId || null,
    details,
  });
  if (error) console.error('[AuditLog] Failed to write audit entry:', error.message);
}

export async function getAuditLogs({ limit = 100 } = {}) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
