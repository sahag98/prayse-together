import { Session, User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Appearance, ColorSchemeName } from 'react-native';
import { Database, Tables } from '~/database.types';
import { GroupMembers } from '~/types/types';

import { supabase } from '~/utils/supabase';

const ThemeContext = createContext<{
  colorScheme: ColorSchemeName | string;
}>({
  colorScheme: '',
});

export default function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName | string>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(
      ({ colorScheme: newColorScheme }: { colorScheme: ColorSchemeName }) => {
        setColorScheme(newColorScheme);
      }
    );
    return () => subscription.remove();
  }, [setColorScheme]);

  return (
    <ThemeContext.Provider
      value={{
        colorScheme: colorScheme,
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
