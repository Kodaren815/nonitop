import type { Metadata, Viewport } from 'next';
import { Raleway } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartSlideOver from '@/components/CartSlideOver';
import '@/styles/globals.css';

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-raleway',
  display: 'swap',
});

// Get site URL with validation - fallback to default if invalid
function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const fallback = 'https://nonito.se';
  
  if (!envUrl) return fallback;
  
  // Check if URL is valid (not masked or invalid)
  try {
    new URL(envUrl);
    return envUrl;
  } catch {
    return fallback;
  }
}

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fff5f5',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: '/favicon.svg',
  },
  title: {
    default: 'Nonito - Söta och praktiska saker för dig och mini',
    template: '%s | Nonito',
  },
  description:
    'En värld av söta och praktiska saker för dig och mini. Handgjorda favoriter designade med kärlek i Sverige.',
  keywords: [
    'baby',
    'barn',
    'handgjord',
    'necessär',
    'skötväska',
    'svensk design',
    'babyshower',
    'present',
    'barnkläder',
    'babyprodukter',
  ],
  authors: [{ name: 'Nonito' }],
  creator: 'Nonito',
  publisher: 'Nonito',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Nonito - Söta och praktiska saker för dig och mini',
    description:
      'En värld av söta och praktiska saker för dig och mini. Handgjorda favoriter designade med kärlek i Sverige.',
    url: siteUrl,
    type: 'website',
    locale: 'sv_SE',
    siteName: 'Nonito',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nonito - Söta och praktiska saker för dig och mini',
    description:
      'En värld av söta och praktiska saker för dig och mini. Handgjorda favoriter designade med kärlek i Sverige.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when you have them
    // google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv" className={raleway.variable}>
      <head>
        {/* Preconnect to Stripe CDN for faster image loading */}
        <link rel="preconnect" href="https://files.stripe.com" />
        <link rel="dns-prefetch" href="https://files.stripe.com" />
      </head>
      <body className="min-h-screen flex flex-col bg-offwhite font-sans">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartSlideOver />
        </CartProvider>
      </body>
    </html>
  );
}
