"use client";

import { useEffect, useState } from "react";
import { estados, regioesEmOrdem } from "../../lib/estados";

type PrevisaoDia = {
  data: string;
  tempMax: number;
  tempMin: number;
  chanceChuva: number;
};

type DadosEstado = {
  temperatura: number | null;
  umidade: number | null;
  vento: number | null;
  chanceChuva: number | null;
  previsao: PrevisaoDia[];
};

type DadosPorEstado = Record<string, DadosEstado>;

const INTERVALO_ATUALIZACAO_MS = 10 * 60 * 1000; // 10 minutos

export default function TempoRealPage() {
  const [dados, setDados] = useState<DadosPorEstado>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(
    null
  );
  const [expandido, setExpandido] = useState<string | null>(null);

  async function buscarDados() {
    try {
      setErro(null);

      const latitudes = estados.map((e) => e.lat).join(",");
      const longitudes = estados.map((e) => e.lon).join(",");

      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitudes}&longitude=${longitudes}` +
        `&current=temperature_2m,relative_humidity_2m,wind_speed_10m` +
        `&hourly=precipitation_probability` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&forecast_days=7&timezone=America%2FSao_Paulo`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Falha ao buscar dados");

      const data = await response.json();
      const lista = Array.isArray(data) ? data : [data];

      const novosDados: DadosPorEstado = {};

      estados.forEach((estado, index) => {
        const item = lista[index];
        if (!item) return;

        // Acha o índice da hora atual dentro do array "hourly.time",
        // pra pegar a chance de chuva mais próxima de agora.
        const horaAtualISO = new Date().toISOString().slice(0, 13); // "2026-09-29T14"
        const indiceHoraAtual: number =
          item.hourly?.time?.findIndex((t: string) =>
            t.startsWith(horaAtualISO)
          ) ?? -1;

        const chanceChuvaAgora =
          indiceHoraAtual >= 0
            ? item.hourly.precipitation_probability[indiceHoraAtual]
            : null;

        const previsao: PrevisaoDia[] = (item.daily?.time ?? []).map(
          (dataDia: string, i: number) => ({
            data: dataDia,
            tempMax: item.daily.temperature_2m_max[i],
            tempMin: item.daily.temperature_2m_min[i],
            chanceChuva: item.daily.precipitation_probability_max[i],
          })
        );

        novosDados[estado.sigla] = {
          temperatura: item.current?.temperature_2m ?? null,
          umidade: item.current?.relative_humidity_2m ?? null,
          vento: item.current?.wind_speed_10m ?? null,
          chanceChuva: chanceChuvaAgora,
          previsao,
        };
      });

      setDados(novosDados);
      setUltimaAtualizacao(new Date());
    } catch {
      setErro(
        "Não foi possível carregar os dados agora. Tentando de novo em breve."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    buscarDados();
    const intervalo = setInterval(buscarDados, INTERVALO_ATUALIZACAO_MS);
    return () => clearInterval(intervalo);
  }, []);

  function formatarDiaSemana(dataISO: string) {
    const data = new Date(`${dataISO}T12:00:00`);
    return data.toLocaleDateString("pt-BR", { weekday: "short" });
  }

  return (
    <main>
      <h1 className="text-3xl font-bold text-slate-900">
        Temperatura em tempo real no Brasil
      </h1>
      <p className="mt-2 text-slate-600">
        Temperatura, umidade, vento e chance de chuva nas capitais dos 27
        estados, com previsão para os próximos 7 dias. Clique num estado para
        ver a previsão detalhada.
      </p>

      {ultimaAtualizacao && (
        <p className="mt-1 text-xs text-slate-400">
          Última atualização: {ultimaAtualizacao.toLocaleTimeString("pt-BR")}{" "}
          -- atualiza sozinho a cada 10 minutos
        </p>
      )}

      {erro && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {erro}
        </p>
      )}

      {carregando && Object.keys(dados).length === 0 ? (
        <p className="mt-8 text-slate-500">Carregando dados...</p>
      ) : (
        <div className="mt-8 space-y-8">
          {regioesEmOrdem.map((regiao) => (
            <section key={regiao}>
              <h2 className="mb-3 text-lg font-semibold text-slate-800">
                {regiao}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {estados
                  .filter((estado) => estado.regiao === regiao)
                  .map((estado) => {
                    const d = dados[estado.sigla];
                    const estaExpandido = expandido === estado.sigla;

                    return (
                      <div
                        key={estado.sigla}
                        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <button
                          onClick={() =>
                            setExpandido(estaExpandido ? null : estado.sigla)
                          }
                          className="w-full text-left"
                        >
                          <p className="text-xs font-medium text-slate-500">
                            {estado.sigla} · {estado.capital}
                          </p>
                          <p className="mt-1 text-3xl font-bold text-sky-700">
                            {d?.temperatura != null
                              ? `${Math.round(d.temperatura)}°C`
                              : "--"}
                          </p>
                          <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-600">
                            <span>💧 {d?.umidade ?? "--"}%</span>
                            <span>🌬️ {d?.vento ?? "--"} km/h</span>
                            <span>🌧️ {d?.chanceChuva ?? "--"}%</span>
                          </div>
                        </button>

                        {estaExpandido && d && (
                          <div className="mt-4 border-t border-slate-100 pt-3">
                            <p className="mb-2 text-xs font-medium text-slate-500">
                              Próximos dias
                            </p>
                            <ul className="space-y-1">
                              {d.previsao.map((dia) => (
                                <li
                                  key={dia.data}
                                  className="flex items-center justify-between text-sm text-slate-600"
                                >
                                  <span className="capitalize">
                                    {formatarDiaSemana(dia.data)}
                                  </span>
                                  <span>
                                    {Math.round(dia.tempMin)}°-
                                    {Math.round(dia.tempMax)}°
                                  </span>
                                  <span>🌧️ {dia.chanceChuva}%</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
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
