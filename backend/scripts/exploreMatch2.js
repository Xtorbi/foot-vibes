/**
 * Explorer la structure avec interaction JavaScript
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

async function explore() {
  console.log('🔍 Exploration avec interactions JS\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  // Intercepter les requêtes XHR/Fetch pour voir les APIs
  const apiResponses = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api') || url.includes('json') || url.includes('graphql')) {
      try {
        if (response.headers()['content-type']?.includes('json')) {
          const data = await response.json();
          apiResponses.push({ url, data });
        }
      } catch (e) {}
    }
  });

  // 1. Page calendrier avec scroll
  console.log('1. Page calendrier avec scroll...');
  await page.goto('https://www.lequipe.fr/Football/ligue-1/page-calendrier-resultats/', {
    waitUntil: 'networkidle0',
    timeout: 60000
  });

  // Attendre le chargement initial
  await new Promise(r => setTimeout(r, 3000));

  // Scroll pour charger plus de contenu
  await page.evaluate(() => {
    window.scrollTo(0, 500);
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    window.scrollTo(0, 1000);
  });
  await new Promise(r => setTimeout(r, 2000));

  // Chercher et cliquer sur un onglet "Résultats" si présent
  try {
    const resultTab = await page.$('button:has-text("Résultats"), a:has-text("Résultats"), [class*="result"]');
    if (resultTab) {
      await resultTab.click();
      await new Promise(r => setTimeout(r, 2000));
      console.log('   Cliqué sur onglet Résultats');
    }
  } catch (e) {}

  let content = await page.content();
  fs.writeFileSync('debug_calendar_interactive.html', content);

  // Chercher les matchs dans le HTML
  let $ = cheerio.load(content);

  // Pattern plus large pour les liens
  const allHrefs = [];
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    allHrefs.push(href);
  });

  const matchHrefs = allHrefs.filter(h =>
    h.includes('match') ||
    h.includes('direct') ||
    h.includes('live') ||
    h.includes('compo')
  );

  console.log(`   Total liens: ${allHrefs.length}`);
  console.log(`   Liens matchs: ${matchHrefs.length}`);

  // Filtrer pour Ligue 1
  const l1Matches = matchHrefs.filter(h => h.includes('ligue-1'));
  console.log(`   Matchs Ligue 1: ${l1Matches.length}`);

  if (l1Matches.length > 0) {
    console.log('   Exemples:');
    [...new Set(l1Matches)].slice(0, 10).forEach(h => console.log(`      ${h}`));
  }

  // Vérifier les APIs appelées
  console.log(`\n   APIs interceptées: ${apiResponses.length}`);
  apiResponses.forEach(r => {
    console.log(`      ${r.url.substring(0, 80)}`);
    if (r.data && (r.data.matches || r.data.fixtures || r.data.events)) {
      console.log('      ✅ Contient des données de matchs!');
      fs.writeFileSync('api_matches.json', JSON.stringify(r.data, null, 2));
    }
  });

  // 2. Essayer une URL directe de match connu
  console.log('\n2. Test URL match directe...');

  // Construire une URL de match probable (journée 19)
  // Format typique: /Football/match-direct/ligue-1/2025-2026/equipe1-equipe2-live/ID
  const testUrls = [
    'https://www.lequipe.fr/Football/ligue-1/page-calendrier-resultats/journee-19',
    'https://www.lequipe.fr/Football/ligue-1/page-calendrier-resultats/journee-18',
  ];

  for (const url of testUrls) {
    console.log(`\n   Test: ${url}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 4000));

      content = await page.content();
      $ = cheerio.load(content);

      // Chercher les matchs
      const matches = [];
      $('a').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (href.includes('match-direct') && href.includes('ligue-1')) {
          matches.push(href);
        }
      });

      console.log(`   Matchs trouvés: ${matches.length}`);

      if (matches.length > 0) {
        console.log('   URLs:');
        [...new Set(matches)].forEach(m => console.log(`      ${m}`));

        // Aller sur le premier match
        const matchUrl = `https://www.lequipe.fr${matches[0]}`;
        console.log(`\n3. Exploration match: ${matchUrl}`);

        await page.goto(matchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 5000));

        content = await page.content();
        $ = cheerio.load(content);

        const title = $('title').text().trim();
        console.log(`   Titre: ${title}`);

        // Chercher les joueurs
        const players = new Map();
        $('a[href*="FootballFicheJoueur"]').each((_, el) => {
          const href = $(el).attr('href');
          const text = $(el).text().trim();
          const idMatch = href.match(/FootballFicheJoueur(\d+)/);
          if (text && text.length > 1 && idMatch) {
            players.set(idMatch[1], { name: text, href });
          }
        });

        console.log(`   Joueurs: ${players.size}`);
        if (players.size > 0) {
          console.log('   Liste:');
          [...players.values()].forEach(p => console.log(`      - ${p.name}`));

          fs.writeFileSync('debug_match_players.html', content);
          console.log('   HTML sauvegardé: debug_match_players.html');
        }

        // Chercher les données dans les scripts
        $('script').each((_, el) => {
          const scriptText = $(el).html() || '';
          if (scriptText.includes('lineup') || scriptText.includes('players') || scriptText.includes('composition')) {
            console.log('   ✅ Script avec données de composition trouvé');
          }
        });

        break;
      }
    } catch (err) {
      console.log(`   Erreur: ${err.message}`);
    }
  }

  await browser.close();
  console.log('\n✅ Exploration terminée');
}

explore().catch(console.error);
