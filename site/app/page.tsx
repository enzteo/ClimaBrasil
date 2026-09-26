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
      <h1>Clima Brasil</h1>
      <p>Tudo sobre o tempo e o clima no Brasil</p>
      <section>
        <h2>Últimos posts</h2>
        <ul>
          {posts
            .filter((post) => post.slug !== "melhores-epocas-viajar-brasil")
            .map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </li>
            ))}
        </ul>
      </section>
    </main>
  );
}