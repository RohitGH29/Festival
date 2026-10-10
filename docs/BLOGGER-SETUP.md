# Google Blogger Complete Deployment & Optimization Guide

This guide details the exact step-by-step procedure to deploy the self-contained festival greeting pages (`blogger-post.html`) to Google Blogger, configure custom domains, set up AdSense `ads.txt`, optimize SEO, and ensure instant indexing.

---

## 1. Creating the Page / Post in Blogger

Because the greeting pages are evergreen annual event hubs, **Blogger Pages (`/p/slug.html`) are recommended** over standard dated blog posts. Pages provide cleaner URLs and rank higher year-over-year.

### Step-by-Step Deployment:
1. Log in to your [Blogger Dashboard](https://www.blogger.com).
2. In the left sidebar, click **Pages** (or **Posts** if you prefer chronologically archived articles).
3. Click **+ New Page** (or **+ New Post**).
4. Enter the Page Title:
   - For Dussehra: `Happy Dussehra 2026 Wishes, Images with Name & WhatsApp Status`
   - For Diwali: `Happy Diwali 2026 Wishes, Images with Name & WhatsApp Status`
5. **Switch to HTML View:**
   - Under the title bar on the left, click the pencil icon and choose **HTML View** (do **NOT** use Compose View, as it can strip or reformat scripts).
6. Open `/festivals/<festival>/blogger-post.html` in your text editor.
7. Select All (`Ctrl+A` or `Cmd+A`) and Copy (`Ctrl+C` or `Cmd+C`).
8. Paste the code into the Blogger HTML editor.
9. Click **Preview** to verify the greeting card, wish shuffler, and particle animations render correctly.
10. Click **Publish** -> **Confirm**.

---

## 2. Setting Custom Permalinks (URL Slugs)

- For standard **Posts**, Blogger allows custom permalinks in the right sidebar:
  - Expand **Permalink** -> Select **Custom Permalink** -> Type `dussehra.html` or `diwali.html`.
- For **Pages**, Blogger generates the permalink automatically from the title when first published.
  - *Pro Tip:* Title your page `dussehra` before first publishing to get `/p/dussehra.html`. Once published, rename the title to the full SEO title (`Happy Dussehra 2026 Wishes...`). Blogger will keep the clean `/p/dussehra.html` URL.

---

## 3. Google AdSense Integration & ads.txt Configuration

### A. Publishing `ads.txt` (Mandatory for AdSense Earnings)
Missing `ads.txt` can lead to earnings loss and AdSense crawler errors.
1. In Blogger, go to **Settings** -> Scroll down to **Monetization**.
2. Toggle ON **Enable custom ads.txt**.
3. Click **Custom ads.txt** and paste your publisher line:
   ```text
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```
   *(Replace `pub-XXXXXXXXXXXXXXXX` with your actual AdSense publisher ID).*
4. Verify by visiting `https://yourblog.blogspot.com/ads.txt` in your browser.

### B. Adding the AdSense Script to Blogger Theme
While our `blogger-post.html` already contains the ad tags, having the script in the theme `<head>` ensures global Auto Ads and faster preloading:
1. Go to **Theme** -> Click the arrow next to "Customize" -> Click **Edit HTML**.
2. Find the `<head>` tag.
3. Paste the following snippet immediately after `<head>`:
   ```html
   <script async="async" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
   ```
4. Click **Save Theme** (disk icon in top right).

---

## 4. Search Description & On-Page SEO Settings

1. In Blogger, go to **Settings** -> Scroll to **Meta tags**.
2. Toggle ON **Enable search description**.
3. Now, whenever you edit a Page or Post, expand **Search Description** in the right sidebar.
4. Paste the 150-160 character description from `config.json`:
   - *Dussehra:* `Send personalized Happy Dussehra 2026 wishes with name on WhatsApp. Free HD greeting card creator, quotes, puja vidhi & auspicious muhurat.`
   - *Diwali:* `Send personalized Happy Diwali 2026 wishes with name on WhatsApp. Free HD Deepavali greeting card creator, Lakshmi Puja Shubh Muhurat & wishes.`

---

## 5. Custom Domain & Free HTTPS Setup

Using a custom domain (e.g. `festivewishes.in` or `myfestivalcards.com`) builds brand trust and yields higher click-through rates on WhatsApp shares.

1. Go to **Settings** -> **Publishing** -> **Custom domain**.
2. Enter your domain (e.g. `www.myfestivalcards.com`).
3. Add the two CNAME records provided by Blogger into your DNS registrar (GoDaddy, Cloudflare, Namecheap):
   - First CNAME: `Name: www`, `Destination: ghs.google.com`
   - Second CNAME: Unique security token provided in Blogger settings.
4. Set up A-records pointing to Google IPs for naked domain redirect:
   - `216.239.32.21`
   - `216.239.34.21`
   - `216.239.36.21`
   - `216.239.38.21`
5. Enable **Redirect domain** (`myfestivalcards.com` to `www.myfestivalcards.com`).
6. Enable **HTTPS Availability** and **HTTPS Redirect**.

---

## 6. Google Search Console & XML Sitemap Submission

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Add your Blogger domain as a property.
3. Go to **Sitemaps** in the sidebar.
4. Submit the following sitemaps:
   - `sitemap.xml`
   - `sitemap-pages.xml` (Indexes your `/p/dussehra.html` static pages!)
5. Use the **URL Inspection** tool to submit your new festival URLs (`/p/dussehra.html`, `/p/diwali.html`) for instant priority crawl 3-4 weeks prior to the festival date.
