/**
 * Mise à jour des stats des joueurs depuis L'Équipe
 * Récupère : matchs joués, buts, passes décisives
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { initDb, runSql, saveDb, queryAll, queryOne } = require('../models/database');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function scrapePlayerStats(page, apiId) {
  const url = `https://www.lequipe.fr/Football/FootballFicheJoueur${apiId}.html`;

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1000);

    const content = await page.content();
    const $ = cheerio.load(content);
    const bodyText = $('body').text();

    // Extraire les stats de la saison 2025-2026
    const matchsMatch = bodyText.match(/Matchs?\s*joués?\s*:\s*(\d+)/i);
    const butsMatch = bodyText.match(/Buts?\s*marqués?\s*:\s*(\d+)/i);
    const passesMatch = bodyText.match(/Passes?\s*décisives?\s*:\s*(\d+)/i);

    // Nationalité
    const natMatch = bodyText.match(/Nationalité\s*:\s*([A-Za-zÀ-ÿ\s]+?)(?:\s{2,}|\n|$)/i);

    // Âge
    const ageMatch = bodyText.match(/(\d{1,2})\s*ans/i);

    // Numéro
    const numMatch = bodyText.match(/Numéro\s*:\s*(\d+)/i);

    return {
      matches_played: matchsMatch ? parseInt(matchsMatch[1], 10) : null,
      goals: butsMatch ? parseInt(butsMatch[1], 10) : null,
      assists: passesMatch ? parseInt(passesMatch[1], 10) : null,
      nationality: natMatch ? natMatch[1].trim() : null,
      age: ageMatch ? parseInt(ageMatch[1], 10) : null,
      number: numMatch ? parseInt(numMatch[1], 10) : null,
    };
  } catch (err) {
    return null;
  }
}

async function main() {
  console.log('📊 Mise à jour des stats joueurs\n');

  await initDb();

  const players = queryAll('SELECT id, api_id, name, club FROM players ORDER BY club, name');
  console.log(`📦 ${players.length} joueurs à mettre à jour\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  let updated = 0;
  let withStats = 0;

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    process.stdout.write(`\r   [${i + 1}/${players.length}] ${player.name.substring(0, 25).padEnd(25)}`);

    await sleep(500);
    const stats = await scrapePlayerStats(page, player.api_id);

    if (stats) {
      const updates = [];
      const values = [];

      if (stats.matches_played !== null) {
        updates.push('matches_played = ?');
        values.push(stats.matches_played);
      }
      if (stats.goals !== null) {
        updates.push('goals = ?');
        values.push(stats.goals);
      }
      if (stats.assists !== null) {
        updates.push('assists = ?');
        values.push(stats.assists);
      }
      if (stats.nationality) {
        updates.push('nationality = ?');
        values.push(stats.nationality);
      }
      if (stats.age !== null) {
        updates.push('age = ?');
        values.push(stats.age);
      }
      if (stats.number !== null) {
        updates.push('number = ?');
        values.push(stats.number);
      }

      if (updates.length > 0) {
        values.push(player.id);
        runSql(`UPDATE players SET ${updates.join(', ')} WHERE id = ?`, values);
        updated++;

        if (stats.matches_played > 0) withStats++;
      }
    }

    if ((i + 1) % 30 === 0) saveDb();
  }

  saveDb();
  await browser.close();

  // Résumé
  console.log('\n\n═══════════════════════════════════════');
  console.log('📊 RÉSUMÉ');
  console.log('═══════════════════════════════════════');
  console.log(`Joueurs traités: ${players.length}`);
  console.log(`Mis à jour: ${updated}`);
  console.log(`Avec stats (matchs > 0): ${withStats}`);

  // Top buteurs
  const topScorers = queryAll('SELECT name, club, goals, matches_played FROM players WHERE goals > 0 ORDER BY goals DESC LIMIT 10');
  console.log('\n🏆 Top 10 buteurs:');
  topScorers.forEach((p, i) => console.log(`   ${i + 1}. ${p.name} (${p.club}): ${p.goals} buts en ${p.matches_played} matchs`));

  // Top passeurs
  const topAssisters = queryAll('SELECT name, club, assists, matches_played FROM players WHERE assists > 0 ORDER BY assists DESC LIMIT 10');
  console.log('\n🎯 Top 10 passeurs:');
  topAssisters.forEach((p, i) => console.log(`   ${i + 1}. ${p.name} (${p.club}): ${p.assists} passes en ${p.matches_played} matchs`));

  console.log('\n✅ Terminé');
}

main().catch(console.error);
