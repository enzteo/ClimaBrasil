
const fs = require("fs");
const path = require("path");

function writeFile(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
  console.log("atualizado:", p);
}

console.log("Aplicando o novo tema (pets) no site...");

writeFile(
  "lib/posts.ts",
  `// Metadados dos 5 posts (título, slug, keyword-alvo).
// Problemas plantados:
// - post "chip-identificacao-pets": NÃO linkar de nenhum outro lugar (órfão)
// - posts "gps-vs-bluetooth-pets" e "coleira-gps-ou-bluetooth": mesma keyword-alvo (canibalização)
// - post "coleira-gps-ou-bluetooth": sem meta_description (proposital)
// - título da Home = título do post "como-funciona-coleira-gps" (duplicado proposital)

export type Post = {
  slug: string;
  title: string;
  keyword: string;
  meta_description: string | null;
  published_at: string;
  updated_at: string;
  content_html: string;
};

export const posts: Post[] = [
  {
    slug: "como-funciona-coleira-gps",
    title: "Como funciona uma coleira GPS para pets",
    keyword: "coleira gps para pets",
    meta_description:
      "Entenda como funciona uma coleira GPS para pets, como ela envia a localização do animal e por que o histórico de movimentação é importante.",
    published_at: "2026-09-29T10:00:00-03:00",
    updated_at: "2026-09-29T10:00:00-03:00",
    content_html:
      "<p>Uma <strong>coleira GPS para pets</strong> é um dos equipamentos mais usados hoje para aumentar a segurança de cães e gatos que passam parte do dia soltos no quintal ou em passeios sem guia.</p><h2>Como a coleira envia a localização</h2><p>A coleira inteligente possui um chip que envia periodicamente as informações de localização do pet para um sistema central. Cada envio fica armazenado com latitude, longitude, data e horário, formando um histórico de movimentação completo ao longo do dia.</p><h2>Consultando a localização a qualquer momento</h2><p>Com esses dados salvos em um banco de dados, o tutor consegue consultar a última localização registrada do animal quando quiser, direto pelo celular ou computador, sem depender apenas de lembrar onde o viu pela última vez antes de sair de casa.</p><h2>Por que o histórico de movimentação importa</h2><p>Além da localização mais recente, o histórico mostra por onde o pet passou ao longo do tempo. Isso ajuda a identificar padrões de comportamento, como rotas que ele costuma seguir quando sai do quintal, o que facilita bastante a busca em caso de fuga.</p><h2>O que considerar antes de comprar</h2><p>Autonomia da bateria, alcance do sinal e frequência de atualização da localização são pontos que variam bastante entre modelos de coleira GPS. Vale pesquisar essas especificações antes de escolher, principalmente se o pet costuma se afastar por longos períodos.</p><p>Entender como funciona uma coleira GPS para pets é o primeiro passo para escolher a solução certa e montar uma rotina de segurança mais eficiente para o seu animal.</p>",
  },
  {
    slug: "pet-fugiu-o-que-fazer",
    title: "O que fazer quando seu pet foge de casa",
    keyword: "pet fugiu o que fazer",
    meta_description:
      "Veja o que fazer quando seu pet foge de casa: como usar a última localização registrada e o histórico de movimentação para direcionar a busca.",
    published_at: "2026-09-29T10:00:00-03:00",
    updated_at: "2026-09-29T10:00:00-03:00",
    content_html:
      "<p>Descobrir que o pet fugiu de casa é um dos momentos mais angustiantes para qualquer tutor. Saber exatamente <strong>o que fazer quando o pet foge</strong> ajuda a agir rápido e aumenta as chances de encontrá-lo em segurança.</p><h2>O primeiro passo: checar a última localização</h2><p>Se o animal usa uma coleira com rastreamento, o primeiro passo é verificar a última localização registrada pelo sistema. Isso já dá uma direção inicial de busca, em vez de sair procurando ao acaso pela vizinhança.</p><h2>Use o histórico de movimentação a seu favor</h2><p>Além da última posição, o histórico de movimentação mostra por onde o pet passou nas horas anteriores. Cruzando esses pontos, dá para identificar um trajeto provável e concentrar a busca nesse caminho, em vez de cobrir uma área grande demais.</p><h2>Outras ações importantes</h2><p>Avisar vizinhos, postar em grupos de bairro e verificar abrigos e clínicas veterinárias próximas também aumenta as chances de recuperação, principalmente quando o pet não tem coleira com rastreamento ou o sinal foi perdido em algum ponto do trajeto.</p><h2>Prevenindo novas fugas</h2><p>Depois de encontrar o pet, vale revisar os pontos de fuga: portões mal fechados, telas soltas ou cercas baixas costumam ser as causas mais comuns. Pequenos ajustes na rotina de segurança evitam que a situação se repita.</p><p>Ter um sistema de rastreamento configurado antes que o pet fuja é sempre a melhor estratégia — ele transforma um momento de pânico em uma busca direcionada e muito mais rápida.</p>",
  },
  {
    slug: "chip-identificacao-pets",
    title: "Chip de identificação: como funciona e por que importa",
    keyword: "chip de identificação para pets",
    meta_description:
      "Entenda como funciona o chip de identificação em coleiras de pets e por que o código exclusivo de cada animal evita erros no sistema.",
    published_at: "2026-09-29T10:00:00-03:00",
    updated_at: "2026-09-29T10:00:00-03:00",
    content_html:
      "<p>O <strong>chip de identificação para pets</strong> é a peça que garante que cada animal seja reconhecido de forma única dentro de um sistema de rastreamento, evitando confusão entre os dados de diferentes bichos.</p><h2>Como funciona o código exclusivo</h2><p>Cada coleira inteligente possui um código de identificação associado a apenas um pet. Esse código funciona de forma parecida com um CPF: assim como não existem duas pessoas com o mesmo número, não existem duas coleiras com o mesmo código dentro do sistema.</p><h2>O que acontece sem essa exclusividade</h2><p>Se dois animais compartilhassem o mesmo código de identificação, o sistema misturaria os registros de localização dos dois, gerando um histórico de movimentação inconsistente e inútil para qualquer um dos tutores.</p><h2>Onde o chip se encaixa no sistema</h2><p>O chip fica embutido na coleira e é a referência usada toda vez que uma nova localização é registrada no banco de dados. Sem ele, não haveria como saber a qual pet pertence cada ponto de latitude e longitude enviado.</p><h2>Cuidados com o chip e a coleira</h2><p>Verificar periodicamente se o código de identificação está correto e se a coleira está bem ajustada no pet evita falhas de leitura e garante que os dados de localização continuem sendo registrados corretamente ao longo do tempo.</p><p>Entender o papel do chip de identificação ajuda a compreender por que a estrutura de dados por trás de um sistema de rastreamento de pets precisa ser bem planejada desde o início.</p>",
  },
  {
    slug: "gps-vs-bluetooth-pets",
    title: "Diferença entre rastreadores GPS e Bluetooth para pets",
    keyword: "rastreador gps para pets",
    meta_description:
      "Veja a diferença entre rastreadores GPS e Bluetooth para pets, e qual tecnologia faz mais sentido para cada situação.",
    published_at: "2026-09-29T10:00:00-03:00",
    updated_at: "2026-09-29T10:00:00-03:00",
    content_html:
      "<p>Na hora de escolher um <strong>rastreador GPS para pets</strong>, muitos tutores esbarram em outra opção parecida: os rastreadores por Bluetooth. Entender a diferença entre as duas tecnologias ajuda a escolher a certa para cada situação.</p><h2>Como funciona o rastreamento por GPS</h2><p>O GPS permite obter a localização do pet por meio de coordenadas de latitude e longitude, funcionando bem em áreas grandes e abertas. É a opção mais indicada para quem quer acompanhar o pet em passeios longos ou em regiões onde ele pode se afastar bastante de casa.</p><h2>Como funciona o rastreamento por Bluetooth</h2><p>Já o Bluetooth funciona principalmente em distâncias curtas, dependendo da proximidade de um dispositivo conectado, como o celular do tutor. É uma opção mais barata e com bateria que dura mais, mas perde a eficiência assim que o pet se afasta além do alcance do sinal.</p><h2>Qual escolher para o seu pet</h2><p>Para pets que ficam em áreas cercadas e não costumam ir longe, o Bluetooth pode ser suficiente. Já para animais que têm hábito de fugir ou passeiam em áreas amplas, o GPS oferece uma cobertura de rastreamento muito mais confiável.</p><h2>Existe uma opção que combina as duas?</h2><p>Alguns modelos de coleira já combinam as duas tecnologias, usando Bluetooth para economizar bateria no dia a dia e ativando o GPS apenas quando o pet se afasta de uma área pré-definida, unindo o melhor dos dois mundos.</p><p>Conhecer as diferenças entre rastreador GPS e Bluetooth para pets é essencial para investir no equipamento certo, de acordo com a rotina do seu animal.</p>",
  },
  {
    slug: "coleira-gps-ou-bluetooth",
    title: "Coleira GPS ou Bluetooth: qual escolher para o seu pet",
    keyword: "rastreador gps para pets",
    meta_description: null,
    published_at: "2026-09-29T10:00:00-03:00",
    updated_at: "2026-09-29T10:00:00-03:00",
    content_html:
      "<p>Escolher entre uma <strong>coleira GPS ou Bluetooth</strong> é uma das primeiras decisões de quem quer começar a rastrear a localização do próprio pet. As duas tecnologias resolvem o mesmo problema de formas diferentes.</p><h2>O que o GPS oferece</h2><p>Um rastreador GPS permite acompanhar a localização do pet por coordenadas, funcionando bem mesmo quando o animal se afasta bastante de casa. É a opção mais indicada para quem tem cães que passeiam em áreas grandes ou costumam fugir com frequência.</p><h2>O que o Bluetooth oferece</h2><p>O Bluetooth, por outro lado, depende da proximidade de um dispositivo conectado e funciona melhor em distâncias curtas. Costuma ser mais barato e ter uma bateria com duração maior, sendo uma boa opção para pets que não costumam se afastar muito.</p><h2>Pontos para comparar antes de decidir</h2><p>Alcance do sinal, duração da bateria, custo do equipamento e a rotina do próprio pet são os principais fatores a considerar. Um pet que só circula dentro de casa tem necessidades bem diferentes de um que passeia em parques ou áreas rurais.</p><h2>Vale a pena ter as duas tecnologias?</h2><p>Para quem busca mais segurança, combinar as duas tecnologias em um único dispositivo pode valer a pena, já que uma cobre as limitações da outra dependendo da distância em que o pet está do tutor.</p><p>No fim, a escolha entre coleira GPS ou Bluetooth depende do comportamento do seu pet e do nível de segurança que você quer ter na hora de localizá-lo.</p>",
  },
];
`
);

