# Google AdSense Monetization & Policy Compliance Checklist

Greeting websites often face AdSense policy strikes ("Valuable Inventory: Thin Content", "Accidental Clicks", or "Deceptive Layout") when built carelessly. This system is architected from the ground up to be **100% policy-safe, compliant with Google Webmaster & Publisher policies**, and optimized for sustainable, high RPMs.

---

## 1. Core Policy Compliance Checklist

| Rule | Requirement | Implemented In System |
| :--- | :--- | :--- |
| **No Accidental Clicks** | Keep at least **100px vertical buffer** between ads and interactive buttons (Share, Download, Copy, Submit). | ✅ Yes. All 3 ad slots are placed inside `.fest-ad-slot-wrapper` with generous 36px margins (>100px effective distance). |
| **No Greeting Overlap** | Never place an ad unit touching, overlapping, or immediately above the greeting card. | ✅ Yes. First ad is placed strictly *below* the greeting card and first fold. |
| **No Thin Content** | Greeting cards alone are categorized as "thin content" and face site rejection or ad limits. | ✅ Yes. Every page carries 900+ words of authentic, culturally verified editorial content (Legends, Muhurat, Rituals, FAQs, Recipes). |
| **Mandatory Ad Label** | Ad units must clearly be identifiable as paid advertisements. | ✅ Yes. Every slot contains `<div class="fest-ad-label">ADVERTISEMENT</div>`. |
| **Cumulative Layout Shift (CLS)** | Ads pushing content abruptly as they load triggers high CLS and degrades Core Web Vitals. | ✅ Yes. Fixed CSS `min-height: 280px` reserves layout space prior to script rendering (CLS target < 0.05). |
| **Maximum Manual Units** | Do not saturate the page with excessive ads. | ✅ Yes. Strictly capped at 3 in-article units per page (`ad-slot-1`, `ad-slot-2`, `ad-slot-3`). |
| **No Deceptive Calls-to-Action** | Never ask users to "click the ad", use arrows pointing to ads, or promise unlocked features for clicks. | ✅ Yes. Verified by automated regex checks in `build/validate.js`. |
| **Zero Click Tracking** | Tracking clicks on ads using custom JS violates AdSense terms. | ✅ Yes. Analytics only logs viewability impressions (`ad_slot_viewed`) via IntersectionObserver. |
| **Graceful Ad-Blocker Collapse** | Broken ad frames leaving ugly blank gaps degrade user experience. | ✅ Yes. `.fest-ad-slot.ad-slot-collapsed` collapses the element cleanly if unfilled. |

---

## 2. Mandatory Trust & Transparency Pages

Google requires publishers to maintain visible, working links to essential site governance pages in the website footer:
1. **Privacy Policy (`/p/privacy-policy.html`):**
   - Discloses use of Google AdSense, third-party vendor cookies (Doubleclick DART), and anonymized GA4 analytics.
2. **About Us (`/p/about.html`):**
   - Outlines editorial team mission, focus on Indian cultural festivals, and research methodology.
3. **Contact Us (`/p/contact.html`):**
   - Working contact email address or Google Form for corrections and user inquiries.
4. **Disclaimer (`/p/disclaimer.html`):**
   - States that astrological/panchang muhurats are computed based on traditional calculations and should be verified locally.
5. **Cookie Notice & CMP Consent:**
   - DPDP (India) and GDPR/UK compliant cookie consent banner with opt-in controls.

---

## 3. Pre-Launch Automated Audit Script

Before deploying any festival page live to Blogger, run the automated verification command:
```bash
npm run validate
```
This script audits:
- File size budget (< 150 KB).
- Exact manual ad slot count (<= 3).
- Presence of mandatory "ADVERTISEMENT" labels.
- Absence of prohibited incentive phrases.
- CLS min-height guarantees.
- JSON-LD Article, Event, and FAQPage syntax.
- XSS sanitization vector validation.
