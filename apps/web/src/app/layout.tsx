import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/utils/queryClient';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://middlemanapp.com'),
  title: {
    default: 'Middleman | The IT Technician Marketplace',
    template: '%s | Middleman',
  },
  description:
    'Connect with expert IT technicians for networking, cabling, and installations. Middleman provides a secure marketplace with escrow payments and verified talent.',
  keywords: ['IT technicians', 'marketplace', 'networking jobs', 'freelance IT', 'cabling installations'],
  robots: { index: true, follow: true },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Middleman | The IT Technician Marketplace',
    description:
      'The secure marketplace for IT installations, networking jobs, and verified technicians.',
    type: 'website',
    url: 'https://middlemanapp.com',
    siteName: 'Middleman',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Middleman | The IT Technician Marketplace',
    description: 'The secure marketplace for IT installations and networking jobs.',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
      </head>
      <body className={`safe-area-padding font-sans ${inter.className}`} suppressHydrationWarning>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
