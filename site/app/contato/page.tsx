export const metadata = {
  title: "Contato — Clima Brasil",
  description: "Entre em contato com o Clima Brasil.",
};

export default function ContatoPage() {
  return (
    <main>
      <h1 className="text-3xl font-bold text-slate-900">Contato</h1>
      <p className="mt-4 leading-relaxed text-slate-700">
        Quer entrar em contato com o Clima Brasil? Mande um e-mail para{" "}
        <a
          href="mailto:contato@climabrasil.com.br"
          className="text-green-700 underline hover:text-green-800"
        >
          contato@climabrasil.com.br
        </a>
        .
      </p>
    </main>
  );
}
