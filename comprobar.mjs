// node comprobar.mjs                    → prueba la carpeta local
// URL=https://iaadileli.github.io/guias/ node comprobar.mjs → prueba la publicada
// ANTES=carpeta → compara el texto con la copia de las guías originales
import { createRequire } from "node:module"; import http from "node:http"; import fs from "node:fs"; import path from "node:path";
const R = import.meta.dirname, { chromium } = createRequire(path.join(R, "../cata-te/"))("playwright-core");
const G = { copenhague: "copenhague", tailandia: "viaje-tailandia-2026", lyon: "viaje-lyon-2026", nerja: "viaje-nerja-2026", londres: "viaje-londres-2026", vietnam: "viaje-vietnam-2026" };
const M = { ".html": "text/html", ".js": "text/javascript", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".mp3": "audio/mpeg" };
let mal = 0; const ok = (c, t) => { console.log((c ? "  ✓ " : "  ✗ ") + t); if (!c) mal++; };
const srv = http.createServer((q, s) => { let f = decodeURI(q.url.split("?")[0]); f = f.startsWith("/guias/") ? path.join(R, f.slice(6)) : path.join(process.env.ANTES || "/nada", f); if (f.endsWith("/")) f += "index.html";
  fs.readFile(f, (e, d) => { s.writeHead(e ? 404 : 200, { "Content-Type": M[path.extname(f)] || "text/html" }); s.end(e ? "no" : d); }); }).listen(0);
const L = `http://localhost:${srv.address().port}/`, B = process.env.URL || L + "guias/";
const b = await chromium.launch({ channel: "chromium" });
const nuevo = async () => { const c = await b.newContext({ viewport: { width: 390, height: 844 } }); await c.route(u => ![new URL(L).host, new URL(B).host].includes(u.host), r => r.abort()); return c; };
{ console.log("Portada", B); const c = await nuevo(), p = await c.newPage(), e = []; p.on("pageerror", x => e.push(x.message)); await p.goto(B); await p.evaluate(() => navigator.serviceWorker.getRegistration("index.html")); await p.waitForTimeout(2500);
  ok(await p.evaluate(() => [...document.images].every(i => i.complete && i.naturalWidth)) && await p.locator("li a").count() === 6, "seis portadas cargadas"); ok(p.url() === B + "index.html", "dirección " + p.url());
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "sin desbordes"); ok(!e.length, "sin errores " + e);
  for (const s of ["light", "dark"]) { await p.emulateMedia({ colorScheme: s }); await p.screenshot({ path: `${process.env.SALIDA || "."}/portada-${s}.png`, fullPage: true }); }
  ok(JSON.stringify(await p.evaluate(() => caches.keys())) === '["guias-portada-v1"]', "caché propia"); await c.setOffline(true); await p.reload(); ok(await p.locator("li a").count() === 6 && await p.evaluate(() => [...document.images].every(i => i.complete && i.naturalWidth)), "portada sin conexión"); await c.close(); }
for (const [g, v] of Object.entries(G)) { console.log(g); let t0 = null, r0 = [];
  if (process.env.ANTES) { const c = await nuevo(), p = await c.newPage(); p.on("response", r => r.status() >= 400 && r0.push(new URL(r.url()).pathname.split("/").slice(2).join("/"))); await p.goto(`${L}${v}/`, { waitUntil: "load" }); await p.waitForTimeout(800); t0 = await p.evaluate(() => document.body.innerText); await c.close(); }
  const c = await nuevo(), p = await c.newPage(), e = [], r = []; p.on("pageerror", x => e.push(x.message)); p.on("response", x => x.status() >= 400 && r.push(new URL(x.url()).pathname.split("/guias/" + g + "/")[1]));
  await p.goto(B); await p.waitForTimeout(1200); await p.locator(`a[href="${g}/"]`).click(); await p.waitForURL(`**/guias/${g}/`); await p.waitForLoadState("load"); await p.waitForTimeout(800);
  if (t0 !== null) { const t1 = (await p.evaluate(() => document.body.innerText)).replace("‹ Todas las guías", ""); const n = s => s.replace(/\s+/g, " ").trim(); if (n(t0) !== n(t1)) { let i = 0; const a = n(t0), z = n(t1); while (a[i] === z[i]) i++; console.log("    antes:", a.slice(i - 30, i + 60), "| ahora:", z.slice(i - 30, i + 60)); } ok(n(t0) === n(t1), `mismo texto que la original (${t1.length} letras)`); }
  await p.waitForTimeout(2500); ok(await p.locator("#nuevaVersion").count() === 0, "sin aviso falso de versión nueva"); ok(!e.length, "sin errores JS " + e); ok(!r.filter(x => !r0.includes(x)).length, "sin ficheros perdidos " + r);
  const reg = await p.evaluate(() => navigator.serviceWorker.getRegistration().then(x => x && x.scope)); ok(reg === B + g + "/", "service worker propio " + reg);
  const ks = await p.evaluate(() => caches.keys()); ok(ks.every(k => k.startsWith("guias-")), "cachés " + ks);
  const og = await p.evaluate(() => document.querySelector('meta[property="og:image"]').content); ok(og.includes(`/guias/${g}/`), "imagen para WhatsApp " + og);
  ok(await p.locator(".otras-guias").isVisible(), "enlace de vuelta visible"); await p.screenshot({ path: `${process.env.SALIDA || "."}/${g}.png` });
  const n = await p.evaluate(async () => { const w = (await navigator.serviceWorker.ready).active; return new Promise(k => { navigator.serviceWorker.addEventListener("message", m => m.data.tipo === "LISTO" && k(m.data.total)); w.postMessage({ tipo: "GUARDAR" }); setTimeout(() => k(-1), 100000); }); });
  await c.setOffline(true); const f = await p.evaluate(async () => { const q = [...document.images].filter(i => i.getAttribute("src").startsWith("img/")).map(i => i.src); let m = 0; for (const u of q) { const x = await fetch(u).catch(() => null); if (!x || !x.ok || !(x.headers.get("content-type") || "").startsWith("image")) m++; } return [q.length, m]; });
  await p.goto(B + g + "/").catch(() => {}); ok(n > 0 && f[1] === 0 && await p.locator("h1").first().textContent().catch(() => "") !== "", `guardada: ${n} ficheros; sin conexión abre y faltan ${f[1]} de ${f[0]} fotos`); await c.setOffline(false);
  await p.goto(B + g + "/"); await p.locator(".otras-guias").click(); await p.waitForURL("**/guias/index.html"); ok(true, "vuelve a la portada"); await c.close(); }
await b.close(); srv.close(); srv.closeAllConnections(); console.log(mal ? "FALLOS " + mal : "TODO OK"); process.exit(mal ? 1 : 0);
