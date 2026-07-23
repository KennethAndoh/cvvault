'use client';

import { Inbox } from '@novu/nextjs';
import { useAuth } from '@/contexts/AuthContext';

export default function NotificationInbox({ subscriberId }: { subscriberId?: string }) {
  const { user } = useAuth();
  const activeSubscriberId = subscriberId || user?.uid || '6a60cf03eb33bba3b8ce33e8';
  const applicationIdentifier = process.env.NEXT_PUBLIC_NOVU_APPLICATION_IDENTIFIER || 'FYmI0MH-6l9I';

  return (
    <Inbox
      applicationIdentifier={applicationIdentifier}
      subscriberId={activeSubscriberId}
      appearance={{
        baseTheme: 'dark',
        variables: {
          colorPrimary: '#3482BE',
          colorPrimaryForeground: '#ffffff',
          colorSecondary: '#1e293b',
          colorSecondaryForeground: '#f8fafc',
          colorBackground: '#0f172a',
          colorForeground: '#f8fafc',
          colorNeutral: '#334155',
          fontSize: '14px',
        },
        elements: {
          bellIcon: {
            color: '#3482BE',
          },
        },
      }}
    />
  );
}
