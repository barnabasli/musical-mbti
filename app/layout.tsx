import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Musical MBTI — Discover Your Sound Profile',
  description:
    'A quiz that maps how you process music across four distinct axes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className={`${dmSans.className} bg-[#FDFBF7] text-[#1A2133] antialiased`}>
        {children}
      </body>
    </html>
  );
}
