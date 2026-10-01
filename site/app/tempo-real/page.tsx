"use client";

import { useEffect, useState } from "react";
import { estados, type Estado } from "../../lib/estados";

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

const INTERVALO_ATUALIZACAO_MS = 10 * 60 * 1000;

const LON_MIN = -74;
const LON_MAX = -34;
const LAT_MAX = 6;
const LAT_MIN = -34;

function posicaoNoMapa(lat: number, lon: number) {
  const left = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * 100;
  const top = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100;
  return { left, top };
}

export default function TempoRealPage() {
  const [dados, setDados] = useState<DadosPorEstado>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(
    null
  );
  const [selecionado, setSelecionado] = useState<Estado | null>(null);

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

        const horaAtualISO = new Date().toISOString().slice(0, 13);
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

  const dadosSelecionado = selecionado ? dados[selecionado.sigla] : null;

  return (
    <main>
      <h1 className="text-3xl font-bold text-slate-900">
        Temperatura em tempo real no Brasil
      </h1>
      <p className="mt-2 text-slate-600">
        Clique num ponto do mapa para ver temperatura, umidade, vento, chance
        de chuva e a previsão dos próximos 7 dias daquela capital.
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
        <div className="mt-8 grid gap-6 md:grid-cols-[1.3fr_1fr]">
          <div className="relative aspect-square w-full rounded-2xl border border-slate-200 bg-green-50">
            {estados.map((estado) => {
              const { left, top } = posicaoNoMapa(estado.lat, estado.lon);
              const d = dados[estado.sigla];
              const ativo = selecionado?.sigla === estado.sigla;

              return (
                <button
                  key={estado.sigla}
                  onClick={() => setSelecionado(estado)}
                  style={{ left: `${left}%`, top: `${top}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 text-[10px] font-bold transition
                    ${
                      ativo
                        ? "z-10 h-7 w-7 border-green-700 bg-green-700 text-white"
                        : "h-5 w-5 border-green-600 bg-white text-green-700 hover:bg-green-100"
                    }`}
                  title={`${estado.capital} (${estado.sigla})${
                    d?.temperatura != null ? ` -- ${Math.round(d.temperatura)}°C` : ""
                  }`}
                >
                  {estado.sigla}
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            {!selecionado ? (
              <p className="text-sm text-slate-500">
                Clique em um ponto do mapa para ver os detalhes da capital.
              </p>
            ) : (
              <div>
                <p className="text-xs font-medium text-slate-500">
                  {selecionado.sigla} · {selecionado.nome}
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {selecionado.capital}
                </p>

                <p className="mt-2 text-4xl font-bold text-green-700">
                  {dadosSelecionado?.temperatura != null
                    ? `${Math.round(dadosSelecionado.temperatura)}°C`
                    : "--"}
                </p>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
                  <div className="rounded-md bg-slate-50 p-2">
                    <p>💧 Umidade</p>
                    <p className="font-semibold text-slate-800">
                      {dadosSelecionado?.umidade ?? "--"}%
                    </p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-2">
                    <p>🌬️ Vento</p>
                    <p className="font-semibold text-slate-800">
                      {dadosSelecionado?.vento ?? "--"} km/h
                    </p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-2">
                    <p>🌧️ Chuva</p>
                    <p className="font-semibold text-slate-800">
                      {dadosSelecionado?.chanceChuva ?? "--"}%
                    </p>
                  </div>
                </div>

                {dadosSelecionado && (
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="mb-2 text-xs font-medium text-slate-500">
                      Próximos 7 dias
                    </p>
                    <ul className="space-y-1">
                      {dadosSelecionado.previsao.map((dia) => (
                        <li
                          key={dia.data}
                          className="flex items-center justify-between text-sm text-slate-600"
                        >
                          <span className="capitalize">
                            {formatarDiaSemana(dia.data)}
                          </span>
                          <span>
                            {Math.round(dia.tempMin)}°-{Math.round(dia.tempMax)}°
                          </span>
                          <span>🌧️ {dia.chanceChuva}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
