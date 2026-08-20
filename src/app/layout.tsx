import type { Metadata } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["800", "900"],
});

export const metadata: Metadata = {
  title: "Nibe Log Analyser",
  description: "Upload and review Nibe heat pump service logs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <header className="w-full bg-panel">
          <div className="mx-auto grid w-full max-w-3xl grid-cols-[auto_1fr] items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5 md:px-8">
            <div className="w-fit rounded-md bg-white px-2 py-1.5 shadow-sm sm:px-2.5 sm:py-2">
              <Image
                className="h-5 w-auto sm:h-6"
                src="/etb-logo.jpg"
                alt="ETB Värme logo"
                width={214}
                height={50}
                priority
              />
            </div>
            <div className="min-w-0 leading-none">
              <h1 className="truncate font-display text-base font-black uppercase tracking-tight text-panel-foreground sm:text-xl md:text-2xl">
                Nibe <span className="text-hot">Log</span> Analyser
              </h1>
              <p className="mt-1.5 hidden font-mono text-[10px] uppercase tracking-[0.22em] text-panel-muted sm:block">
                ETB Värme — Service Diagnostics
              </p>
            </div>
          </div>
          <div className="flex h-[3px] w-full">
            <span className="flex-1 bg-hot" />
            <span className="flex-1 bg-cold" />
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-14">
          {children}
        </main>
      </body>
    </html>
  );
}
