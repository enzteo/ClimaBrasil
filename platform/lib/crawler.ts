import * as cheerio from "cheerio";
import { prisma } from "./prisma";
import { fetchRobotsRules, isPathAllowed } from "./robots";

const USER_AGENT = "MeuSEOBot/1.0";
const DELAY_MS = 500; // 2 requisições por segundo = 1 a cada 500ms
const MAX_PAGES = 200;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    let path = u.pathname;
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    return `${u.origin}${path}${u.search}`;
  } catch {
    return url;
  }
}

async function fetchSitemapUrls(baseUrl: string): Promise<string[]> {
  try {
    const response = await fetch(`${baseUrl}/sitemap.xml`, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!response.ok) return [];
    const xml = await response.text();
    const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
    return matches.map((m) => m[1].trim());
  } catch {
    return [];
  }
}

// Cada item da fila agora carrega também a "profundidade" (quantos cliques da home).
type QueueItem = { url: string; depth: number };

export async function crawlDomain(auditRunId: string, hostname: string) {
  const baseUrl = `https://${hostname}`;

  await prisma.auditRun.update({
    where: { id: auditRunId },
    data: { status: "CRAWLING" },
  });

  const { disallowedPaths } = await fetchRobotsRules(baseUrl, USER_AGENT);
  const sitemapUrls = await fetchSitemapUrls(baseUrl);

  const visited = new Set<string>();
  const queue: QueueItem[] = [
    { url: normalizeUrl(baseUrl), depth: 0 },
    ...sitemapUrls.map((u) => ({ url: normalizeUrl(u), depth: 0 })),
  ];
  const incomingLinksCount = new Map<string, number>();

  let pagesCrawled = 0;

  while (queue.length > 0 && pagesCrawled < MAX_PAGES) {
    const current = queue.shift()!;
    const currentUrl = current.url;
    if (visited.has(currentUrl)) continue;

    let urlObj: URL;
    try {
      urlObj = new URL(currentUrl);
    } catch {
      continue;
    }
    if (urlObj.hostname !== hostname) continue;
    if (!isPathAllowed(urlObj.pathname, disallowedPaths)) continue;

    visited.add(currentUrl);

    const startTime = Date.now();
    let statusCode: number | null = null;
    let redirectedTo: string | null = null;
    let html = "";

    try {
      const response = await fetch(currentUrl, {
        headers: { "User-Agent": USER_AGENT },
        redirect: "follow",
      });
      statusCode = response.status;
      if (response.redirected && response.url !== currentUrl) {
        redirectedTo = response.url;
      }
      html = await response.text();
    } catch {
      statusCode = 0;
    }

    const responseTimeMs = Date.now() - startTime;

    let title: string | null = null;
    let metaDescription: string | null = null;
    let h1Count = 0;
    let wordCount = 0;
    let canonicalUrl: string | null = null;
    let hasStructuredData = false;
    let hasViewportMeta = false;
    let hasNoindex = false;
    let langAttribute: string | null = null;
    let imagesWithoutAltCount = 0;

    if (html) {
      const $ = cheerio.load(html);

      title = $("title").first().text().trim() || null;
      metaDescription =
        $('meta[name="description"]').attr("content")?.trim() || null;
      h1Count = $("h1").length;
      canonicalUrl = $('link[rel="canonical"]').attr("href") || null;
      hasStructuredData = $('script[type="application/ld+json"]').length > 0;
      hasViewportMeta = $('meta[name="viewport"]').length > 0;
      langAttribute = $("html").attr("lang") || null;

      const robotsMeta = $('meta[name="robots"]').attr("content") || "";
      hasNoindex = robotsMeta.toLowerCase().includes("noindex");

      imagesWithoutAltCount = $("img").filter((_, el) => {
        const alt = $(el).attr("alt");
        return alt === undefined || alt.trim() === "";
      }).length;

      const bodyText = $("body").text().replace(/\s+/g, " ").trim();
      wordCount = bodyText ? bodyText.split(" ").length : 0;

      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;

        let absoluteUrl: string;
        try {
          absoluteUrl = new URL(href, currentUrl).toString();
        } catch {
          return;
        }

        const normalized = normalizeUrl(absoluteUrl);
        let isInternal = false;

        try {
          isInternal = new URL(normalized).hostname === hostname;
        } catch {
          isInternal = false;
        }

        if (isInternal) {
          incomingLinksCount.set(
            normalized,
            (incomingLinksCount.get(normalized) || 0) + 1
          );
          if (
            !visited.has(normalized) &&
            !queue.some((item) => item.url === normalized)
          ) {
            queue.push({ url: normalized, depth: current.depth + 1 });
          }
        }
      });
    }

    await prisma.page.create({
      data: {
        auditRunId,
        url: currentUrl,
        statusCode,
        redirectedTo,
        responseTimeMs,
        title,
        metaDescription,
        h1Count,
        wordCount,
        canonicalUrl,
        hasStructuredData,
        hasViewportMeta,
        hasNoindex,
        langAttribute,
        imagesWithoutAltCount,
        depth: current.depth,
        html,
      },
    });

    pagesCrawled++;

    await prisma.auditRun.update({
      where: { id: auditRunId },
      data: { pagesCrawled },
    });

    await sleep(DELAY_MS);
  }

  const pages = await prisma.page.findMany({ where: { auditRunId } });
  for (const page of pages) {
    const count = incomingLinksCount.get(normalizeUrl(page.url)) || 0;
    await prisma.page.update({
      where: { id: page.id },
      data: { incomingLinks: count },
    });
  }

  await prisma.auditRun.update({
    where: { id: auditRunId },
    data: { status: "ANALYZING" },
  });

  return pagesCrawled;
}