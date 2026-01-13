import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'PoseMan - Gamify Your Breaks',
  description: 'A fun pose-detection game to take active breaks. Make poses to form letters and guess words, do fitness routines, or battle friends in real-time!',
  keywords: ['pose detection', 'fitness game', 'body tracking', 'exercise game', 'break reminder'],
  authors: [{ name: 'PoseMan Team' }],
  openGraph: {
    title: 'PoseMan - Gamify Your Breaks',
    description: 'A fun pose-detection game to take active breaks',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PoseMan - Gamify Your Breaks',
    description: 'A fun pose-detection game to take active breaks',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#0a0a0f] text-white antialiased">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
