import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SocketProvider } from '@/context/SocketContext';
import { GameProvider } from '@/context/GameContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Imposter Game',
  description: 'A fun multiplayer social deduction game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SocketProvider>
          <GameProvider>
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
            </div>
          </GameProvider>
        </SocketProvider>
      </body>
    </html>
  );
}