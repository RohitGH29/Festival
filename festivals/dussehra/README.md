# Dussehra (Vijayadashami) 2026 Greeting Page for Google Blogger

Mobile-first personalized greeting card generator and editorial guide for Dussehra 2026.

## Overview
- **Festival:** Dussehra (Vijayadashami)
- **Primary Date:** Tuesday, October 20, 2026
- **Tithi:** Ashwin Shukla Dashami
- **Vijaya Muhurat:** 02:07 PM to 02:54 PM (IST)
- **Ravan Dahan Muhurat:** 05:48 PM to 08:22 PM (IST)
- **Languages:** English & Hindi (Instant toggle without page reload)

## Deliverables in this Folder
- `config.json`: Master configuration containing dates, colors, meta tags, bilingual wish pools (traditional, family, friends, formal, shayari), and 5-question trivia quiz.
- `index.template.html`: Source HTML template with Article, Event, and FAQPage JSON-LD schemas, responsive layout, and policy-safe ad units.
- `assets/`: Optimized WebP image references and SVG vector motifs.
- `blogger-post.html`: Fully inlined, self-contained single-file HTML ready to paste directly into Google Blogger's Post HTML View.

## How to Deploy on Blogger
1. Open your Blogger dashboard: [blogger.com](https://www.blogger.com).
2. Go to **Pages** (or **Posts**) -> **New Page** / **New Post**.
3. Switch the editor from "Compose View" to **"HTML View"**.
4. Copy the entire contents of `blogger-post.html` and paste it into the editor.
5. In Page Settings, set the permalink / URL slug to `dussehra` (e.g., `https://yourblog.blogspot.com/p/dussehra.html`).
6. Set Search Description to the SEO description from `config.json`.
7. Click **Publish**.

## Rebuilding
To recompile after making changes to `config.json` or `index.template.html`:
```bash
node build/build.js --festival dussehra
```
