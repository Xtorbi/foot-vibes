/**
 * Test accès page calendrier L'Équipe
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function test() {
  console.log('🔍 Test accès calendrier L\'Équipe\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  await page.goto('https://www.lequipe.fr/Football/ligue-1/page-calendrier-resultats', {
    waitUntil: 'networkidle2',
    timeout: 45000
  });

  // Attendre le chargement
  await new Promise(r => setTimeout(r, 5000));

  const content = await page.content();
  const $ = cheerio.load(content);

  console.log('Titre:', $('title').text().trim());

  // Chercher les matchs
  const matchLinks = [];
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.includes('match-direct') && href.includes('ligue-1')) {
      matchLinks.push(href);
    }
  });

  console.log(`\nMatchs trouvés: ${matchLinks.length}`);

  // Dédupliquer et afficher
  const unique = [...new Set(matchLinks)];
  console.log(`Matchs uniques: ${unique.length}\n`);

  if (unique.length > 0) {
    console.log('Liste des matchs:');
    unique.forEach(m => {
      // Extraire les infos du match
      const parts = m.match(/ligue-1\/2025-2026\/([^/]+)\/(\d+)/);
      if (parts) {
        console.log(`  ID ${parts[2]}: ${parts[1]}`);
      }
    });
  }

  // Chercher les journées
  const journees = [];
  $('*').each((_, el) => {
    const text = $(el).text();
    const match = text.match(/Journée\s*(\d+)/i);
    if (match && !journees.includes(match[1])) {
      journees.push(match[1]);
    }
  });

  if (journees.length > 0) {
    console.log(`\nJournées détectées: ${journees.sort((a,b) => a-b).join(', ')}`);
  }

  await browser.close();
  console.log('\n✅ Test terminé');
}

test().catch(console.error);
