import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/utils/queryClient';

export const metadata: Metadata = {
  title: 'Middleman App | The IT Technician Marketplace',
  description: 'Connect with expert technicians for networking, IT, and cabling installations. Middleman provides a secure platform with escrow payments and verified talent.',
  keywords: ['IT technicians', 'marketplace', 'networking jobs', 'freelance IT', 'cabling installations'],
  robots: 'index, follow',
  openGraph: {
    title: 'Middleman App | The IT Technician Marketplace',
    description: 'The secure marketplace for IT installations and networking jobs.',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
      </head>
      <body className="safe-area-padding">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
