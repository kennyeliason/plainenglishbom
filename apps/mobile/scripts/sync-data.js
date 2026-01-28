/**
 * Syncs scripture data from the monorepo's data/transformed/ directory
 * to the mobile app's assets folder.
 *
 * This ensures a single source of truth for scripture data across web and mobile.
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '../../../data/transformed');
const TARGET_DIR = path.join(__dirname, '../assets/data');

const LOCALES = ['en', 'es'];

// Ensure target directory exists
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

let synced = 0;
let skipped = 0;

for (const locale of LOCALES) {
  const sourceFile = path.join(SOURCE_DIR, locale, 'parsed.json');
  const targetFile = path.join(TARGET_DIR, `${locale}.json`);

  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, targetFile);
    const stats = fs.statSync(sourceFile);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`✓ Synced ${locale}.json (${sizeMB} MB)`);
    synced++;
  } else {
    console.log(`⚠ Skipped ${locale} - source not found: ${sourceFile}`);
    skipped++;
  }
}

console.log(`\nSync complete: ${synced} synced, ${skipped} skipped`);
