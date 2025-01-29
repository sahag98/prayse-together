import { SafeAreaView } from 'react-native-safe-area-context';

export const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaView edges={['top', 'bottom']} className={styles.container}>
      {children}
    </SafeAreaView>
  );
};

const styles = {
  container: 'flex p-5 bg-background flex-1',
};
