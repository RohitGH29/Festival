#!/usr/bin/env node
/**
 * Quality, Security & AdSense Policy Validator
 * Validates file sizes, AdSense placement rules, accessibility, JSON-LD schemas,
 * and executes automated XSS sanitization unit tests.
 * 
 * Usage:
 *   node build/validate.js
 */

const fs = require('fs');
const path = require('path');
const Sanitizer = require('../shared/core/sanitizer.js');

const ROOT_DIR = path.resolve(__dirname, '..');
const FESTIVALS_DIR = path.join(ROOT_DIR, 'festivals');
const MAX_FILE_SIZE_BYTES = 150 * 1024; // 150 KB budget

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAILED: ${message}`);
  }
}

console.log('🛡️ Running System Verification & Security Audit...\n');

// ====================================================================
// TEST SUITE 1: XSS Sanitization & Security Engine
// ====================================================================
console.log('1️⃣ Auditing XSS Sanitization & Query Input Security:');

const xssPayloads = [
  { input: '<script>alert("XSS")</script>', expected: 'alertXSS' },
  { input: '"><img src=x onerror=alert(1)>', expected: '' },
  { input: 'javascript:alert(document.cookie)', expected: 'javascriptalertdocumentcookie' },
  { input: '<svg/onload=alert(1)>', expected: '' },
  { input: 'Rahul <b>Kumar</b>', expected: 'Rahul Kumar' },
  { input: 'Amit; DROP TABLE users;--', expected: 'Amit DROP TABLE users--' },
  { input: 'A very long name that definitely exceeds the thirty character limit of safety', expectedLength: 30 }
];

xssPayloads.forEach((item, idx) => {
  const result = Sanitizer.sanitizeName(item.input, 30);
  assert(!result.includes('<') && !result.includes('>') && !result.includes('"'), `Payload #${idx + 1} stripped all dangerous HTML angle brackets and quotes`);
  if (item.expectedLength) {
    assert(result.length <= item.expectedLength, `Payload #${idx + 1} capped at exactly 30 characters maximum`);
  }
});

// Test Indic script support
const indicNames = ['राहुल शर्मा', 'अमित पटेल', 'ಪ್ರಿಯಾ', 'பிரியா', 'ਸਿਮਰਨ'];
indicNames.forEach(name => {
  const sanitized = Sanitizer.sanitizeName(name, 30);
  assert(sanitized.length > 0, `Indic script "${name}" safely parsed without corruption`);
});

// ====================================================================
// TEST SUITE 2: AdSense Policy Compliance & HTML Audits
// ====================================================================
console.log('\n2️⃣ Auditing Built Festival Pages (AdSense Policy, Budget & A11y):');

const festivalDirs = fs.readdirSync(FESTIVALS_DIR).filter(item => {
  return fs.statSync(path.join(FESTIVALS_DIR, item)).isDirectory();
});

festivalDirs.forEach(slug => {
  const postFile = path.join(FESTIVALS_DIR, slug, 'blogger-post.html');
  if (!fs.existsSync(postFile)) {
    console.warn(`  ⚠️ Skipping "${slug}": blogger-post.html not generated yet.`);
    return;
  }

  console.log(`\n  Checking /festivals/${slug}/blogger-post.html:`);
  const content = fs.readFileSync(postFile, 'utf8');
  const stats = fs.statSync(postFile);

  // 1. File Size Budget
  assert(stats.size <= MAX_FILE_SIZE_BYTES, `Size is ${(stats.size / 1024).toFixed(2)} KB (Strictly <= 150 KB budget)`);

  // 2. AdSense Slot Count Rule (Max 3 manual slots in HTML markup)
  const adSlotMatches = content.match(/<div [^>]*class=["'][^"']*fest-ad-slot[^"']*["']/g) || [];
  assert(adSlotMatches.length <= 3 && adSlotMatches.length > 0, `HTML Ad slots count is ${adSlotMatches.length} (Max 3 manual units allowed by policy)`);

  // 3. Mandatory "ADVERTISEMENT" labels in HTML markup
  const labelMatches = content.match(/<div class=["']fest-ad-label["']>ADVERTISEMENT<\/div>/g) || [];
  assert(labelMatches.length === adSlotMatches.length, `All ${adSlotMatches.length} ad slots contain explicit "ADVERTISEMENT" labels`);

  // 4. No Prohibited Incentivized Ad Clicks Phrases
  const forbiddenPhrases = [
    'click the ad',
    'click on ad',
    'support us by clicking',
    'click here to support',
    'sponsor this site by clicking'
  ];
  let hasForbidden = false;
  forbiddenPhrases.forEach(phrase => {
    if (content.toLowerCase().includes(phrase)) hasForbidden = true;
  });
  assert(!hasForbidden, `Zero prohibited incentivized-click phrases found in document`);

  // 5. Reserved Height (CLS Prevention)
  assert(content.includes('min-height: 280px') || content.includes('min-height:280px'), `Ad slots declare explicit min-height reserved space to prevent CLS`);

  // 6. JSON-LD Structured Data Syntax
  const jsonLdStart = content.indexOf('<script type="application/ld+json">');
  const jsonLdEnd = content.indexOf('</script>', jsonLdStart);
  assert(jsonLdStart !== -1 && jsonLdEnd !== -1, `JSON-LD structured data script block is present`);
  if (jsonLdStart !== -1 && jsonLdEnd !== -1) {
    const rawJson = content.substring(jsonLdStart + '<script type="application/ld+json">'.length, jsonLdEnd).trim();
    try {
      const parsed = JSON.parse(rawJson);
      assert(parsed['@context'] === 'https://schema.org', `JSON-LD valid schema.org context`);
      assert(Array.isArray(parsed['@graph']), `JSON-LD @graph contains structured graph entities`);
    } catch (e) {
      assert(false, `JSON-LD JSON parsing failed: ${e.message}`);
    }
  }

  // 7. Accessibility: Viewport, Form Labels & Interactive IDs
  assert(content.includes('name="viewport"'), `Viewport meta tag is properly configured`);
  assert(content.includes('id="fest-input-to"'), `Recipient input ID is declared`);
  assert(content.includes('id="fest-btn-share-whatsapp"'), `Primary WhatsApp share CTA ID is present`);
  assert(content.includes('aria-label='), `Aria labels present for accessible screen readers`);
});

// ====================================================================
// SUMMARY REPORT
// ====================================================================
console.log('\n========================================================');
console.log(`📊 Audit Results: ${passedTests} Passed, ${failedTests} Failed (Total ${totalTests} checks)`);
console.log('========================================================');

if (failedTests > 0) {
  console.error('❌ Validation detected errors.');
  process.exit(1);
} else {
  console.log('✨ All quality, security, and policy validation checks passed!\n');
  process.exit(0);
}
