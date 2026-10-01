import Link from "next/link";
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
                href={`/blog/${post.slug}`}
                className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-green-300 hover:shadow-sm"
              >
                <span className="font-medium text-green-700">{post.title}</span>
              </Link>
            </li>
          ))}
      </ul>
    </main>
  );
}
