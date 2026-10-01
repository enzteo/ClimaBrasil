import Link from "next/link";
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
                  href={`/blog/${post.slug}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-green-300 hover:shadow-sm"
                >
                  <span className="font-medium text-green-700">
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
