import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(scriptDirectory, "..");
const templatePath = path.join(rootDirectory, "site", "page.template.html");
const localesPath = path.join(rootDirectory, "site", "locales.json");
const baseUrl = "https://easebeyond.com/";
const isCheckMode = process.argv.includes("--check");

const template = fs.readFileSync(templatePath, "utf8");
const locales = JSON.parse(fs.readFileSync(localesPath, "utf8"));

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function getLocaleUrl(locale) {
  return locale.path ? `${baseUrl}${locale.path}/` : baseUrl;
}

function createAlternateLinks() {
  const links = locales.map((locale) =>
    `  <link rel="alternate" hreflang="${locale.code}" href="${getLocaleUrl(locale)}">`);
  links.push(`  <link rel="alternate" hreflang="x-default" href="${baseUrl}">`);
  return links.join("\n");
}

function createLanguageNavigation(currentLocale) {
  return locales
    .filter((locale) => locale.code !== currentLocale.code)
    .map((locale) => `<a href="${getLocaleUrl(locale)}">${escapeHtml(locale.label)}</a>`)
    .join(" · ");
}

function createIntroBlock(locale) {
  if (!locale.showIntro) {
    return "";
  }

  return `  <details id="intro" class="intro" open>
    <summary>${escapeHtml(locale.introLabel)}</summary>
    <h1>${escapeHtml(locale.heading)}</h1>
    <p>${escapeHtml(locale.body)}</p>
    <nav>${createLanguageNavigation(locale)}</nav>
  </details>`;
}

function createIntroScript(locale) {
  if (!locale.showIntro) {
    return "";
  }

  return `  <script>
    document.querySelector("#game").addEventListener("load", function () {
      window.setTimeout(function () {
        document.querySelector("#intro").removeAttribute("open");
      }, 1200);
    });
  </script>`;
}

function createStructuredData(locale) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: "Easebeyond",
    url: getLocaleUrl(locale),
    description: locale.shortDescription,
    applicationCategory: "Game",
    gamePlatform: "Web Browser",
    inLanguage: locale.code,
    isAccessibleForFree: true
  }, null, 4).split("\n").map((line) => `    ${line}`).join("\n");
}

function renderPage(locale) {
  const assetPrefix = locale.path ? "../" : "./";
  const values = {
    HTML_LANG: locale.htmlLang,
    TITLE: escapeHtml(locale.title),
    DESCRIPTION: escapeHtml(locale.description),
    CANONICAL_URL: getLocaleUrl(locale),
    ALTERNATE_LINKS: createAlternateLinks(),
    OG_LOCALE: locale.ogLocale,
    SHORT_DESCRIPTION: escapeHtml(locale.shortDescription),
    STRUCTURED_DATA: createStructuredData(locale),
    ASSET_PREFIX: assetPrefix,
    IFRAME_TITLE: escapeHtml(locale.iframeTitle),
    INTRO_BLOCK: createIntroBlock(locale),
    INTRO_SCRIPT: createIntroScript(locale)
  };

  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template);
}

function renderSitemap() {
  const alternateLinks = locales.map((locale) =>
    `    <xhtml:link rel="alternate" hreflang="${locale.code}" href="${getLocaleUrl(locale)}"/>`);
  alternateLinks.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}"/>`);

  const urls = locales.map((locale) => `  <url>
    <loc>${getLocaleUrl(locale)}</loc>
${alternateLinks.join("\n")}
  </url>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

function writeOrCheck(relativePath, content) {
  const outputPath = path.join(rootDirectory, relativePath);
  const normalizedContent = `${content.trimEnd()}\n`;

  if (isCheckMode) {
    const existingContent = fs.existsSync(outputPath)
      ? fs.readFileSync(outputPath, "utf8").replaceAll("\r\n", "\n")
      : "";
    if (existingContent !== normalizedContent) {
      throw new Error(`Generated file is out of date: ${relativePath}`);
    }
    return;
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, normalizedContent, "utf8");
}

for (const locale of locales) {
  const outputPath = locale.path ? path.join(locale.path, "index.html") : "index.html";
  writeOrCheck(outputPath, renderPage(locale));
}

writeOrCheck("sitemap.xml", renderSitemap());
console.log(isCheckMode ? "Localized pages are up to date." : "Localized pages generated.");
