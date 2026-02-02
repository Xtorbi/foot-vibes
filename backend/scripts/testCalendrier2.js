/**
 * Test scraping calendrier avec attente du contenu dynamique
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

async function test() {
  console.log('🔍 Exploration calendrier Ligue 1 (avec attente JS)\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Intercepter les requêtes réseau pour voir les appels API
  const apiCalls = [];
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('api') || url.includes('json') || url.includes('graphql')) {
      apiCalls.push(url);
    }
    request.continue();
  });

  page.on('response', async (response) => {
    const url = response.url();
    if ((url.includes('api') || url.includes('json')) && response.status() === 200) {
      try {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('json')) {
          const data = await response.json();
          if (data.matches || data.fixtures || data.games || data.results) {
            console.log(`   ✅ API avec données matchs: ${url.substring(0, 80)}`);
            fs.writeFileSync('api_response.json', JSON.stringify(data, null, 2));
          }
        }
      } catch (e) {
        // Ignorer
      }
    }
  });

  console.log('1. Page calendrier avec attente complète:');
  try {
    await page.goto('https://www.lequipe.fr/Football/ligue-1/page-calendrier-resultats/', {
      waitUntil: 'networkidle0', // Attendre que le réseau soit vraiment calme
      timeout: 45000
    });

    // Attendre un peu plus
    await new Promise(r => setTimeout(r, 5000));

    // Scroll pour déclencher le chargement paresseux
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await new Promise(r => setTimeout(r, 2000));

    const content = await page.content();
    fs.writeFileSync('debug_calendrier_full.html', content);

    // Analyser avec cheerio
    const $ = cheerio.load(content);

    // Chercher les liens de matchs dans tout le HTML
    console.log('\n   Analyse du HTML complet...');

    // Pattern: lien vers match
    const hrefs = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      hrefs.push(href);
    });

    const matchHrefs = hrefs.filter(h =>
      (h.includes('match') || h.includes('direct') || h.includes('Direct')) &&
      !h.includes('mercato') &&
      !h.includes('actu')
    );

    console.log(`   Total liens: ${hrefs.length}`);
    console.log(`   Liens matchs potentiels: ${matchHrefs.length}`);

    if (matchHrefs.length > 0) {
      console.log('   Exemples:');
      [...new Set(matchHrefs)].slice(0, 10).forEach(h => console.log(`      ${h}`));
    }

    // Chercher par texte les scores type "2 - 1"
    const bodyText = $('body').text();
    const scores = bodyText.match(/\b(\d)\s*[-–]\s*(\d)\b/g);
    if (scores) {
      console.log(`\n   Scores trouvés: ${scores.length}`);
      console.log('   Exemples:', [...new Set(scores)].slice(0, 10).join(', '));
    }

    // Chercher les éléments avec data-* attributs
    const dataElements = [];
    $('[data-match], [data-fixture], [data-game], [data-id]').each((_, el) => {
      dataElements.push({
        tag: el.tagName,
        dataMatch: $(el).attr('data-match'),
        dataId: $(el).attr('data-id'),
      });
    });
    if (dataElements.length > 0) {
      console.log(`\n   Éléments avec data-*: ${dataElements.length}`);
    }

  } catch (err) {
    console.log('   Erreur:', err.message);
  }

  console.log('\n   Appels API interceptés:', apiCalls.length);
  if (apiCalls.length > 0) {
    apiCalls.slice(0, 5).forEach(u => console.log(`      ${u.substring(0, 100)}`));
  }

  // Test 2: Page d'un match terminé récent
  console.log('\n2. Test match terminé (via recherche):');
  try {
    // Aller sur la page d'un match récent connu
    // PSG vs quelqu'un par exemple
    const matchUrl = 'https://www.lequipe.fr/Football/match-direct/ligue-1/2025-2026/paris-sg-nantes-live/676339';
    console.log(`   URL: ${matchUrl}`);

    await page.goto(matchUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 4000));

    const content = await page.content();
    const $ = cheerio.load(content);

    console.log('   Titre:', $('title').text().trim().substring(0, 60));

    // Chercher les joueurs
    const players = new Map();
    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      if (href.includes('Footballeur') && text.length > 2 && text.length < 40) {
        players.set(text, href);
      }
    });

    console.log(`   Joueurs trouvés: ${players.size}`);
    if (players.size > 0) {
      console.log('   Liste:');
      [...players.keys()].forEach(p => console.log(`      - ${p}`));
    }

    fs.writeFileSync('debug_match_psg.html', content);

  } catch (err) {
    console.log('   Erreur:', err.message);
  }

  await browser.close();
  console.log('\n✅ Test terminé');
}

test().catch(console.error);
