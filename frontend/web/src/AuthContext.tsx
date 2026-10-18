/**
 * AuthContext.tsx — Trustchain Authentication & Authorization
 *
 * Provides:
 * - Supabase Auth (magic link / OTP + email/password)
 * - Role-based access control (NGO, Donor, Admin)
 * - NGO approval flow (pending state)
 * - Demo mode fallback when Supabase is not configured
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

// ─── Types ──────────────────────────────────────────────────────────────────

export type UserRole = 'NGO' | 'Donor' | 'Admin';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface TrustchainProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  max_drive_limit?: number;
  wallet_address?: string;
  ngo_status?: ApprovalStatus;
  ngo_org_name?: string;
  ngo_phone?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: TrustchainProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isNGO: boolean;
  isDonor: boolean;
  isNGOApproved: boolean;
}

interface AuthContextValue extends AuthState {
  signInWithOTP: (email: string) => Promise<{ error: string | null }>;
  verifyOTP: (email: string, token: string) => Promise<{ error: string | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (email: string, password: string, name: string, role: UserRole, ngoName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<TrustchainProfile>) => Promise<{ error: string | null }>;
}

// ─── Admin email whitelist ────────────────────────────────────────────────────
const ADMIN_EMAILS = [
  'admin@trustchain.org',
  'ayushsahu882004@gmail.com',
];

// ─── Context ─────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

function createMockProfile(role: UserRole, name: string, email: string): TrustchainProfile {
  return {
    id: `demo-${role.toLowerCase()}-${Date.now()}`,
    email,
    full_name: name,
    role,
    ngo_status: role === 'NGO' ? 'approved' : undefined,
    max_drive_limit: role === 'NGO' ? 1000000 : undefined,
    created_at: new Date().toISOString(),
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<TrustchainProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string, userEmail: string): Promise<TrustchainProfile | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error && error.code !== 'PGRST116') { console.error('Profile fetch error:', error); return null; }
      if (!data) {
        const isAdminEmail = ADMIN_EMAILS.includes(userEmail);
        const newProfile = {
          id: userId, email: userEmail,
          full_name: userEmail.split('@')[0],
          role: (isAdminEmail ? 'Admin' : 'Donor') as UserRole,
          ngo_status: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const { data: created } = await supabase.from('profiles').insert(newProfile).select().single();
        return created as TrustchainProfile | null;
      }
      if (ADMIN_EMAILS.includes(userEmail) && data.role !== 'Admin') {
        const { data: updated } = await supabase.from('profiles').update({ role: 'Admin' }).eq('id', userId).select().single();
        return updated as TrustchainProfile | null;
      }
      return data as TrustchainProfile;
    } catch (e) { console.error('Profile exception:', e); return null; }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const p = await fetchProfile(user.id, user.email || '');
      setProfile(p);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem('trustchain_demo_session');
      if (saved) {
        try { const { profile: p } = JSON.parse(saved); setProfile(p); } catch { /* */ }
      }
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s); setUser(s?.user ?? null);
      if (s?.user) { const p = await fetchProfile(s.user.id, s.user.email || ''); setProfile(p); }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s); setUser(s?.user ?? null);
      if (s?.user) { const p = await fetchProfile(s.user.id, s.user.email || ''); setProfile(p); }
      else setProfile(null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signInWithOTP = async (email: string) => {
    if (!isSupabaseConfigured) return { error: 'Demo mode: use email/password login below.' };
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    return { error: error?.message ?? null };
  };

  const verifyOTP = async (email: string, token: string) => {
    if (!isSupabaseConfigured) return { error: 'Supabase not configured.' };
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    return { error: error?.message ?? null };
  };

  const signInWithPassword = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      const isAdminAttempt = ADMIN_EMAILS.includes(email) || password === 'admin@2024';
      const role: UserRole = isAdminAttempt ? 'Admin' : (password === 'ngo@2024' ? 'NGO' : 'Donor');
      const mockProfile = createMockProfile(role, email.split('@')[0], email);
      setProfile(mockProfile);
      localStorage.setItem('trustchain_demo_session', JSON.stringify({ profile: mockProfile }));
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUpWithPassword = async (email: string, password: string, name: string, role: UserRole, ngoName?: string) => {
    if (!isSupabaseConfigured) {
      const mockProfile = createMockProfile(role, name, email);
      if (role === 'NGO') { mockProfile.ngo_status = 'pending'; mockProfile.ngo_org_name = ngoName; }
      setProfile(mockProfile);
      localStorage.setItem('trustchain_demo_session', JSON.stringify({ profile: mockProfile }));
      return { error: null };
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      const isAdminEmail = ADMIN_EMAILS.includes(email);
      const finalRole: UserRole = isAdminEmail ? 'Admin' : role;
      await supabase.from('profiles').upsert({
        id: data.user.id, email, full_name: name, role: finalRole,
        ngo_status: finalRole === 'NGO' ? 'pending' : null,
        ngo_org_name: ngoName ?? null,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      });
    }
    return { error: null };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) { setProfile(null); localStorage.removeItem('trustchain_demo_session'); return; }
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<TrustchainProfile>) => {
    if (!user || !isSupabaseConfigured) {
      if (profile) setProfile({ ...profile, ...updates });
      return { error: null };
    }
    const { error } = await supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', user.id);
    if (!error) setProfile(prev => prev ? { ...prev, ...updates } : prev);
    return { error: error?.message ?? null };
  };

  const isAdmin = profile?.role === 'Admin' || ADMIN_EMAILS.includes(profile?.email ?? '');
  const isNGO = profile?.role === 'NGO';
  const isDonor = profile?.role === 'Donor';
  const isNGOApproved = isNGO && (profile?.ngo_status === 'approved' || profile?.ngo_status === undefined);

  const value: AuthContextValue = {
    user, session, profile, loading, isAdmin, isNGO, isDonor, isNGOApproved,
    signInWithOTP, verifyOTP, signInWithPassword, signUpWithPassword, signOut, refreshProfile, updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
