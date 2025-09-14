import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import Header from '@/components/layout/Header';
import { Providers } from '@/lib/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VoteApp - Modern Voting Platform',
  description: 'Create, participate, and manage polls with our modern voting platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
