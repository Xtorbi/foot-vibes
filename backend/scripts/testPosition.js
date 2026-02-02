/**
 * Test de détection de position sur quelques joueurs
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { initDb, queryAll } = require('../models/database');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function analyzePlayerPage(page, playerId, playerName) {
  try {
    const url = `https://www.lequipe.fr/Football/FootballFicheJoueur${playerId}.html`;
    console.log(`\n📄 ${playerName} - ${url}`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1000);

    const content = await page.content();
    const $ = cheerio.load(content);
    const bodyText = $('body').text();

    // Rechercher patterns liés à la position
    console.log('\n   Patterns trouvés:');

    // Pattern "Poste :"
    const posteMatch = bodyText.match(/Poste\s*:?\s*\w+/gi);
    if (posteMatch) {
      posteMatch.forEach(m => console.log(`   - "${m}"`));
    }

    // Pattern positions
    const positions = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant', 'Ailier', 'Avant-centre', 'Arrière', 'Latéral'];
    positions.forEach(pos => {
      const regex = new RegExp(`\\b${pos}\\b`, 'gi');
      const matches = bodyText.match(regex);
      if (matches) {
        console.log(`   - "${pos}" trouvé ${matches.length} fois`);
      }
    });

    // Contexte autour de "Poste"
    const posteContext = bodyText.match(/.{0,30}Poste.{0,50}/gi);
    if (posteContext) {
      console.log('\n   Contexte "Poste":');
      posteContext.forEach(ctx => console.log(`   "${ctx.trim()}"`));
    }

    // Chercher éléments structurés
    console.log('\n   Structure HTML:');
    $('[class*="position"], [class*="poste"], dt, .label').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 100 && /poste|position|gardien|défenseur|milieu|attaquant/i.test(text)) {
        console.log(`   <${el.tagName}> "${text.substring(0, 80)}"`);
      }
    });

  } catch (err) {
    console.log(`   ❌ Erreur: ${err.message}`);
  }
}

async function main() {
  console.log('🔍 Test détection positions\n');

  await initDb();

  // Prendre quelques joueurs avec des positions connues
  const testPlayers = queryAll('SELECT api_id, name FROM players LIMIT 5');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  for (const player of testPlayers) {
    await analyzePlayerPage(page, player.api_id, player.name);
  }

  await browser.close();
  console.log('\n✅ Test terminé');
}

main().catch(console.error);
