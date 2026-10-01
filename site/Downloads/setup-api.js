// setup-api.js
// Rode ISSO DE DENTRO da pasta "platform" (a que tem o package.json da plataforma), com:
//   node setup-api.js

const fs = require("fs");
const path = require("path");

function writeFile(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
  console.log("criado:", p);
}

console.log("Criando rotas de API da plataforma...");

writeFile(
  "app/api/audits/route.ts",
  `import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { crawlDomain } from "../../../lib/crawler";

// POST /api/audits  { "hostname": "seunome.savaro.com.br" }
// Cria (ou reaproveita) o Domain, cria uma nova AuditRun, e dispara o crawler
// em segundo plano -- não esperamos ele terminar pra responder.
export async function POST(request: Request) {
  const body = await request.json();
  const hostname: string | undefined = body?.hostname;

  if (!hostname) {
    return NextResponse.json(
      { error: "Campo 'hostname' é obrigatório (ex: meusite.com.br)" },
      { status: 400 }
    );
  }

  // Garante que existe um Domain para esse hostname (cria se não existir)
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

  // Dispara o crawler SEM usar await -- a resposta HTTP não espera ele terminar.
  // É a versão simples do "roda em segundo plano" que o PDF pede, sem precisar
  // de uma fila de verdade (Redis/BullMQ), que seria complexidade demais pro prazo.
  crawlDomain(auditRun.id, hostname).catch(async (error) => {
    console.error("Crawler falhou:", error);
    await prisma.auditRun.update({
      where: { id: auditRun.id },
      data: { status: "FAILED" },
    });
  });

  return NextResponse.json({ auditRunId: auditRun.id }, { status: 201 });
}
`
);

writeFile(
  "app/api/audits/[id]/route.ts",
  `import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// GET /api/audits/{id} -- consulta o status e o progresso de uma auditoria.
// A tela vai chamar isso a cada poucos segundos (polling) enquanto o crawler roda.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auditRun = await prisma.auditRun.findUnique({
    where: { id },
    include: { domain: true },
  });

  if (!auditRun) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: auditRun.id,
    hostname: auditRun.domain.hostname,
    status: auditRun.status,
    pagesCrawled: auditRun.pagesCrawled,
    overallScore: auditRun.overallScore,
    startedAt: auditRun.startedAt,
    finishedAt: auditRun.finishedAt,
  });
}
`
);

console.log("");
console.log("Pronto! Rotas criadas em:", process.cwd());
