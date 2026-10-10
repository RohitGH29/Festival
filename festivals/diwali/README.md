# Diwali (Deepavali) 2026 Greeting Page for Google Blogger

Mobile-first personalized greeting card generator and editorial guide for Diwali 2026.

## Overview
- **Festival:** Diwali (Deepavali)
- **Primary Date:** Sunday, November 8, 2026
- **Tithi:** Kartik Amavasya
- **Dhanteras:** Friday, November 6, 2026
- **Chhoti Diwali:** Saturday, November 7, 2026
- **Lakshmi Puja Muhurat:** 05:42 PM to 07:38 PM (Pradosh Kaal, IST)
- **Govardhan Puja:** Monday, November 9, 2026
- **Bhai Dooj:** Tuesday, November 10, 2026
- **Languages:** English & Hindi (Instant toggle without page reload)

## Deliverables in this Folder
- `config.json`: Master configuration containing 5-day festival dates, colors, meta tags, bilingual wish pools (traditional, family, friends, formal, shayari), and 5-question trivia quiz.
- `index.template.html`: Source HTML template with Article, Event, and FAQPage JSON-LD schemas, responsive layout, and policy-safe ad units.
- `assets/`: Optimized WebP image references and SVG vector motifs.
- `blogger-post.html`: Fully inlined, self-contained single-file HTML ready to paste directly into Google Blogger's Post HTML View.

## How to Deploy on Blogger
1. Open your Blogger dashboard: [blogger.com](https://www.blogger.com).
2. Go to **Pages** (or **Posts**) -> **New Page** / **New Post**.
3. Switch the editor from "Compose View" to **"HTML View"**.
4. Copy the entire contents of `blogger-post.html` and paste it into the editor.
5. In Page Settings, set the permalink / URL slug to `diwali` (e.g., `https://yourblog.blogspot.com/p/diwali.html`).
6. Set Search Description to the SEO description from `config.json`.
7. Click **Publish**.

## Rebuilding
To recompile after making changes to `config.json` or `index.template.html`:
```bash
node build/build.js --festival diwali
```
