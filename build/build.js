#!/usr/bin/env node
/**
 * Build System for Mobile-First Indian Festival Greeting Pages
 * Inlines CSS, JS, and config into single-file blogger-post.html outputs.
 * Provides CLI for building all festivals, single festivals, or scaffolding new festivals.
 * 
 * Usage:
 *   node build/build.js                   # Builds all festivals
 *   node build/build.js --festival diwali # Builds specific festival
 *   node build/build.js --new holi        # Scaffolds new festival
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const FESTIVALS_DIR = path.join(ROOT_DIR, 'festivals');
const SHARED_DIR = path.join(ROOT_DIR, 'shared');

// Simple CSS Minifier
function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
    .replace(/\s+/g, ' ')             // collapse whitespace
    .replace(/\s*([\{\}:;,>+~])\s*/g, '$1') // remove space around delimiters and combinators
    .replace(/;}/g, '}')              // remove trailing semicolon
    .trim();
}

// Simple JS Minifier (Preserves string literals and Blogger safety)
function minifyJS(js) {
  let cleaned = js.replace(/\/\*[\s\S]*?\*\//g, '');
  cleaned = cleaned.replace(/^\s*\/\/.*$/gm, '');
  return cleaned
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}

// Helper: Scaffolds a new festival directory
function scaffoldFestival(slug) {
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').trim();
  const targetDir = path.join(FESTIVALS_DIR, cleanSlug);

  if (fs.existsSync(targetDir)) {
    console.error(`❌ Error: Festival "${cleanSlug}" already exists at ${targetDir}`);
    process.exit(1);
  }

  fs.mkdirSync(targetDir, { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'assets'), { recursive: true });

  const capitalized = cleanSlug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

  const sampleConfig = {
    slug: cleanSlug,
    name: capitalized,
    nameHindi: `${capitalized} (त्योहार)`,
    emoji: "🎉",
    brandName: "FestiveGlow",
    blogUrl: "https://yourblog.blogspot.com",
    adsensePublisherId: "ca-pub-XXXXXXXXXXXXXXXX",
    ga4MeasurementId: "G-XXXXXXXXXX",
    defaultLanguage: "en",
    dates: {
      year: 2026,
      primaryDate: "2026-10-20T00:00:00+05:30",
      displayDate: "Auspicious Festival Date 2026",
      tithi: "Festival Tithi",
      muhurat: "Auspicious Muhurat (IST)",
      disclaimer: "Please verify festival timings with your local regional panchang."
    },
    colors: {
      primary: "#FFB703",
      secondary: "#FB8500",
      background: "#1A0B2E",
      cardBg: "rgba(255, 255, 255, 0.08)"
    },
    seo: {
      title: `Happy ${capitalized} 2026 Wishes, Images with Name & WhatsApp Status`,
      description: `Send personalized Happy ${capitalized} 2026 wishes with name on WhatsApp. Free HD greeting card creator, quotes, puja vidhi & auspicious muhurat.`,
      canonical: `https://yourblog.blogspot.com/p/${cleanSlug}.html`,
      ogImage: `https://yourblog.blogspot.com/assets/${cleanSlug}-og-banner.webp`,
      keywords: `happy ${cleanSlug} 2026, ${cleanSlug} wishes with name, ${cleanSlug} greeting card generator, ${cleanSlug} whatsapp status`
    },
    languages: {
      en: {
        greetingName: `Happy ${capitalized}`,
        wishes: [
          { category: "traditional", text: `May this holy occasion of ${capitalized} bring peace, divine light, and prosperity to your household!` },
          { category: "family", text: `Warmest festive greetings to you and your beloved family on ${capitalized}!` },
          { category: "friends", text: `Wishing you tremendous joy, sweet memories, and success this ${capitalized}!` },
          { category: "formal", text: `Wishing you and your esteemed organization a joyous and prosperous ${capitalized} celebration.` },
          { category: "shayari", text: `Khushiyon ka mausam, apno ka pyar, mubarak ho aapko yeh paawan tyohar!` }
        ]
      },
      hi: {
        greetingName: `शुभ ${capitalized}`,
        wishes: [
          { category: "traditional", text: `${capitalized} के पावन पर्व की आपको और आपके पूरे परिवार को हार्दिक शुभकामनाएं!` },
          { category: "family", text: `आपके घर में सुख, शांति और समृद्धि का वास हो। सपरिवार मंगलमय ${capitalized}!` },
          { category: "friends", text: `हैप्पी ${capitalized} मेरे दोस्त! सदा मुस्कुराते रहो और जीवन में नई ऊंचाइयों को छुओ!` },
          { category: "formal", text: `${capitalized} के पावन अवसर पर आपको एवं आपके पूरे संस्थान को हार्दिक बधाई।` },
          { category: "shayari", text: `दीप जलें, दिल खिलें, हर खुशी आपके द्वार मिले। शुभ ${capitalized}!` }
        ]
      }
    },
    quiz: {
      questions: [
        {
          question: `What does the sacred festival of ${capitalized} primarily celebrate?`,
          options: ["Victory of light and truth", "Spring harvest", "Family solidarity", "Spiritual devotion"],
          correctIndex: 0,
          explanation: `The celebration embodies the eternal victory of goodness, harmony, and righteousness.`
        }
      ]
    }
  };

  fs.writeFileSync(path.join(targetDir, 'config.json'), JSON.stringify(sampleConfig, null, 2), 'utf8');

  // Copy standard template from dussehra as boilerplate
  const dussehraTemplatePath = path.join(FESTIVALS_DIR, 'dussehra', 'index.template.html');
  if (fs.existsSync(dussehraTemplatePath)) {
    let tplContent = fs.readFileSync(dussehraTemplatePath, 'utf8');
    tplContent = tplContent
      .replace(/theme-dussehra/g, `theme-${cleanSlug}`)
      .replace(/Dussehra/g, capitalized)
      .replace(/dussehra/g, cleanSlug);
    fs.writeFileSync(path.join(targetDir, 'index.template.html'), tplContent, 'utf8');
  }

  // Create README.md
  const readmeContent = `# ${capitalized} Greeting Page for Google Blogger\n\n` +
    `Mobile-first personalized greeting card generator for ${capitalized} 2026.\n\n` +
    `## Files\n` +
    `- \`config.json\`: Festival dates, colors, metadata, and wish pool.\n` +
    `- \`index.template.html\`: Source template.\n` +
    `- \`blogger-post.html\`: Generated single-file code ready to paste into Blogger.\n\n` +
    `## Build\n\`\`\`bash\nnode build/build.js --festival ${cleanSlug}\n\`\`\`\n`;
  fs.writeFileSync(path.join(targetDir, 'README.md'), readmeContent, 'utf8');

  console.log(`\n✨ Successfully scaffolded new festival: "${cleanSlug}" at:\n   ${targetDir}`);
  console.log(`   Next step: Edit config.json and run "node build/build.js --festival ${cleanSlug}"\n`);
}

function decodeEntities(str) {
  if (typeof str !== 'string' || !str) return str || '';
  return str
    .replace(/&amp;#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;#x([0-9a-fA-F]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));
}

function deepDecode(obj) {
  if (typeof obj === 'string') return decodeEntities(obj);
  if (Array.isArray(obj)) return obj.map(deepDecode);
  if (obj && typeof obj === 'object') {
    const res = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = deepDecode(v);
    }
    return res;
  }
  return obj;
}

// Build a single festival
function buildFestival(festivalSlug) {
  const festDir = path.join(FESTIVALS_DIR, festivalSlug);
  const configFile = path.join(festDir, 'config.json');
  const templateFile = path.join(festDir, 'index.template.html');

  if (!fs.existsSync(configFile)) {
    console.error(`⚠️ Config file not found: ${configFile}`);
    return false;
  }
  if (!fs.existsSync(templateFile)) {
    console.error(`⚠️ Template file not found: ${templateFile}`);
    return false;
  }

  console.log(`\n📦 Building festival: "${festivalSlug}"...`);

  const rawConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  const config = deepDecode(rawConfig);
  let template = decodeEntities(fs.readFileSync(templateFile, 'utf8'))
    .replace(/<!--(?!\[)[\s\S]*?-->/g, ''); // strip HTML comments to optimize budget

  // 1. Gather and bundle all CSS
  const baseCss = fs.readFileSync(path.join(SHARED_DIR, 'themes', 'base.css'), 'utf8');
  let themeCss = '';
  const specificThemePath = path.join(SHARED_DIR, 'themes', `${festivalSlug}.css`);
  if (fs.existsSync(specificThemePath)) {
    themeCss = fs.readFileSync(specificThemePath, 'utf8');
  }

  const bundledCss = minifyCSS(baseCss + '\n' + themeCss);

  // 2. Gather and bundle all Core JS
  const jsFiles = [
    'sanitizer.js',
    'analytics.js',
    'ad-slot-loader.js',
    'countdown.js',
    'greeting-engine.js',
    'share-engine.js',
    'status-canvas.js',
    'interactive.js',
    'consent.js'
  ];

  let bundledJs = '';
  jsFiles.forEach(file => {
    const filePath = path.join(SHARED_DIR, 'core', file);
    if (fs.existsSync(filePath)) {
      bundledJs += '\n' + fs.readFileSync(filePath, 'utf8');
    } else {
      console.warn(`  ⚠️ Missing JS file: ${filePath}`);
    }
  });

  const minifiedJs = minifyJS(bundledJs);

  // 3. Perform Template Injections
  const replacements = {
    '{{SEO_TITLE}}': config.seo.title,
    '{{SEO_DESCRIPTION}}': config.seo.description,
    '{{SEO_KEYWORDS}}': config.seo.keywords,
    '{{CANONICAL_URL}}': config.seo.canonical,
    '{{OG_IMAGE}}': config.seo.ogImage,
    '{{BRAND_NAME}}': config.brandName || 'FestiveGlow',
    '{{BLOG_URL}}': config.blogUrl || 'https://techinfo29.blogspot.com',
    '{{THEME_COLOR}}': config.colors.primary || '#1B0A33',
    '{{ADSENSE_PUB_ID}}': config.adsensePublisherId || 'ca-pub-XXXXXXXXXXXXXXXX',
    '{{INLINED_CSS}}': bundledCss,
    '{{INLINED_JS}}': minifiedJs,
    '{{FESTIVAL_CONFIG_JSON}}': JSON.stringify(config)
  };

  let outputHtml = template;
  for (const [key, value] of Object.entries(replacements)) {
    outputHtml = outputHtml.split(key).join(value);
  }

  // Optimize file size: minify JSON-LD and trim leading/trailing line whitespace and blank lines
  outputHtml = outputHtml.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi, (match, json) => {
    try {
      return `<script type="application/ld+json">${JSON.stringify(JSON.parse(json))}</script>`;
    } catch (e) {
      return match;
    }
  });

  outputHtml = outputHtml
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');

  // 4. Build Check: Verify no raw HTML entities exist in HTML markup text nodes
  const markupWithoutScripts = outputHtml.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const entityMatches = markupWithoutScripts.match(/&#\d+;|&amp;#/g);
  if (entityMatches) {
    console.error(`  ❌ BUILD FAILURE: Found ${entityMatches.length} raw entity occurrence(s) in markup text nodes:`, entityMatches.slice(0, 5));
    throw new Error(`Build failed for ${festivalSlug}: Raw HTML entities found in rendered template.`);
  }

  // 5. Write generated self-contained output to blogger-post.html
  const outputFile = path.join(festDir, 'blogger-post.html');
  fs.writeFileSync(outputFile, outputHtml, 'utf8');

  const stats = fs.statSync(outputFile);
  const sizeKB = (stats.size / 1024).toFixed(2);

  console.log(`  ✅ Generated: ${outputFile}`);
  console.log(`  📊 File Size: ${sizeKB} KB (Target: < 150 KB budget)`);

  if (stats.size > 150 * 1024) {
    console.warn(`  ⚠️ Warning: File size exceeds 150 KB budget!`);
  }

  return true;
}

// Generate optional Blogger theme XML snippet
function generateBloggerThemeSnippet() {
  const snippetPath = path.join(ROOT_DIR, 'build', 'blogger-theme-snippet.xml');
  const xmlContent = `<!-- 
  GOOGLE BLOGGER THEME INTEGRATION SNIPPET
  Add this inside your Blogger Theme XML right before </head> for automated meta tags & ads.txt support
-->
<b:if cond='data:blog.pageType == "static_page"'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover'/>
  <!-- Google AdSense Auto Ads / Script -->
  <script async='async' src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX' crossorigin='anonymous'></script>
</b:if>
`;
  fs.writeFileSync(snippetPath, xmlContent, 'utf8');
}

// Main CLI Handler
function main() {
  const args = process.argv.slice(2);

  // Check for --new <slug> flag
  const newIndex = args.indexOf('--new');
  if (newIndex !== -1 && args[newIndex + 1]) {
    const slug = args[newIndex + 1];
    scaffoldFestival(slug);
    return;
  }

  // Check for --festival <slug> flag
  const festIndex = args.indexOf('--festival');
  let specificFestival = null;
  if (festIndex !== -1 && args[festIndex + 1]) {
    specificFestival = args[festIndex + 1].toLowerCase();
  }

  console.log('🚀 Starting Festival Greeting Build System...');
  generateBloggerThemeSnippet();

  if (specificFestival) {
    buildFestival(specificFestival);
  } else {
    // Build all festivals present in /festivals
    if (!fs.existsSync(FESTIVALS_DIR)) {
      console.error(`❌ Festivals directory not found: ${FESTIVALS_DIR}`);
      process.exit(1);
    }

    const festivals = fs.readdirSync(FESTIVALS_DIR).filter(item => {
      const fullPath = path.join(FESTIVALS_DIR, item);
      return fs.statSync(fullPath).isDirectory();
    });

    if (festivals.length === 0) {
      console.log('⚠️ No festival folders found in /festivals');
      return;
    }

    let successCount = 0;
    festivals.forEach(fest => {
      if (buildFestival(fest)) {
        successCount++;
      }
    });

    console.log(`\n🎉 Build Complete! Successfully compiled ${successCount} festival(s).`);
  }
}

main();
