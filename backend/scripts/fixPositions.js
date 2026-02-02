/**
 * Correction des positions des joueurs
 * Utilise une détection plus précise basée sur le contexte
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { initDb, runSql, saveDb, queryAll } = require('../models/database');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function detectPosition(page, playerId) {
  try {
    const url = `https://www.lequipe.fr/Football/FootballFicheJoueur${playerId}.html`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 12000 });
    await sleep(500);

    const content = await page.content();
    const $ = cheerio.load(content);
    const bodyText = $('body').text();

    // Le pattern fiable est "Poste : X"
    const posteMatch = bodyText.match(/Poste\s*:\s*(Gardien|Défenseur|Milieu|Attaquant)/i);

    if (posteMatch) {
      const pos = posteMatch[1].toLowerCase();
      if (pos.includes('gardien')) return 'Gardien';
      if (pos.includes('défenseur')) return 'Defenseur';
      if (pos.includes('attaquant')) return 'Attaquant';
      if (pos.includes('milieu')) return 'Milieu';
    }

    return 'Milieu';
  } catch (err) {
    return 'Milieu';
  }
}

async function main() {
  console.log('🔧 Correction des positions\n');

  await initDb();

  const players = queryAll('SELECT id, api_id, name, position FROM players');
  console.log(`📦 ${players.length} joueurs à vérifier\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  const stats = { Gardien: 0, Defenseur: 0, Milieu: 0, Attaquant: 0 };

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    process.stdout.write(`\r   [${i + 1}/${players.length}] ${player.name.substring(0, 25).padEnd(25)}`);

    await sleep(400);
    const newPosition = await detectPosition(page, player.api_id);

    if (newPosition !== player.position) {
      runSql('UPDATE players SET position = ? WHERE id = ?', [newPosition, player.id]);
    }

    stats[newPosition]++;

    if ((i + 1) % 30 === 0) saveDb();
  }

  saveDb();
  await browser.close();

  console.log('\n\n═══════════════════════════════════════');
  console.log('📊 RÉSUMÉ');
  console.log('═══════════════════════════════════════');
  console.log(`Gardien: ${stats.Gardien}`);
  console.log(`Defenseur: ${stats.Defenseur}`);
  console.log(`Milieu: ${stats.Milieu}`);
  console.log(`Attaquant: ${stats.Attaquant}`);
  console.log('\n✅ Terminé');
}

main().catch(console.error);
