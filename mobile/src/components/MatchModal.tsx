import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface MatchModalProps {
  visible: boolean;
  employerName: string;
  candidateName: string;
  jobTitle: string;
  onKeepSwiping: () => void;
  onMessage: () => void;
}

export function MatchModal({ visible, employerName, candidateName, jobTitle, onKeepSwiping, onMessage }: MatchModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>It's a Match!</Text>
          <Text style={styles.sub}>
            <Text style={styles.accent}>{employerName}</Text> and <Text style={styles.accent}>{candidateName}</Text>
          </Text>
          <Text style={styles.job}>Both interested in {jobTitle}</Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={onMessage}>
            <Text style={styles.primaryBtnText}>Send a Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={onKeepSwiping}>
            <Text style={styles.secondaryBtnText}>Keep Swiping</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: '#1e293b', borderRadius: 28, padding: 32, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)' },
  emoji: { fontSize: 52, marginBottom: 12 },
  title: { color: '#fff', fontSize: 30, fontWeight: '900', marginBottom: 8 },
  sub: { color: '#94a3b8', textAlign: 'center', marginBottom: 4 },
  accent: { color: '#f97316', fontWeight: '700' },
  job: { color: '#e2e8f0', fontWeight: '600', textAlign: 'center', marginBottom: 28 },
  primaryBtn: { backgroundColor: '#f97316', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center', marginBottom: 12 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryBtn: { paddingVertical: 10 },
  secondaryBtnText: { color: '#64748b', fontSize: 14 },
});
