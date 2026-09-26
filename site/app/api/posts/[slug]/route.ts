import { NextResponse } from "next/server";
import { posts } from "../../../../lib/posts";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}