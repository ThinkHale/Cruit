import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SetupNotice } from '@/components/SetupNotice';
import { assetPath } from '@/lib/paths';

export const metadata: Metadata = {
  title: 'Cruit | Swipe-to-match hiring',
  description: 'Fast, affordable recruiting for hourly teams and job seekers.',
  icons: {
    icon: assetPath('/brand/icon.svg'),
    apple: assetPath('/brand/apple-touch-icon.png'),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white antialiased">
        <AuthProvider>
          <SetupNotice />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
