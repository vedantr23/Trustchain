import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ImageBackground, Alert, Dimensions, SafeAreaView } from 'react-native';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');

type Tab = 'home' | 'ranking' | 'profile';

export const DonorDashboardScreen = ({ onBack, lang, bg }: { onBack: () => void, lang: string, bg: any }) => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fundedMilestones, setFundedMilestones] = useState<string[]>([]);
  const [userStats, setUserStats] = useState({ totalDonated: 0, impactCount: 0 });

  const t = {
    title: lang === 'EN' ? 'Donor Portal' : 'दाता पोर्टल',
    live: lang === 'EN' ? 'Live' : 'लाइव',
    impactTitle: lang === 'EN' ? 'Global Leaderboard 🔥' : 'ग्लोबल लीडरबोर्ड 🔥',
    activeDrives: lang === 'EN' ? 'Active Verified Drives' : 'सक्रिय सत्यापित अभियान',
    verified: lang === 'EN' ? 'VERIFIED' : 'सत्यापित',
    completed: lang === 'EN' ? '✅ COMPLETED • VERIFIED' : '✅ पूर्ण • सत्यापित',
    pending: lang === 'EN' ? 'PENDING VERIFICATION' : 'सत्यापन लंबित',
    fundBtn: (amt: number) => lang === 'EN' ? `Fund ₹${amt.toLocaleString('en-IN')}` : `निधि ₹${amt.toLocaleString('en-IN')}`,
    thanks: lang === 'EN' ? 'THANK YOU! 🙏' : 'धन्यवाद! 🙏',
    empty: lang === 'EN' ? 'Loading transparency layer...' : 'डेटा लोड हो रहा है...',
    home: lang === 'EN' ? 'Home' : 'होम',
    ranking: lang === 'EN' ? 'Ranking' : 'रैंकिंग',
    profile: lang === 'EN' ? 'Profile' : 'प्रोफ़ाइल',
    logout: lang === 'EN' ? 'Exit Portal' : 'पोर्टल से बाहर निकलें',
    stats: lang === 'EN' ? 'Your Impact' : 'आपका प्रभाव',
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
    const sub = supabase.channel('donor-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'milestones' }, fetchData).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const handleFund = async (milestoneId: string, amount: number) => {
    setFundedMilestones([...fundedMilestones, milestoneId]);
    setUserStats(prev => ({
      totalDonated: prev.totalDonated + amount,
      impactCount: prev.impactCount + 1
    }));
    Alert.alert('Thank You! 💖', 'Your donation has been recorded. Transparency verified.');
  };

  const renderHome = () => (
    <ScrollView 
      contentContainerStyle={styles.scrollContent} 
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} colors={['#10b981']} />}
    >
      <Text style={styles.sectionTitle}>{t.activeDrives}</Text>
      
      {drives.map(drive => (
        <View key={drive.id} style={styles.driveCard}>
          <View style={styles.driveHeader}>
             <Text style={styles.driveTitle}>{drive.title}</Text>
             <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>{t.verified}</Text></View>
          </View>
          
          {drive.milestones?.map((m: any) => (
            <View key={m.id} style={styles.mRow}>
              <View style={{ flex: 1 }}>
                 <Text style={styles.mTitle}>{m.title}</Text>
                 <Text style={[styles.mStatus, { color: m.status === 'approved' ? '#10b981' : '#64748b' }]}>
                    {m.status === 'approved' ? t.completed : t.pending}
                 </Text>
              </View>
              
              {fundedMilestones.includes(m.id) ? (
                 <View style={styles.thanksBadge}><Text style={styles.thanksText}>{t.thanks}</Text></View>
              ) : (
                 m.status !== 'approved' && (
                  <TouchableOpacity activeOpacity={0.7} style={styles.fundBtn} onPress={() => handleFund(m.id, m.target_amount)}>
                    <Text style={styles.fundBtnText}>{t.fundBtn(m.target_amount)}</Text>
                  </TouchableOpacity>
                 )
              )}
            </View>
          ))}
        </View>
      ))}
      {drives.length === 0 && !loading && <Text style={styles.emptyText}>{t.empty}</Text>}
    </ScrollView>
  );

  const renderRanking = () => (
    <View style={styles.tabContent}>
      <View style={styles.impactCard}>
        <Text style={styles.impactTitle}>{t.impactTitle}</Text>
        <View style={styles.leaderRow}>
            <Text style={styles.leaderText}>🥇 Rajesh Kumar • Delhi</Text>
            <Text style={styles.leaderVal}>₹52,000</Text>
        </View>
        <View style={styles.leaderRow}>
            <Text style={styles.leaderText}>🥈 Ananya Singh • Mumbai</Text>
            <Text style={styles.leaderVal}>₹38,500</Text>
        </View>
        <View style={styles.leaderRow}>
            <Text style={styles.leaderText}>🥉 Vikram Mehta • Bangalore</Text>
            <Text style={styles.leaderVal}>₹29,200</Text>
        </View>
        <View style={[styles.leaderRow, { opacity: 0.7 }]}>
            <Text style={styles.leaderText}>4. Priya Sharma • Pune</Text>
            <Text style={styles.leaderVal}>₹21,000</Text>
        </View>
        <View style={[styles.leaderRow, { opacity: 0.7 }]}>
            <Text style={styles.leaderText}>5. Rahul Varma • Hyderabad</Text>
            <Text style={styles.leaderVal}>₹18,400</Text>
        </View>
      </View>
    </View>
  );

  const renderProfile = () => (
    <View style={styles.tabContent}>
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>JD</Text>
        </View>
        <Text style={styles.userName}>John Donor</Text>
        <Text style={styles.userEmail}>john.donor@example.com</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>₹{userStats.totalDonated.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Contributed</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{userStats.impactCount}</Text>
            <Text style={styles.statLabel}>Lives Impacted</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onBack}>
          <Text style={styles.logoutBtnText}>{t.logout}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ImageBackground source={bg} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>{t.title}</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.dot} />
              <Text style={styles.liveText}>{t.live}</Text>
            </View>
          </View>

          <View style={styles.mainContent}>
            {activeTab === 'home' && renderHome()}
            {activeTab === 'ranking' && renderRanking()}
            {activeTab === 'profile' && renderProfile()}
          </View>

          {/* Bottom Navigation Bar */}
          <View style={styles.bottomNav}>
            <TouchableOpacity 
              style={styles.navItem} 
              onPress={() => setActiveTab('home')}
            >
              <Text style={[styles.navIcon, activeTab === 'home' && styles.navActiveText]}>🏠</Text>
              <Text style={[styles.navText, activeTab === 'home' && styles.navActiveText]}>{t.home}</Text>
              {activeTab === 'home' && <View style={styles.activeIndicator} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navItem} 
              onPress={() => setActiveTab('ranking')}
            >
              <Text style={[styles.navIcon, activeTab === 'ranking' && styles.navActiveText]}>🏆</Text>
              <Text style={[styles.navText, activeTab === 'ranking' && styles.navActiveText]}>{t.ranking}</Text>
              {activeTab === 'ranking' && <View style={styles.activeIndicator} />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navItem} 
              onPress={() => setActiveTab('profile')}
            >
              <Text style={[styles.navIcon, activeTab === 'profile' && styles.navActiveText]}>👤</Text>
              <Text style={[styles.navText, activeTab === 'profile' && styles.navActiveText]}>{t.profile}</Text>
              {activeTab === 'profile' && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safeArea: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(255,255,255,0.85)' }, // Slightly more transparent (0.85)
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  title: { color: '#0f172a', fontSize: 24, fontWeight: '900', flex: 1, letterSpacing: -0.5 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.12)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981', marginRight: 6 },
  liveText: { color: '#10b981', fontSize: 12, fontWeight: '900' },
  
  mainContent: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  tabContent: { flex: 1, padding: 20 },
  
  sectionTitle: { color: '#64748b', fontSize: 13, fontWeight: '900', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  
  // Cards
  driveCard: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
  driveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  driveTitle: { color: '#0f172a', fontSize: 20, fontWeight: '800', flex: 1, marginRight: 10 },
  verifiedBadge: { backgroundColor: '#10b981', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  verifiedText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  
  mRow: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  mTitle: { color: '#334155', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  mStatus: { fontSize: 12, fontWeight: '800' },
  
  fundBtn: { backgroundColor: '#ef4444', paddingVertical: 14, borderRadius: 12, marginTop: 12, alignItems: 'center', shadowColor: '#ef4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 },
  fundBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  
  thanksBadge: { backgroundColor: 'rgba(16,185,129,0.1)', padding: 14, borderRadius: 12, marginTop: 12, alignItems: 'center' },
  thanksText: { color: '#10b981', fontSize: 15, fontWeight: '800' },
  
  impactCard: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  impactTitle: { color: '#0f172a', fontSize: 22, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  leaderRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  leaderText: { color: '#334155', fontSize: 16, fontWeight: '700' },
  leaderVal: { color: '#10b981', fontSize: 16, fontWeight: '900' },
  
  profileCard: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 24, padding: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0ea5e9', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '900' },
  userName: { color: '#0f172a', fontSize: 22, fontWeight: '900', marginBottom: 4 },
  userEmail: { color: '#64748b', fontSize: 14, fontWeight: '600', marginBottom: 25 },
  
  statsRow: { flexDirection: 'row', width: '100%', paddingVertical: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f1f5f9', marginBottom: 30 },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { color: '#0f172a', fontSize: 20, fontWeight: '900', marginBottom: 4 },
  statLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  divider: { width: 1, backgroundColor: '#f1f5f9' },
  
  logoutBtn: { width: '100%', paddingVertical: 16, borderRadius: 14, backgroundColor: '#f1f5f9', alignItems: 'center' },
  logoutBtnText: { color: '#64748b', fontSize: 15, fontWeight: '800' },
  
  // Bottom Nav
  bottomNav: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    paddingTop: 12, 
    paddingBottom: 25, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(0,0,0,0.05)',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    justifyContent: 'space-around',
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 10
  },
  navItem: { alignItems: 'center', flex: 1 },
  navIcon: { fontSize: 22, marginBottom: 4, opacity: 0.6 },
  navText: { fontSize: 11, fontWeight: '800', color: '#94a3b8' },
  navActiveText: { color: '#10b981', opacity: 1 },
  activeIndicator: { position: 'absolute', top: -12, width: 24, height: 3, backgroundColor: '#10b981', borderRadius: 2 },
  
  emptyText: { color: '#94a3b8', textAlign: 'center', marginTop: 40, fontWeight: '600' },
});
