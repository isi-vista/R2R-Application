import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

import { ThemeProvider } from '@/components/ThemeProvider';
import { UserProvider, useUserContext } from '@/context/UserContext';
import '@/styles/globals.css';
import { initializePostHog } from '@/lib/posthog-client';

function MyAppContent({ Component, pageProps }: AppProps) {
  const { setTheme } = useTheme();
  const { isAuthenticated, authState } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    setTheme('dark');
    initializePostHog();
  }, []);

  useEffect(() => {
    const protectedRoutes = [
      '/documents',
      '/playground',
      '/users',
      '/logs',
      '/settings',
    ];
    const adminRoutes = ['/users', '/logs', '/settings'];

    if (!isAuthenticated && protectedRoutes.includes(router.pathname)) {
      router.replace('/login');
    } else if (
      isAuthenticated &&
      authState.userRole !== 'admin' &&
      adminRoutes.includes(router.pathname)
    ) {
      router.replace('/');
    }
  }, [isAuthenticated, authState.userRole, router]);

  return <Component {...pageProps} />;
}

function MyApp(props: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <UserProvider>
        <MyAppContent {...props} />
      </UserProvider>
    </ThemeProvider>
  );
}

export default MyApp;
