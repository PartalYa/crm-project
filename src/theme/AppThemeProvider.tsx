import { Theme, ThemePanel } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Theme appearance="light" accentColor="indigo" grayColor="mauve" radius="medium">
      {children}
      {/* Optional: ThemePanel for dev theme switching */}
      {/* <ThemePanel /> */}
    </Theme>
  );
}
