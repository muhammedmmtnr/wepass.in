import type { Metadata, Viewport } from 'next';
// @ts-expect-error Next.js handles global CSS imports at build time.
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://wepass.in'),
  title: 'WePass — Your Queue. Your Time. Your Table.',
  description: 'Join restaurant queues by QR code,track your place in real time, and help your team manage tables with WePass.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: 'https://wepass.in/',
    siteName: 'WePass',
    title: 'WePass — Your Queue. Your Time. Your Table.',
    description: 'A smarter way to manage restaurant queues and give every guest a better experience.',
    images: ['/brand/logo-card.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WePass — Your Queue. Your Time. Your Table.',
    description: 'A smarter way to manage restaurant queues and give every guest a better experience.',
    images: ['/brand/logo-card.png'],
  },
  icons: {
    icon: '/brand/wepass-icon.png',
    apple: '/brand/wepass-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#237A50',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface-subtle text-slate-800 antialiased selection:bg-wepass-100 selection:text-wepass-800">
        {children}
      </body>
    </html>
  );
}
