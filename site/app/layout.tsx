import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clima Brasil",
  description: "Tudo sobre o tempo e o clima no Brasil.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-white text-slate-800`}>
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-bold text-green-700">
              Clima Brasil
            </Link>
            <div className="flex gap-6 text-sm font-medium text-slate-600">
              <Link href="/blog" className="hover:text-green-700">
                Blog
              </Link>
              <Link href="/tempo-real" className="hover:text-green-700">
                Tempo Real
              </Link>
              <Link href="/sobre" className="hover:text-green-700">
                Sobre
              </Link>
              <Link href="/contato" className="hover:text-green-700">
                Contato
              </Link>
            </div>
          </nav>
        </header>

        <div className="mx-auto min-h-[70vh] max-w-3xl px-4 py-10">
          {children}
        </div>

        <footer className="border-t border-slate-200 bg-white py-6">
          <p className="mx-auto max-w-3xl px-4 text-sm text-slate-500">
            © 2026 Clima Brasil. Conteúdo informativo sobre clima e meteorologia.
          </p>
        </footer>
      </body>
    </html>
  );
}
