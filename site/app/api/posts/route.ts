// TODO: GET /api/posts?page=1&per_page=20
// Retornar lista paginada de posts (ver formato no PDF do teste, Parte 4.3).
// Lembrar: header de cache.
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // TODO: implementar paginação e leitura de lib/posts.ts
  return NextResponse.json({ posts: [] });
}
