import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Spain Move Tracker", description: "Spain DNV, relocation and citizenship tracker" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
