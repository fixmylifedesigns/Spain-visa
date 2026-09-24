import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LangProvider } from "@/components/Lang";
import Nav from "@/components/Nav";
import { Footer } from "@/components/Page";

export const metadata: Metadata = {
  title: "Irving & Moeno · Spain hub",
  description: "Our Spain move: visa, partnership, N26, Mui and our Valencia home search",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f7f4ec] text-stone-800" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <LangProvider>
          <Nav />
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
            <Footer />
          </main>
        </LangProvider>
      </body>
    </html>
  );
}
