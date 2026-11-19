import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "@/styles/base.css";
import "@/styles/nav.css";
import "@/styles/hero.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://akash-portfolio.vercel.app";
const TITLE = "Akash Prakasan Manikyam | Radar Signal Processing & Perception";
const DESCRIPTION =
  "Akash Prakasan Manikyam, M.Sc. student at FAU Erlangen-Nürnberg working on radar signal processing, sensor fusion and state estimation for autonomous driving.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    siteName: "Akash Prakasan Manikyam",
    locale: "en_US",
    type: "website",
    images: [{ url: "/bg.jpg", width: 1280, height: 1280, alt: "Akash Prakasan Manikyam" }],
  },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION, images: ["/bg.jpg"] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#11151c" },
  ],
};

const themeScript = `(function(){try{document.documentElement.dataset.theme=localStorage.getItem('portfolio-theme')==='dark'?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={spaceGrotesk.variable} data-theme="light" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
