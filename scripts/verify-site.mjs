import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const appDirectory = new URL('../src/app', import.meta.url);
const sourceDirectory = new URL('../src', import.meta.url);

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const appFiles = walk(appDirectory.pathname);
const sourceFiles = walk(sourceDirectory.pathname).filter((path) => /\.(ts|tsx)$/.test(path));
const routes = new Set(['/']);

for (const page of appFiles.filter((path) => path.endsWith('/page.tsx'))) {
  const route = relative(appDirectory.pathname, page)
    .replace(/\/page\.tsx$/, '')
    .replace(/\\/g, '/');
  if (!route.includes('[')) routes.add(`/${route}`);
}

const internalLinks = sourceFiles.flatMap((path) => {
  const source = readFileSync(path, 'utf8');
  return [...source.matchAll(/href=["'](\/[A-Za-z0-9_/#-]*)["']/g)].map((match) => ({
    path,
    href: match[1],
  }));
});

for (const link of internalLinks) {
  const [pathname, fragment] = link.href.split('#');
  assert.ok(routes.has(pathname || '/'), `Route interne absente: ${link.href} dans ${link.path}`);
  if (fragment) {
    const targetExists = sourceFiles.some((path) =>
      readFileSync(path, 'utf8').includes(`id="${fragment}"`));
    assert.ok(targetExists, `Ancre interne absente: ${link.href}`);
  }
}

for (const requiredFile of ['not-found.tsx', 'icon.svg', 'opengraph-image.tsx', 'robots.ts', 'sitemap.ts']) {
  assert.ok(existsSync(new URL(`../src/app/${requiredFile}`, import.meta.url)), `${requiredFile} manque`);
}

console.log(`${internalLinks.length} liens internes statiques vérifiés.`);
