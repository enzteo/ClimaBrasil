import { notFound } from "next/navigation";
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
      url: `${process.env.SITE_URL}/blog/${post.slug}`,
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
