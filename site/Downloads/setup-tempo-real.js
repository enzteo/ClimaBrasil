
const fs = require("fs");
const path = require("path");

function writeFile(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
  console.log("criado/atualizado:", p);
}

console.log("Adicionando a página de temperatura em tempo real...");

writeFile(
  "lib/estados.ts",
  `// Lista das 27 unidades federativas do Brasil, com a capital de cada uma
// (é a coordenada da capital que usamos para buscar a temperatura).

export type Estado = {
  sigla: string;
  nome: string;
  capital: string;
  lat: number;
  lon: number;
  regiao: "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul";
};

export const estados: Estado[] = [
  { sigla: "AC", nome: "Acre", capital: "Rio Branco", lat: -9.97, lon: -67.81, regiao: "Norte" },
  { sigla: "AP", nome: "Amapá", capital: "Macapá", lat: 0.03, lon: -51.05, regiao: "Norte" },
  { sigla: "AM", nome: "Amazonas", capital: "Manaus", lat: -3.1, lon: -60.02, regiao: "Norte" },
  { sigla: "PA", nome: "Pará", capital: "Belém", lat: -1.46, lon: -48.5, regiao: "Norte" },
  { sigla: "RO", nome: "Rondônia", capital: "Porto Velho", lat: -8.76, lon: -63.9, regiao: "Norte" },
  { sigla: "RR", nome: "Roraima", capital: "Boa Vista", lat: 2.82, lon: -60.67, regiao: "Norte" },
  { sigla: "TO", nome: "Tocantins", capital: "Palmas", lat: -10.25, lon: -48.32, regiao: "Norte" },

  { sigla: "AL", nome: "Alagoas", capital: "Maceió", lat: -9.65, lon: -35.7, regiao: "Nordeste" },
  { sigla: "BA", nome: "Bahia", capital: "Salvador", lat: -12.97, lon: -38.51, regiao: "Nordeste" },
  { sigla: "CE", nome: "Ceará", capital: "Fortaleza", lat: -3.73, lon: -38.52, regiao: "Nordeste" },
  { sigla: "MA", nome: "Maranhão", capital: "São Luís", lat: -2.53, lon: -44.3, regiao: "Nordeste" },
  { sigla: "PB", nome: "Paraíba", capital: "João Pessoa", lat: -7.12, lon: -34.86, regiao: "Nordeste" },
  { sigla: "PE", nome: "Pernambuco", capital: "Recife", lat: -8.05, lon: -34.9, regiao: "Nordeste" },
  { sigla: "PI", nome: "Piauí", capital: "Teresina", lat: -5.09, lon: -42.8, regiao: "Nordeste" },
  { sigla: "RN", nome: "Rio Grande do Norte", capital: "Natal", lat: -5.79, lon: -35.21, regiao: "Nordeste" },
  { sigla: "SE", nome: "Sergipe", capital: "Aracaju", lat: -10.91, lon: -37.07, regiao: "Nordeste" },

  { sigla: "DF", nome: "Distrito Federal", capital: "Brasília", lat: -15.78, lon: -47.93, regiao: "Centro-Oeste" },
  { sigla: "GO", nome: "Goiás", capital: "Goiânia", lat: -16.68, lon: -49.25, regiao: "Centro-Oeste" },
  { sigla: "MT", nome: "Mato Grosso", capital: "Cuiabá", lat: -15.6, lon: -56.1, regiao: "Centro-Oeste" },
  { sigla: "MS", nome: "Mato Grosso do Sul", capital: "Campo Grande", lat: -20.44, lon: -54.65, regiao: "Centro-Oeste" },

  { sigla: "ES", nome: "Espírito Santo", capital: "Vitória", lat: -20.32, lon: -40.34, regiao: "Sudeste" },
  { sigla: "MG", nome: "Minas Gerais", capital: "Belo Horizonte", lat: -19.92, lon: -43.94, regiao: "Sudeste" },
  { sigla: "RJ", nome: "Rio de Janeiro", capital: "Rio de Janeiro", lat: -22.91, lon: -43.17, regiao: "Sudeste" },
  { sigla: "SP", nome: "São Paulo", capital: "São Paulo", lat: -23.55, lon: -46.63, regiao: "Sudeste" },

  { sigla: "PR", nome: "Paraná", capital: "Curitiba", lat: -25.43, lon: -49.27, regiao: "Sul" },
  { sigla: "RS", nome: "Rio Grande do Sul", capital: "Porto Alegre", lat: -30.03, lon: -51.23, regiao: "Sul" },
  { sigla: "SC", nome: "Santa Catarina", capital: "Florianópolis", lat: -27.6, lon: -48.55, regiao: "Sul" },
];

export const regioesEmOrdem = [
  "Norte",
  "Nordeste",
  "Centro-Oeste",
  "Sudeste",
  "Sul",
] as const;
`
);

