import * as cheerio from "cheerio";
import { prisma } from "./prisma";
import { IssueModule, IssueSeverity, Page } from "@prisma/client";

const SEVERITY_PENALTY: Record<IssueSeverity, number> = {
  HIGH: 8,
  MEDIUM: 4,
  LOW: 1,
};

type NewIssue = {
  module: IssueModule;
  severity: IssueSeverity;
  title: string;
  description: string;
  affectedUrl?: string;
};

function extractWordSet(html: string | null): Set<string> {
  if (!html) return new Set();
  const $ = cheerio.load(html);
  const text = $("body").text().toLowerCase();
  const words = text
    .replace(/[^\p{L}\s]/gu, " ") 
    .split(/\s+/)
    .filter((w) => w.length > 4); 
  return new Set(words);
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const word of a) {
    if (b.has(word)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export async function analyzeAuditRun(auditRunId: string): Promise<void> {
  const pages = await prisma.page.findMany({
    where: { auditRunId },
    include: { links: true },
  });

  const issues: NewIssue[] = [];

  const titleOwners = new Map<string, string[]>();  title -> urls que usam esse title

  for (const page of pages) {
    if (page.statusCode !== 200) continue; 

    if (!page.title) {
      issues.push({
        module: "ON_PAGE",
        severity: "HIGH",
        title: "Página sem <title>",
        description: `A página ${page.url} não tem tag <title>. Isso é o texto que aparece como link azul no Google e é um dos sinais mais fortes de relevância.`,
        affectedUrl: page.url,
      });
    } else {
      if (page.title.length < 30 || page.title.length > 60) {
        issues.push({
          module: "ON_PAGE",
          severity: "MEDIUM",
          title: "Title fora do tamanho recomendado",
          description: `O <title> de ${page.url} tem ${page.title.length} caracteres. O ideal é entre 30 e 60, senão o Google corta o texto no resultado de busca.`,
          affectedUrl: page.url,
        });
      }
      const owners = titleOwners.get(page.title) || [];
      owners.push(page.url);
      titleOwners.set(page.title, owners);
    }

    if (!page.metaDescription) {
      issues.push({
        module: "ON_PAGE",
        severity: "MEDIUM",
        title: "Página sem meta description",
        description: `A página ${page.url} não tem meta description. Sem ela, o Google gera um resumo automático, geralmente pior que um escrito à mão.`,
        affectedUrl: page.url,
      });
    } else if (
      page.metaDescription.length < 70 ||
      page.metaDescription.length > 160
    ) {
      issues.push({
        module: "ON_PAGE",
        severity: "LOW",
        title: "Meta description fora do tamanho recomendado",
        description: `A meta description de ${page.url} tem ${page.metaDescription.length} caracteres (ideal: 70-160).`,
        affectedUrl: page.url,
      });
    }

    if (page.h1Count === 0) {
      issues.push({
        module: "ON_PAGE",
        severity: "HIGH",
        title: "Página sem H1",
        description: `A página ${page.url} não tem nenhum <h1>. O H1 ajuda o Google (e o usuário) a entender do que a página trata.`,
        affectedUrl: page.url,
      });
    } else if (page.h1Count > 1) {
      issues.push({
        module: "ON_PAGE",
        severity: "MEDIUM",
        title: "Página com mais de um H1",
        description: `A página ${page.url} tem ${page.h1Count} tags <h1>. O recomendado é exatamente uma por página, pra não diluir o sinal de qual é o assunto principal.`,
        affectedUrl: page.url,
      });
    }

    if (page.imagesWithoutAltCount > 0) {
      issues.push({
        module: "ON_PAGE",
        severity: "LOW",
        title: "Imagens sem texto alternativo (alt)",
        description: `A página ${page.url} tem ${page.imagesWithoutAltCount} imagem(ns) sem atributo "alt". Isso prejudica acessibilidade e SEO de imagens.`,
        affectedUrl: page.url,
      });
    }

    if (page.incomingLinks === 0 && page.depth > 0) {
      issues.push({
        module: "ON_PAGE",
        severity: "MEDIUM",
        title: "Página órfã",
        description: `Nenhuma outra página do site linka para ${page.url}. Páginas órfãs são mais difíceis do Google encontrar e indexar.`,
        affectedUrl: page.url,
      });
    }
  }

  for (const [title, urls] of titleOwners) {
    if (urls.length > 1) {
      issues.push({
        module: "ON_PAGE",
        severity: "HIGH",
        title: "Title duplicado entre páginas",
        description: `O título "${title}" é usado em ${urls.length} páginas: ${urls.join(", ")}. Cada página deveria ter um <title> único.`,
      });
    }
  }

  const pagesByUrl = new Map(pages.map((p) => [normalizePageUrl(p.url), p]));

  for (const page of pages) {
    if (page.statusCode && page.statusCode >= 400) {
      issues.push({
        module: "TECHNICAL",
        severity: "HIGH",
        title: `Página retornando erro ${page.statusCode}`,
        description: `A URL ${page.url} respondeu com status ${page.statusCode}.`,
        affectedUrl: page.url,
      });
    }

    if (page.statusCode === 200 && !page.canonicalUrl) {
      issues.push({
        module: "TECHNICAL",
        severity: "LOW",
        title: "Página sem tag canonical",
        description: `A página ${page.url} não declara uma URL canônica.`,
        affectedUrl: page.url,
      });
    }

    if (page.hasNoindex) {
      issues.push({
        module: "TECHNICAL",
        severity: "HIGH",
        title: "Página marcada como noindex",
        description: `A página ${page.url} tem meta robots "noindex" -- ela não vai aparecer no Google. Confirme se isso foi intencional.`,
        affectedUrl: page.url,
      });
    }

    if (!page.hasViewportMeta && page.statusCode === 200) {
      issues.push({
        module: "TECHNICAL",
        severity: "MEDIUM",
        title: "Página sem meta viewport",
        description: `A página ${page.url} não declara meta viewport, o que prejudica a exibição em celulares.`,
        affectedUrl: page.url,
      });
    }

    if (page.depth > 3) {
      issues.push({
        module: "TECHNICAL",
        severity: "LOW",
        title: "Página muito profunda",
        description: `A página ${page.url} está a ${page.depth} cliques da home. Páginas muito profundas são rastreadas com menos frequência pelo Google.`,
        affectedUrl: page.url,
      });
    }

    for (const link of page.links) {
      if (!link.isInternal) continue;
      const target = pagesByUrl.get(normalizePageUrl(link.toUrl));
      if (target && target.statusCode && target.statusCode >= 400) {
        issues.push({
          module: "TECHNICAL",
          severity: "HIGH",
          title: "Link interno quebrado",
          description: `A página ${page.url} tem um link para ${link.toUrl}, que retorna status ${target.statusCode}.`,
          affectedUrl: page.url,
        });
      }
    }
  }

  for (const page of pages) {
    if (page.statusCode !== 200) continue;

    if (page.wordCount > 0 && page.wordCount < 300) {
      issues.push({
        module: "CONTENT",
        severity: "MEDIUM",
        title: "Conteúdo fino (thin content)",
        description: `A página ${page.url} tem apenas ${page.wordCount} palavras. Páginas com menos de 300 palavras tendem a rankear pior.`,
        affectedUrl: page.url,
      });
    }
  }

  const wordSets = pages.map((p) => ({
    page: p,
    words: extractWordSet(p.html),
  }));

  const alreadyFlaggedPairs = new Set<string>();

  for (let i = 0; i < wordSets.length; i++) {
    for (let j = i + 1; j < wordSets.length; j++) {
      const a = wordSets[i];
      const b = wordSets[j];
      if (a.page.statusCode !== 200 || b.page.statusCode !== 200) continue;

      const similarity = jaccardSimilarity(a.words, b.words);
      if (similarity > 0.35) {
        const pairKey = [a.page.url, b.page.url].sort().join("|");
        if (alreadyFlaggedPairs.has(pairKey)) continue;
        alreadyFlaggedPairs.add(pairKey);

        issues.push({
          module: "CONTENT",
          severity: "HIGH",
          title: "Possível canibalização de palavra-chave",
          description: `As páginas ${a.page.url} e ${b.page.url} têm conteúdo ${Math.round(
            similarity * 100
          )}% parecido (por similaridade de palavras). Isso sugere que estão disputando a mesma busca no Google.`,
          affectedUrl: a.page.url,
        });
      }
    }
  }

  await prisma.issue.createMany({
    data: issues.map((issue) => ({
      auditRunId,
      module: issue.module,
      severity: issue.severity,
      title: issue.title,
      description: issue.description,
      affectedUrl: issue.affectedUrl,
    })),
  });

  let score = 100;
  for (const issue of issues) {
    score -= SEVERITY_PENALTY[issue.severity];
  }
  score = Math.max(0, score);

  await prisma.auditRun.update({
    where: { id: auditRunId },
    data: {
      status: "DONE",
      overallScore: score,
      finishedAt: new Date(),
    },
  });
}

function normalizePageUrl(url: string): string {
  try {
    const u = new URL(url);
    let path = u.pathname;
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    return `${u.origin}${path}`;
  } catch {
    return url;
  }
}