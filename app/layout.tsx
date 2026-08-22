import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://deck.dionlabs.ai'),
  title: 'Stream Deck Micro — Codex on your Stream Deck',
  description:
    'An open-source, local-first command center for Codex sessions on Elgato Stream Deck.',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Stream Deck Micro',
    title: 'Stream Deck Micro — Your agents. One deck.',
    description:
      'A tactile, local-first command center for your Codex sessions.',
    images: [
      {
        url: '/stream-deck-micro-og.png',
        width: 1731,
        height: 909,
        alt: 'Stream Deck Micro — Your agents. One deck.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stream Deck Micro — Your agents. One deck.',
    description:
      'A tactile, local-first command center for your Codex sessions.',
    images: ['/stream-deck-micro-og.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#080a08',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
