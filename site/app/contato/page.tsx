export const metadata = {
  title: "Contato - Clima Brasil",
  description: "Entre em contato com o Clima Brasil",
};

export default function ContatoPage() {
  return (
    <main>
      <h1>Contato</h1>
      <p>
        Quer entrar em contato com Clima Brasil? Envie um e-mail para{""}
        <a href="mailto:contato@climabrasil.com.br">
          contato@climabrasil.com.br
        </a>
        .
      </p>
    </main>
  );
}