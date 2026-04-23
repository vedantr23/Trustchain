import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, ImageBackground } from 'react-native';
import { supabase } from '../supabase';

export const NgoDashboardScreen = ({ onBack, lang, bg }: { onBack: () => void, lang: string, bg: any }) => {
  const [tab, setTab] = useState<'status' | 'create'>('status');
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [milestones, setMilestones] = useState([{ title: '', amount: '' }]);

  const t = {
    title: lang === 'EN' ? 'NGO Portal' : 'एनजीओ पोर्टल',
    portfolio: lang === 'EN' ? 'Portfolio' : 'पोर्टफोलियो',
    launch: lang === 'EN' ? 'Launch Drive' : 'अभियान लॉन्च करें',
    activeDrives: lang === 'EN' ? 'Active Drives' : 'सक्रिय अभियान',
    funds: lang === 'EN' ? 'Funds Credited' : 'प्राप्त धनराशि',
    submitProof: lang === 'EN' ? 'Submit Proof' : 'प्रमाण जमा करें',
    launchBtn: lang === 'EN' ? 'Launch Verified Drive 🚀' : 'सत्यापित अभियान लॉन्च करें 🚀'
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('drives').select('*, milestones(*)').order('created_at', { ascending: false });
      setDrives(data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    const sub = supabase.channel('ngo-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'milestones' }, fetchData).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const handleCreateDrive = async () => {
    if (!title || !targetAmount) return Alert.alert('Error', 'Required fields missing.');
    setLoading(true);
    try {
      const { data: drive, error: dErr } = await supabase.from('drives').insert({
        title, target_amount: parseFloat(targetAmount), beneficiaries_count: 0, ngo_id: 'mobile-ngo-1'
      }).select().single();
      if (dErr) throw dErr;

      const ms = milestones.filter(m => m.title).map(m => ({
        drive_id: drive.id, title: m.title, target_amount: parseFloat(m.amount) || 0, status: 'pending'
      }));
      await supabase.from('milestones').insert(ms);
      
      Alert.alert('Success', '🚀 Donation Drive Launched!');
      setTab('status'); fetchData();
      setTitle(''); setTargetAmount(''); setMilestones([{ title: '', amount: '' }]);
    } catch (err: any) { Alert.alert('Error', err.message); } finally { setLoading(false); }
  };

  const submitProof = async (milestoneId: string) => {
    setLoading(true);
    try {
      await supabase.from('proofs').insert({ milestone_id: milestoneId, proof_type: 'image', proof_url: 'mobile-proof.jpg', gps_location: 'Verified', status: 'pending' });
      Alert.alert('Success', '📍 Proof submitted for Admin review.');
      fetchData();
    } catch (err: any) { Alert.alert('Error', err.message); } finally { setLoading(false); }
  };

  const totalCredited = drives.reduce((acc, d) => acc + (d.milestones || []).filter((m: any) => m.status === 'approved').reduce((s: any, m: any) => s + (m.target_amount || 0), 0), 0);

  return (
    <ImageBackground source={bg} style={styles.bg} resizeMode="cover">
    <View style={styles.overlay}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.6}><Text style={styles.backBtn}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>{t.title}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statVal}>{drives.length}</Text>
          <Text style={styles.statLab}>{t.activeDrives}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#10b981' }]}>
          <Text style={[styles.statVal, { color: '#10b981' }]}>₹{totalCredited.toLocaleString('en-IN')}</Text>
          <Text style={styles.statLab}>{t.funds}</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab==='status' && styles.activeTab]} onPress={() => setTab('status')}><Text style={[styles.tabText, tab==='status' && styles.activeTabText]}>{t.portfolio}</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab==='create' && styles.activeTab]} onPress={() => setTab('create')}><Text style={[styles.tabText, tab==='create' && styles.activeTabText]}>{t.launch}</Text></TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {tab === 'status' ? (
            drives.map(drive => (
              <View key={drive.id} style={styles.driveCard}>
                <View style={styles.driveHeader}>
                   <Text style={styles.driveTitle}>{drive.title}</Text>
                   <Text style={styles.drivePrice}>₹{drive.target_amount.toLocaleString('en-IN')}</Text>
                </View>
                {drive.milestones?.map((m: any) => (
                  <View key={m.id} style={styles.mRow}>
                    <View style={styles.mDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.mTitle}>{m.title}</Text>
                      <Text style={styles.mStatus}>{m.status.toUpperCase()}</Text>
                    </View>
                    {m.status === 'pending' ? (
                      <TouchableOpacity activeOpacity={0.7} style={styles.submitBtn} onPress={() => submitProof(m.id)}>
                        <Text style={styles.submitBtnText}>{t.submitProof}</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={{ color: m.status === 'approved' ? '#10b981' : '#ef4444', fontWeight: '800', fontSize: 11 }}>
                        {m.status === 'approved' ? 'CREDITED ✅' : 'REJECTED ❌'}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ))
          ) : (
             <View style={styles.formContainer}>
                <Text style={styles.label}>Drive Title</Text>
                <TextInput style={styles.input} placeholderTextColor="#94a3b8" value={title} onChangeText={setTitle} />
                <Text style={styles.label}>Target Amount (₹)</Text>
                <TextInput style={styles.input} keyboardType="numeric" placeholderTextColor="#94a3b8" value={targetAmount} onChangeText={setTargetAmount} />
                <Text style={[styles.label, { marginTop: 10 }]}>Milestones</Text>
                {milestones.map((m, i) => (
                  <View key={i} style={styles.milestoneBox}>
                    <TextInput style={styles.mInput} placeholder="Milestone Title" placeholderTextColor="#94a3b8" value={m.title} onChangeText={t => {
                      const newM = [...milestones]; newM[i].title = t; setMilestones(newM);
                    }} />
                    <TextInput style={styles.mInput} placeholder="Amount (₹)" keyboardType="numeric" placeholderTextColor="#94a3b8" value={m.amount} onChangeText={t => {
                      const newM = [...milestones]; newM[i].amount = t; setMilestones(newM);
                    }} />
                  </View>
                ))}
                <TouchableOpacity style={styles.addBtn} onPress={() => setMilestones([...milestones, { title: '', amount: '' }])}>
                  <Text style={styles.addBtnText}>+ Add Milestone</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} style={styles.launchBtn} onPress={handleCreateDrive} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.launchBtnText}>{t.launchBtn}</Text>}
                </TouchableOpacity>
             </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(255,255,255,0.92)' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20, paddingTop: 60 },
  backBtn: { color: '#0ea5e9', marginRight: 16, fontWeight: '700', fontSize: 16 },
  title: { color: '#0f172a', fontSize: 22, fontWeight: '800', flex: 1 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#ffffff', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#0ea5e9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statVal: { color: '#0f172a', fontSize: 22, fontWeight: '900' },
  statLab: { color: '#64748b', fontSize: 11, marginTop: 4, fontWeight: '600' },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 10 },
  tab: { flex: 1, paddingVertical: 12, borderBottomWidth: 3, borderBottomColor: 'transparent', alignItems: 'center' },
  activeTab: { borderBottomColor: '#10b981' },
  tabText: { color: '#94a3b8', fontSize: 15, fontWeight: '700' },
  activeTabText: { color: '#10b981' },
  driveCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  driveHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  driveTitle: { color: '#0f172a', fontSize: 18, fontWeight: '800', flex: 1 },
  drivePrice: { color: '#10b981', fontSize: 16, fontWeight: '800' },
  mRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  mDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0ea5e9', marginRight: 12 },
  mTitle: { color: '#1e293b', fontSize: 15, fontWeight: '700' },
  mStatus: { color: '#64748b', fontSize: 10, marginTop: 2, fontWeight: '700' },
  submitBtn: { backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  submitBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  formContainer: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  label: { color: '#475569', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 10, padding: 14, color: '#0f172a', marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 15, fontWeight: '600' },
  milestoneBox: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  mInput: { color: '#0f172a', fontSize: 15, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', paddingBottom: 6, fontWeight: '600' },
  addBtn: { padding: 12, alignItems: 'center' },
  addBtnText: { color: '#0ea5e9', fontWeight: '800', fontSize: 15 },
  launchBtn: { backgroundColor: '#ef4444', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  launchBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
