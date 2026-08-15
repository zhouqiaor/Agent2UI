import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeRouter } from '@/hooks/useSafeRouter';

export default function NotFoundScreen() {
  const router = useSafeRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>页面不存在</Text>
      <Pressable style={styles.button} onPress={() => router.replace('/')}>
        <Text style={styles.buttonText}>返回首页</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F3',
  },
  title: {
    fontSize: 16,
    color: '#64748B',
  },
  button: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
