// setup-site.js
// Rode ISSO DE DENTRO da pasta "site" (a que o create-next-app criou), com:
//   node setup-site.js

const fs = require("fs");
const path = require("path");

function mkdir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
  console.log("criado:", p);
}

console.log("Criando estrutura de pastas e arquivos...");

// --- Home ---
writeFile(
  "app/page.tsx",
  `// TODO: Home do blog.
// - Listar os posts (importar de lib/posts.ts)
// - Título <title> = mesmo da home (problema plantado: duplicado com o Post 1)
export default function HomePage() {
  return (
    <main>
      {/* TODO: implementar */}
    </main>
  );
}
`
);

// --- Sobre ---
writeFile(
  "app/sobre/page.tsx",
  `// TODO: Página "Sobre" - quem escreve o blog, sobre o que é.
export default function SobrePage() {
  return (
    <main>
      {/* TODO: implementar */}
    </main>
  );
}
`
);

// --- Contato ---
writeFile(
  "app/contato/page.tsx",
  `// TODO: Página de contato (form simples ou e-mail/whatsapp).
export default function ContatoPage() {
  return (
    <main>
      {/* TODO: implementar */}
    </main>
  );
}
`
);

// --- Lista de posts ---
writeFile(
  "app/blog/page.tsx",
  `// TODO: Lista todos os posts (usar lib/posts.ts).
// Lembrar: pelo menos 1 link interno pra cada post (senão fica órfão sem querer),
// EXCETO o post que você quer deixar órfão de propósito.
export default function BlogListPage() {
  return (
    <main>
      {/* TODO: implementar */}
    </main>
  );
}
`
);

// --- Post individual (rota dinâmica) ---
writeFile(
  "app/blog/[slug]/page.tsx",
  `// TODO: Renderiza um post a partir do slug (params.slug).
// Checklist deste componente (módulo On-page vai auditar):
// - <title> único (30-60 caracteres, com a palavra-chave)
// - <meta name="description"> (70-160 caracteres) -- EXCETO no post proposital sem meta description
// - Exatamente 1 <h1> por página
// - JSON-LD (Article) no <head>
// - Open Graph: og:title, og:description, og:image
export default function PostPage({ params }: { params: { slug: string } }) {
  return (
    <article>
      {/* TODO: implementar */}
    </article>
  );
}
`
);

// --- API pública do blog: lista ---
writeFile(
  "app/api/posts/route.ts",
  `// TODO: GET /api/posts?page=1&per_page=20
// Retornar lista paginada de posts (ver formato no PDF do teste, Parte 4.3).
// Lembrar: header de cache.
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // TODO: implementar paginação e leitura de lib/posts.ts
  return NextResponse.json({ posts: [] });
}
`
);

// --- API pública do blog: post por slug ---
writeFile(
  "app/api/posts/[slug]/route.ts",
  `// TODO: GET /api/posts/{slug}
// Retornar 404 correto se o slug não existir.
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  // TODO: buscar post pelo slug, retornar 404 se não achar
  return NextResponse.json({ error: "not implemented" }, { status: 501 });
}
`
);

// --- Health check ---
writeFile(
  "app/health/route.ts",
  `// GET /health -> 200 quando o serviço está pronto.
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
`
);

// --- Dados dos posts ---
writeFile(
  "lib/posts.ts",
  `// Metadados dos 5 posts (título, slug, keyword-alvo).
// TODO: escrever o "content_html" de cada um (300+ palavras, texto de verdade).
// Lembrar dos problemas plantados:
// - post "melhores-epocas-viajar-brasil": NÃO linkar de nenhum outro lugar (órfão)
// - posts "chuvas-verao-sudeste" e "chuvas-verao-brasil-2026": mesma keyword-alvo (canibalização)
// - post "chuvas-verao-brasil-2026": sem meta_description (proposital)

export type Post = {
  slug: string;
  title: string;
  keyword: string;
  meta_description: string | null;
  published_at: string;
  updated_at: string;
  content_html: string; // TODO: preencher
};

export const posts: Post[] = [
  {
    slug: "clima-semiarido-nordeste",
    title: "Como funciona o clima semiárido do Nordeste",
    keyword: "clima semiárido nordeste",
    meta_description: "TODO: escrever, 70-160 caracteres",
    published_at: "2026-09-26T10:00:00-03:00",
    updated_at: "2026-09-26T10:00:00-03:00",
    content_html: "",
  },
  {
    slug: "el-nino-la-nina-brasil",
    title: "El Niño e La Niña: o que muda no clima do Brasil",
    keyword: "el niño la niña brasil",
    meta_description: "TODO: escrever, 70-160 caracteres",
    published_at: "2026-09-26T10:00:00-03:00",
    updated_at: "2026-09-26T10:00:00-03:00",
    content_html: "",
  },
  {
    slug: "melhores-epocas-viajar-brasil",
    title: "Melhores épocas do ano para viajar por região do Brasil",
    keyword: "melhores épocas viajar brasil",
    meta_description: "TODO: escrever, 70-160 caracteres",
    published_at: "2026-09-26T10:00:00-03:00",
    updated_at: "2026-09-26T10:00:00-03:00",
    content_html: "",
  },
  {
    slug: "chuvas-verao-sudeste",
    title: "Como as chuvas de verão afetam o Sudeste",
    keyword: "chuvas de verão sudeste",
    meta_description: "TODO: escrever, 70-160 caracteres",
    published_at: "2026-09-26T10:00:00-03:00",
    updated_at: "2026-09-26T10:00:00-03:00",
    content_html: "",
  },
  {
    slug: "chuvas-verao-brasil-2026",
    title: "Chuvas de verão no Brasil: o que esperar em 2026",
    keyword: "chuvas de verão brasil",
    meta_description: null, // proposital: problema plantado
    published_at: "2026-09-26T10:00:00-03:00",
    updated_at: "2026-09-26T10:00:00-03:00",
    content_html: "",
  },
];
`
);

// --- Dockerfile ---
writeFile(
  "Dockerfile",
  `# TODO: revisar/ajustar conforme sua versão do Next.js.
# Build multi-stage: reduz o tamanho final da imagem.

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
`
);

// --- .env.example ---
writeFile(
  ".env.example",
  `PORT=3000
SITE_URL=https://seunome.savaro.com.br
`
);

console.log("");
console.log("Pronto! Estrutura criada em:", process.cwd());
console.log("Arquivos com TODO precisam ser preenchidos por você.");