writeFile(
  "app/tempo-real/page.tsx",
  `"use client";

import { useEffect, useState } from "react";
import { estados, regioesEmOrdem } from "../../lib/estados";

type Temperaturas = Record<string, number | null>;

const INTERVALO_ATUALIZACAO_MS = 10 * 60 * 1000; // 10 minutos

export default function TempoRealPage() {
  const [temperaturas, setTemperaturas] = useState<Temperaturas>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(
    null
  );

  async function buscarTemperaturas() {
    try {
      setErro(null);

      const latitudes = estados.map((e) => e.lat).join(",");
      const longitudes = estados.map((e) => e.lon).join(",");

      const url = \`https://api.open-meteo.com/v1/forecast?latitude=\${latitudes}&longitude=\${longitudes}&current=temperature_2m&timezone=America%2FSao_Paulo\`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Falha ao buscar temperaturas");

      const data = await response.json();

      const novasTemperaturas: Temperaturas = {};
      estados.forEach((estado, index) => {
        const item = Array.isArray(data) ? data[index] : data;
        novasTemperaturas[estado.sigla] =
          item?.current?.temperature_2m ?? null;
      });

      setTemperaturas(novasTemperaturas);
      setUltimaAtualizacao(new Date());
    } catch {
      setErro(
        "Não foi possível carregar as temperaturas agora. Tentando de novo em breve."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    buscarTemperaturas();
    const intervalo = setInterval(buscarTemperaturas, INTERVALO_ATUALIZACAO_MS);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <main>
      <h1 className="text-3xl font-bold text-slate-900">
        Temperatura em tempo real no Brasil
      </h1>
      <p className="mt-2 text-slate-600">
        Temperatura atual nas capitais de todos os 27 estados, atualizada
        automaticamente a cada 10 minutos.
      </p>

      {ultimaAtualizacao && (
        <p className="mt-1 text-xs text-slate-400">
          Última atualização:{" "}
          {ultimaAtualizacao.toLocaleTimeString("pt-BR")}
        </p>
      )}

      {erro && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {erro}
        </p>
      )}

      {carregando && Object.keys(temperaturas).length === 0 ? (
        <p className="mt-8 text-slate-500">Carregando temperaturas...</p>
      ) : (
        <div className="mt-8 space-y-8">
          {regioesEmOrdem.map((regiao) => (
            <section key={regiao}>
              <h2 className="mb-3 text-lg font-semibold text-slate-800">
                {regiao}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {estados
                  .filter((estado) => estado.regiao === regiao)
                  .map((estado) => {
                    const temp = temperaturas[estado.sigla];
                    return (
                      <div
                        key={estado.sigla}
                        className="rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm"
                      >
                        <p className="text-xs font-medium text-slate-500">
                          {estado.sigla}
                        </p>
                        <p className="truncate text-sm text-slate-700">
                          {estado.capital}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-sky-700">
                          {temp !== null && temp !== undefined
                            ? \`\${Math.round(temp)}°C\`
                            : "--"}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
`
);

writeFile(
  "app/layout.tsx",
  `import type { Metadata } from "next";
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
      <body className={\`\${inter.className} bg-slate-50 text-slate-800\`}>
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-bold text-sky-700">
              Clima Brasil
            </Link>
            <div className="flex gap-6 text-sm font-medium text-slate-600">
              <Link href="/blog" className="hover:text-sky-700">
                Blog
              </Link>
              <Link href="/tempo-real" className="hover:text-sky-700">
                Tempo Real
              </Link>
              <Link href="/sobre" className="hover:text-sky-700">
                Sobre
              </Link>
              <Link href="/contato" className="hover:text-sky-700">
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
`
);

console.log("");
console.log("Pronto! Página de tempo real criada em:", process.cwd());
