'use client';

import { Inbox } from '@novu/nextjs';
import { dark } from '@novu/nextjs/themes';
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
        baseTheme: dark,
        variables: {
          colorPrimary: '#3B82F6',
          colorPrimaryForeground: '#ffffff',
          colorSecondary: '#172033',
          colorSecondaryForeground: '#f8fafc',
          colorBackground: '#0B1120',
          colorForeground: '#f8fafc',
          colorNeutral: '#1E293B',
          fontSize: '14px',
        },
        elements: {
          bellIcon: {
            color: 'currentColor',
          },
        },
      }}
    />
  );
}
