
const fs = require("fs");
const path = require("path");

function writeFile(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
  console.log("atualizado:", p);
}

function appendFile(p, content) {
  fs.appendFileSync(p, "\n" + content, "utf8");
  console.log("estilos adicionados em:", p);
}

console.log("Aplicando design (Tailwind) no site...");

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

writeFile(
  "app/page.tsx",
  `import Link from "next/link";
import { posts } from "../lib/posts";

export const metadata = {
  title: "Clima Brasil - Tudo sobre o tempo no país",
  description:
    "Notícias e explicações sobre o clima no Brasil: previsões, alertas de desastres naturais e informações meteorológicas atualizadas.",
};

export default function Home() {
  return (
    <main>
      <h1 className="text-3xl font-bold text-slate-900">Clima Brasil</h1>
      <p className="mt-2 text-slate-600">
        Tudo sobre o tempo e o clima no Brasil.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-800">
          Últimos posts
        </h2>
        <ul className="mt-4 space-y-3">
          {posts
            .filter((post) => post.slug !== "melhores-epocas-viajar-brasil")
            .map((post) => (
              <li key={post.slug}>
                <Link
                  href={\`/blog/\${post.slug}\`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-sky-300 hover:shadow-sm"
                >
                  <span className="font-medium text-sky-700">
                    {post.title}
                  </span>
                </Link>
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
  title: "Blog — Clima Brasil",
  description:
    "Todos os posts sobre clima e meteorologia no Brasil: previsões, fenômenos climáticos e análises por região.",
};

export default function BlogListPage() {
  return (
    <main>
      <h1 className="text-3xl font-bold text-slate-900">Blog</h1>
      <p className="mt-2 text-slate-600">
        Todos os posts sobre clima e meteorologia no Brasil.
      </p>

      <ul className="mt-8 space-y-3">
        {posts
          .filter((post) => post.slug !== "melhores-epocas-viajar-brasil")
          .map((post) => (
            <li key={post.slug}>
              <Link
                href={\`/blog/\${post.slug}\`}
                className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-sky-300 hover:shadow-sm"
              >
                <span className="font-medium text-sky-700">{post.title}</span>
              </Link>
            </li>
          ))}
      </ul>
    </main>
  );
}
`
);

writeFile(
  "app/blog/[slug]/page.tsx",
  `import { notFound } from "next/navigation";
import { posts } from "../../../lib/posts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((post) => post.slug === slug);

  if (!post) {
    return { title: "Post não encontrado" };
  }
  return {
    title: post.title,
    description: post.meta_description ?? undefined,
    openGraph: {
      title: post.title,
      description: post.meta_description ?? undefined,
      url: \`\${process.env.SITE_URL}/blog/\${post.slug}\`,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.published_at,
    dateModified: post.updated_at,
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="text-3xl font-bold leading-tight text-slate-900">
        {post.title}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Publicado em{" "}
        {new Date(post.published_at).toLocaleDateString("pt-BR")}
      </p>

      <div
        className="post-content mt-8 space-y-4 text-slate-700"
        dangerouslySetInnerHTML={{ __html: post.content_html }}
      />
    </article>
  );
}
`
);

writeFile(
  "app/sobre/page.tsx",
  `export const metadata = {
  title: "Sobre — Clima Brasil",
  description:
    "Conheça o Clima Brasil, um blog dedicado a explicar o clima e a meteorologia do país de forma simples.",
};

export default function SobrePage() {
  return (
    <main>
      <h1 className="text-3xl font-bold text-slate-900">
        Sobre o Clima Brasil
      </h1>
      <p className="mt-4 leading-relaxed text-slate-700">
        O Clima Brasil é um blog dedicado a explicar, de forma simples e
        acessível, os fenômenos climáticos e meteorológicos que afetam o
        país. Aqui você encontra análises sobre chuvas, secas, El Niño, La
        Niña e as particularidades do clima em cada região do Brasil.
      </p>
    </main>
  );
}
`
);

writeFile(
  "app/contato/page.tsx",
  `export const metadata = {
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
          className="text-sky-700 underline hover:text-sky-800"
        >
          contato@climabrasil.com.br
        </a>
        .
      </p>
    </main>
  );
}
`
);

const globalsPath = "app/globals.css";
const stylesToAdd = `.post-content h2 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
}

.post-content p {
  margin-bottom: 1rem;
  line-height: 1.7;
}

.post-content strong {
  color: #0369a1;
}
`;

if (fs.existsSync(globalsPath)) {
  const current = fs.readFileSync(globalsPath, "utf8");
  if (!current.includes(".post-content")) {
    appendFile(globalsPath, stylesToAdd);
  } else {
    console.log("globals.css já tinha os estilos, não duplicado.");
  }
} else {
  console.log("AVISO: não achei app/globals.css -- crie manualmente com esses estilos:");
  console.log(stylesToAdd);
}

console.log("");
console.log("Pronto! Design aplicado em:", process.cwd());
