import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { crawlDomain } from "../../../lib/crawler";

export async function POST(request: Request) {
  const body = await request.json();
  const hostname: string | undefined = body?.hostname;

  if (!hostname) {
    return NextResponse.json(
      { error: "Campo 'hostname' é obrigatório (ex: meusite.com.br)" },
      { status: 400 }
    );
  }

  const domain = await prisma.domain.upsert({
    where: { hostname },
    update: {},
    create: { hostname },
  });

  const auditRun = await prisma.auditRun.create({
    data: {
      domainId: domain.id,
      status: "PENDING",
    },
  });

  crawlDomain(auditRun.id, hostname).catch(async (error) => {
    console.error("Crawler falhou:", error);
    await prisma.auditRun.update({
      where: { id: auditRun.id },
      data: { status: "FAILED" },
    });
  });

  return NextResponse.json({ auditRunId: auditRun.id }, { status: 201 });
}