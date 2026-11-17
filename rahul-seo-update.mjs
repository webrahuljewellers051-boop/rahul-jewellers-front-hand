
/**
 * RAHUL JEWELLERS SHEOGANJ
 * SEO UPDATE SCRIPT
 *
 * Run:
 * node rahul-seo-update.mjs
 *
 * Updates:
 * 1. Website SEO title and description
 * 2. Canonical URL
 * 3. Open Graph and Twitter metadata
 * 4. Jewellery Store structured data
 * 5. Homepage SEO introduction
 * 6. Sitemap
 * 7. Robots.txt
 *
 * Preserves existing React application logic,
 * Google Analytics and cookie consent.
 */

import fs from "node:fs";
import path from "node:path";

// Find customer project
const current = process.cwd();

const project = fs.existsSync(
  path.join(current, "src", "Home.jsx")
)
  ? current
  : path.join(current, "jewel-customer");

// Verify required files
const requiredFiles = [
  "index.html",
  "src/Home.jsx"
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(project, file))) {
    throw new Error(
      `File not found: ${file}. Open the correct project folder.`
    );
  }
}

// Official website
const DOMAIN = "https://rahuljewellersheoganj.com";
const SITE_URL = `${DOMAIN}/`;

// SEO information
const SITE_NAME = "Rahul Jewellers Sheoganj";

const SEO_TITLE =
  "Rahul Jewellers Sheoganj | Gold, Diamond & Silver Jewellery";

const SEO_DESCRIPTION =
  "Explore gold, diamond, silver, Polki and Kundan jewellery at Rahul Jewellers Sheoganj, Rajasthan. Visit our jewellery showroom in Main Market, Sheoganj.";

const SOCIAL_DESCRIPTION =
  "Discover gold, diamond, silver, Polki and Kundan jewellery collections at Rahul Jewellers in Sheoganj, Rajasthan.";

// Create backup directory
const backupDirectory = path.join(
  path.dirname(project),
  "rahul-seo-backups",
  new Date().toISOString().replace(/[:.]/g, "-")
);

fs.mkdirSync(backupDirectory, {
  recursive: true
});

// Replace one required HTML element
function replaceRequired(source, pattern, replacement, label) {
  if (!pattern.test(source)) {
    throw new Error(
      `Could not find ${label}. No files have been saved.`
    );
  }

  return source.replace(pattern, replacement);
}

// Find meta tags regardless of attribute order
function metaPattern(attribute, value) {
  return new RegExp(
    `<meta\\b(?=[^>]*\\b${attribute}=["']${value}["'])[^>]*>`,
    "i"
  );
}

// Save updated file with backup
function saveFile(relativePath, newContent) {
  const target = path.join(project, relativePath);

  if (fs.existsSync(target)) {
    const oldContent = fs.readFileSync(
      target,
      "utf8"
    );

    if (oldContent === newContent) {
      console.log("UNCHANGED:", relativePath);
      return;
    }

    const backup = path.join(
      backupDirectory,
      relativePath
    );

    fs.mkdirSync(path.dirname(backup), {
      recursive: true
    });

    fs.copyFileSync(target, backup);
  } else {
    fs.mkdirSync(path.dirname(target), {
      recursive: true
    });
  }

  fs.writeFileSync(
    target,
    newContent,
    "utf8"
  );

  console.log("UPDATED:", relativePath);
}

// ========================================
// STEP A: UPDATE INDEX.HTML
// ========================================

let html = fs.readFileSync(
  path.join(project, "index.html"),
  "utf8"
);

// Safety checks
if (
  html.includes("\\<html") ||
  html.includes("\\<head")
) {
  throw new Error(
    "HTML appears to contain escaped Markdown. Restore valid HTML first."
  );
}

if (/\bnoindex\b/i.test(html)) {
  throw new Error(
    "Found noindex. Review indexing settings before updating."
  );
}

// HTML language
html = replaceRequired(
  html,
  /<html\b[^>]*>/i,
  '<html lang="en-IN">',
  "HTML language"
);

// Google SEO title
html = replaceRequired(
  html,
  /<title>[\s\S]*?<\/title>/i,
  `<title>${SEO_TITLE.replace("&", "&amp;")}</title>`,
  "SEO title"
);

// Meta description
html = replaceRequired(
  html,
  metaPattern("name", "description"),
  `<meta name="description" content="${SEO_DESCRIPTION}" />`,
  "meta description"
);

// Canonical URL
html = replaceRequired(
  html,
  /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i,
  `<link rel="canonical" href="${SITE_URL}" />`,
  "canonical URL"
);

// Open Graph site name
html = replaceRequired(
  html,
  metaPattern("property", "og:site_name"),
  `<meta property="og:site_name" content="${SITE_NAME}" />`,
  "Open Graph site name"
);

// Open Graph title
html = replaceRequired(
  html,
  metaPattern("property", "og:title"),
  `<meta property="og:title" content="${SEO_TITLE.replace("&", "&amp;")}" />`,
  "Open Graph title"
);

// Open Graph description
html = replaceRequired(
  html,
  metaPattern("property", "og:description"),
  `<meta property="og:description" content="${SOCIAL_DESCRIPTION}" />`,
  "Open Graph description"
);

