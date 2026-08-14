import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import ZenLayoutWrapper from '@/components/layout/ZenLayoutWrapper';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ZenU — Your Student Wellness Companion',
    template: '%s · ZenU',
  },
  description:
    'ZenU is a student mental wellness platform. Manage stress, journal your thoughts, practice mindfulness, and find inner calm — all in one place.',
  keywords: [
    'student wellness',
    'mental health',
    'stress management',
    'meditation',
    'mindfulness',
    'breathing exercises',
    'gratitude journal',
  ],
  authors: [{ name: 'ZenU Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.jpeg',
    apple: '/icons/icon-192.jpeg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ZenU',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // respect iOS safe areas
  themeColor: '#4a90e2',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Lora — serif font for Journal, Gratitude, Inner Compass */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-zen-bg text-zen-fg antialiased">
        <AuthProvider>
          <ZenLayoutWrapper>
            {children}
          </ZenLayoutWrapper>

          {/* Toast notifications */}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}