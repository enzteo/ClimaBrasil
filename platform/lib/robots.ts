export type RobotsRules = {
  disallowedPaths: string[];
  sitemapUrls: string[];
};

export async function fetchRobotsRules(
  baseUrl: string,
  userAgent: string
): Promise<RobotsRules> {
  const disallowedPaths: string[] = [];
  const sitemapUrls: string[] = [];

  try {
    const response = await fetch(`${baseUrl}/robots.txt`, {
      headers: { "User-Agent": userAgent },
    });

    if (!response.ok) {
      return { disallowedPaths, sitemapUrls };
    }

    const text = await response.text();
    const lines = text.split("\n");

    let appliesToUs = false;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.startsWith("#") || line === "") continue;

      const [keyRaw, ...rest] = line.split(":");
      const key = keyRaw.trim().toLowerCase();
      const value = rest.join(":").trim();

      if (key === "user-agent") {
        appliesToUs = value === "*" || value.toLowerCase() === userAgent.toLowerCase();
      } else if (key === "disallow" && appliesToUs && value) {
        disallowedPaths.push(value);
      } else if (key === "sitemap" && value) {
        sitemapUrls.push(value);
      }
    }
  } catch {

  }

  return { disallowedPaths, sitemapUrls };
}

export function isPathAllowed(path: string, disallowedPaths: string[]): boolean {
  return !disallowedPaths.some((disallowed) => path.startsWith(disallowed));
}