import Link from "next/link";
import { posts } from "../../lib/posts";

export const metadata = {
  title: "Blog - Clima do Brasil",
  description: "Todos os posts sobre clima e meteorologia no Brasil: previsões, fenômenos climáticos e análises por região.",
};

export default function BlogListPage () {
  return (
    <main>
      <h1>Blog</h1>
      <p>Todos os posts sobre clima e meteorologia no Brasil</p>
      <ul>
       {posts
          .filter((post) => post.slug !== "melhores-epocas-viajar-brasil")
          .map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </li>
          ))}
      </ul>
    </main>
  )
}

