#!/usr/bin/env node
/**
 * Zero-Dependency Local Dev Server for Festival Greeting Previews
 * Serves single-file blogger-post.html for each festival with query params support.
 * 
 * Usage:
 *   node build/serve.js
 *   Open http://localhost:3333/dussehra?to=Rahul&from=Amit
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3333;
const ROOT_DIR = path.resolve(__dirname, '..');
const FESTIVALS_DIR = path.join(ROOT_DIR, 'festivals');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname.replace(/^\/p\//, '/').replace(/\.html$/, ''); // Support Blogger /p/dussehra.html format!
  if (pathname === '/') pathname = '/dussehra';

  const festivalSlug = pathname.replace(/^\//, '').split('/')[0];
  const postFile = path.join(FESTIVALS_DIR, festivalSlug, 'blogger-post.html');

  if (pathname === '/full' || pathname === '/blogger') {
    const themeXml = fs.readFileSync(path.join(ROOT_DIR, 'theme.xml'), 'utf8');
    const postHtml = fs.readFileSync(path.join(ROOT_DIR, 'dussehra.html'), 'utf8');

    // Extract skin styles
    const bSkinMatch = themeXml.match(/<b:skin><!\[CDATA\[([\s\S]*?)\]\]><\/b:skin>/i);
    const bTemplateMatch = themeXml.match(/<b:template-skin><!\[CDATA\[([\s\S]*?)\]\]><\/b:template-skin>/i);
    const skinCss = (bSkinMatch ? bSkinMatch[1] : '') + '\n' + (bTemplateMatch ? bTemplateMatch[1] : '');

    // Render simulated Blogger page
    let rendered = themeXml
      .replace(/<b:skin>[\s\S]*?<\/b:skin>/i, `<style>${skinCss}</style>`)
      .replace(/<b:template-skin>[\s\S]*?<\/b:template-skin>/i, '')
      .replace(/<b:include data='blog' name='all-head-content'\/>/i, '<meta charset="utf-8"/>')
      .replace(/<data:blog.pageTitle\/>/g, 'Tech info: dussehra')
      .replace(/<data:title\/>/g, 'Tech info')
      .replace(/<data:description\/>/g, 'Welcome to Tech info Blog')
      .replace(/<data:post.title\/>/g, 'dussehra')
      .replace(/expr:href='data:blog.homepageUrl'/g, 'href="/"')
      .replace(/<b:if[\s\S]*?>/gi, '')
      .replace(/<\/b:if>/gi, '')
      .replace(/<b:loop[\s\S]*?>/gi, '')
      .replace(/<\/b:loop>/gi, '')
      .replace(/<b:widget[\s\S]*?>/gi, '')
      .replace(/<\/b:widget>/gi, '')
      .replace(/<b:includable[\s\S]*?>/gi, '')
      .replace(/<\/b:includable>/gi, '')
      .replace(/<data:content\/>/g, '<div style="background:#f0f0f0;padding:20px;text-align:center;color:#888;font-size:12px;">ADVERTISEMENT</div>')
      .replace(/<data:post.body\/>/g, postHtml);

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    return res.end(rendered);
  }

  if (fs.existsSync(postFile)) {
    const content = fs.readFileSync(postFile, 'utf8');
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    });
    return res.end(content);
  } else {
    // Show index of available festivals
    const festivals = fs.existsSync(FESTIVALS_DIR)
      ? fs.readdirSync(FESTIVALS_DIR).filter(f => fs.statSync(path.join(FESTIVALS_DIR, f)).isDirectory())
      : [];

    let html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Festival Greetings Preview</title>` +
      `<style>body{font-family:sans-serif;padding:20px;background:#111;color:#eee;max-width:500px;margin:0 auto}a{color:#ffd700;display:block;padding:12px;margin:8px 0;background:#222;border-radius:8px;text-decoration:none}h1{color:#ffd700}</style></head><body>` +
      `<h1>🎉 Festival Greetings Preview</h1><p>Select a festival preview:</p>`;
    
    festivals.forEach(f => {
      html += `<a href="/${f}?to=Rahul&from=Amit">👉 /${f} (Personalized: Rahul from Amit)</a>`;
    });

    html += `</body></html>`;
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }
});

server.listen(PORT, () => {
  console.log(`🌐 Festival Greeting Preview Server running at: http://localhost:${PORT}`);
  console.log(`   - Dussehra: http://localhost:${PORT}/dussehra?to=Rahul&from=Amit`);
  console.log(`   - Diwali:   http://localhost:${PORT}/diwali?to=Rahul&from=Amit`);
});