writeFile(
  "app/page.tsx",
  `import Link from "next/link";
import { posts } from "../lib/posts";

export const metadata = {
  title: "Como funciona uma coleira GPS para pets",
  description:
    "Tudo sobre rastreamento, GPS, Bluetooth e segurança para o seu pet.",
};

export default function Home() {
  return (
    <main>
      <h1>Pet Rastreio</h1>
      <p>Tudo sobre rastreamento e segurança para o seu pet.</p>
      <section>
        <h2>Últimos posts</h2>
        <ul>
          {posts
            .filter((post) => post.slug !== "chip-identificacao-pets")
            .map((post) => (
              <li key={post.slug}>
                <Link href={\`/blog/\${post.slug}\`}>{post.title}</Link>
              </li>
            ))}
        </ul>
      </section>
    </main>
  );
}
`
);

writeFile(
  "app/blog/page.tsx",
  `import Link from "next/link";
import { posts } from "../../lib/posts";

export const metadata = {
  title: "Blog — Pet Rastreio",
  description:
    "Todos os posts sobre rastreamento, GPS, Bluetooth e segurança para pets.",
};

export default function BlogListPage() {
  return (
    <main>
      <h1>Blog</h1>
      <p>Todos os posts sobre rastreamento e segurança para pets.</p>

      <ul>
        {posts
          .filter((post) => post.slug !== "chip-identificacao-pets")
          .map((post) => (
            <li key={post.slug}>
              <Link href={\`/blog/\${post.slug}\`}>{post.title}</Link>
            </li>
          ))}
      </ul>
    </main>
  );
}
`
);

console.log("");
console.log("Pronto! Tema dos pets aplicado em:", process.cwd());