// Open Graph URL
html = replaceRequired(
  html,
  metaPattern("property", "og:url"),
  `<meta property="og:url" content="${SITE_URL}" />`,
  "Open Graph URL"
);

// Twitter title
html = replaceRequired(
  html,
  metaPattern("name", "twitter:title"),
  `<meta name="twitter:title" content="${SEO_TITLE.replace("&", "&amp;")}" />`,
  "Twitter title"
);

// Twitter description
html = replaceRequired(
  html,
  metaPattern("name", "twitter:description"),
  `<meta name="twitter:description" content="${SOCIAL_DESCRIPTION}" />`,
  "Twitter description"
);

// ========================================
// STEP B: STRUCTURED DATA
// ========================================

// These contact details come from your
// previously supplied index.html.
// Verify them before deployment.

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      "url": SITE_URL,
      "name": SITE_NAME,
      "inLanguage": "en-IN"
    },
    {
      "@type": "JewelryStore",
      "@id": `${SITE_URL}#store`,
      "name": SITE_NAME,
      "url": SITE_URL,
      "description":
        "Gold, Polki, Kundan, diamond and silver jewellery showroom in Sheoganj, Rajasthan.",
      "telephone": [
        "+91-9950091024",
        "+91-9461452322"
      ],
      "address": {
        "@type": "PostalAddress",
        "streetAddress":
          "Dhan Mandi Corner, Main Market",
        "addressLocality": "Sheoganj",
        "addressRegion": "Rajasthan",
        "postalCode": "307027",
        "addressCountry": "IN"
      }
    }
  ]
};

// Replace existing JSON-LD script
html = replaceRequired(
  html,
  /<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/i,
  `<script type="application/ld+json">\n${JSON.stringify(structuredData, null, 2)}\n</script>`,
  "JewelryStore structured data"
);

// ========================================
// STEP C: HOMEPAGE SEO CONTENT
// ========================================

let home = fs.readFileSync(
  path.join(project, "src/Home.jsx"),
  "utf8"
);

const introMarker =
  "SEO: Rahul Jewellers Sheoganj showroom intro";

// Avoid duplicate introduction
if (!home.includes(introMarker)) {
  const heroPattern =
    /(<HeroSlider\s+[\s\S]*?\/\>)/;

  if (heroPattern.test(home)) {
    const intro = `

          {/* ${introMarker} */}
          <section
            aria-label="Rahul Jewellers Sheoganj showroom"
            style={{
              maxWidth: 1100,
              margin: "20px auto 28px",
              padding: "0 20px",
              textAlign: "center"
            }}
          >
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "clamp(19px, 2.2vw, 27px)"
              }}
            >
              Rahul Jewellers Sheoganj – Gold, Diamond &amp; Silver Jewellery
            </h2>

            <p
              style={{
                margin: "0 auto",
                maxWidth: 840,
                lineHeight: 1.7
              }}
            >
              Discover gold, Polki, Kundan, diamond and
              silver jewellery at Rahul Jewellers in
              Sheoganj, Rajasthan. Visit our showroom
              at Dhan Mandi Corner, Main Market,
              Sheoganj, or contact us for jewellery
              enquiries.
            </p>
          </section>`;

    home = home.replace(
      heroPattern,
      `$1${intro}`
    );

    console.log(
      "Homepage SEO introduction prepared."
    );
  } else {
    console.log(
      "NOTE: HeroSlider not found. Home.jsx left unchanged."
    );
  }
}

// ========================================
// STEP D: UPDATE SITEMAP.XML
// ========================================

const sitemapPath = path.join(
  project,
  "public/sitemap.xml"
);

let sitemap = fs.existsSync(sitemapPath)
  ? fs.readFileSync(sitemapPath, "utf8")
  : `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
  </url>
</urlset>
`;

// Normalize domain spelling and case
sitemap = sitemap.replace(
  /https:\/\/rahuljewellersheoganj\.com/gi,
  DOMAIN
);

// ========================================
// STEP E: UPDATE ROBOTS.TXT
// ========================================

const robotsPath = path.join(
  project,
  "public/robots.txt"
);

let robots = fs.existsSync(robotsPath)
  ? fs.readFileSync(robotsPath, "utf8")
  : "User-agent: *\nAllow: /\n";

if (/^Sitemap:/im.test(robots)) {
  robots = robots.replace(
    /^Sitemap:.*$/gim,
    `Sitemap: ${DOMAIN}/sitemap.xml`
  );
} else {
  robots =
    robots.trimEnd() +
    `\n\nSitemap: ${DOMAIN}/sitemap.xml\n`;
}

// ========================================
// STEP F: SAVE ALL CHANGES
// ========================================

saveFile("index.html", html);
saveFile("src/Home.jsx", home);
saveFile("public/sitemap.xml", sitemap);
saveFile("public/robots.txt", robots);

console.log("");
console.log("================================");
console.log("RAHUL JEWELLERS SHEOGANJ");
console.log("SEO UPDATE COMPLETED");
console.log("================================");
console.log("");
console.log("Backup folder:", backupDirectory);
console.log("");
console.log("Next commands:");
console.log("npm run build");
console.log("git diff");
