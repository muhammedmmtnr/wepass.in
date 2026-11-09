import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WePass — Your Queue. Your Time. Your Table.',
  description: 'Premium restaurant queue and table management platform.',
  icons: {
    icon: '/brand/wepass-icon.png',
    apple: '/brand/wepass-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#079F61',
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
