import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

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