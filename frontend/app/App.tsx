import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NgoDashboardScreen } from './screens/NgoDashboardScreen';
import { DonorDashboardScreen } from './screens/DonorDashboardScreen';

type Role = 'landing' | 'ngo' | 'donor';
type Language = 'EN' | 'HI';

const BG_IMG = { uri: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000' };

export default function App() {
  const [role, setRole] = useState<Role>('landing');
  const [lang, setLang] = useState<Language>('EN');

  if (role === 'ngo')   return <NgoDashboardScreen   onBack={() => setRole('landing')} lang={lang} bg={BG_IMG} />;
  if (role === 'donor') return <DonorDashboardScreen  onBack={() => setRole('landing')} lang={lang} bg={BG_IMG} />;

  const t = {
    title: 'TrustChain', sub: lang === 'EN' ? 'Milestone-based Verified Donations' : 'माइलस्टोन-आधारित सत्यापित दान',
    donor: lang === 'EN' ? 'Donor Portal' : 'दाता पोर्टल',
    donorSub: lang === 'EN' ? 'Browse and fund verified campaigns.' : 'सत्यापित अभियानों को ब्राउज़ करें और निधि दें।',
    ngo: lang === 'EN' ? 'NGO Dashboard' : 'एनजीओ डैशबोर्ड',
    ngoSub: lang === 'EN' ? 'Create drives and submit proof.' : 'अभियान बनाएं और प्रमाण जमा करें।',
  };

  return (
    <ImageBackground source={BG_IMG} style={styles.bg} resizeMode="cover">
    <View style={styles.overlay}>
    <ScrollView contentContainerStyle={styles.landingContainer}>
      <StatusBar style="dark" />
      
      <View style={styles.langToggleRow}>
        <TouchableOpacity onPress={() => setLang(lang === 'EN' ? 'HI' : 'EN')} style={styles.langBtn}>
          <Text style={styles.langBtnText}>{lang === 'EN' ? '🌐 HI' : '🌐 EN'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <View style={styles.liveBadge}>
          <View style={styles.dot} />
          <Text style={styles.liveText}>Live Real-Time Sync</Text>
        </View>
        <Text style={styles.heroTitle}>Trust<Text style={{ color: '#10b981' }}>Chain</Text></Text>
        <Text style={styles.heroSub}>{t.sub}</Text>
      </View>
      
      <View style={styles.cardList}>
        <TouchableOpacity activeOpacity={0.7} style={[styles.card, { borderColor: '#ef4444' }]} onPress={() => setRole('donor')}>
          <Text style={styles.cardIcon}>💝</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{t.donor}</Text>
            <Text style={styles.cardSub}>{t.donorSub}</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} style={[styles.card, { borderColor: '#10b981' }]} onPress={() => setRole('ngo')}>
          <Text style={styles.cardIcon}>🌍</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{t.ngo}</Text>
            <Text style={styles.cardSub}>{t.ngoSub}</Text>
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>

      </View>

      <Text style={styles.footer}>Powered by Supabase Realtime</Text>
    </ScrollView>
    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.88)' },
  landingContainer: { minHeight: '100%', padding: 24, paddingTop: 60 },
  langToggleRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 },
  langBtn: { backgroundColor: '#e2e8f0', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#cbd5e1' },
  langBtnText: { color: '#0f172a', fontWeight: '800', fontSize: 13 },
  header: { alignItems: 'center', marginBottom: 40 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.15)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981', marginRight: 8 },
  liveText: { color: '#10b981', fontSize: 12, fontWeight: '800' },
  heroTitle: { color: '#0ea5e9', fontSize: 42, fontWeight: '900', marginBottom: 8, letterSpacing: -1 },
  heroSub: { color: '#334155', fontSize: 18, textAlign: 'center', fontWeight: '600' },
  cardList: { width: '100%' },
  card: { 
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)', 
    borderRadius: 16, padding: 20, marginBottom: 16, 
    borderWidth: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  cardIcon: { fontSize: 26, marginRight: 16 },
  cardContent: { flex: 1 },
  cardTitle: { color: '#0f172a', fontSize: 19, fontWeight: '800', marginBottom: 4 },
  cardSub: { color: '#475569', fontSize: 14, fontWeight: '600' },
  arrowIcon: { color: '#94a3b8', fontSize: 20, fontWeight: 'bold' },
  footer: { marginTop: 40, color: '#94a3b8', fontSize: 12, textAlign: 'center', fontWeight: '700' },
});
