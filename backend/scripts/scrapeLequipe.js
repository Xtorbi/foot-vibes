/**
 * Script de scraping L'Équipe pour récupérer les joueurs de Ligue 1
 *
 * Usage: node scripts/scrapeLequipe.js
 */

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const path = require('path');
const { initDb, runSql, saveDb, queryAll } = require('../models/database');
const { CURRENT_SEASON } = require('../config/clubs');

// Configuration des clubs L1 avec leurs slugs L'Équipe
const L1_CLUBS_LEQUIPE = [
  { name: 'Paris Saint-Germain', slug: 'paris-sg', shortName: 'Paris SG' },
  { name: 'Olympique de Marseille', slug: 'marseille', shortName: 'OM' },
  { name: 'Olympique Lyonnais', slug: 'lyon', shortName: 'Lyon' },
  { name: 'AS Monaco', slug: 'monaco', shortName: 'Monaco' },
  { name: 'LOSC Lille', slug: 'lille', shortName: 'Lille' },
  { name: 'OGC Nice', slug: 'nice', shortName: 'Nice' },
  { name: 'RC Lens', slug: 'lens', shortName: 'Lens' },
  { name: 'Stade Rennais', slug: 'rennes', shortName: 'Rennes' },
  { name: 'Stade Brestois 29', slug: 'brest', shortName: 'Brest' },
  { name: 'RC Strasbourg Alsace', slug: 'strasbourg', shortName: 'Strasbourg' },
  { name: 'Toulouse FC', slug: 'toulouse', shortName: 'Toulouse' },
  { name: 'FC Nantes', slug: 'nantes', shortName: 'Nantes' },
  { name: 'Le Havre AC', slug: 'le-havre', shortName: 'Le Havre' },
  { name: 'AJ Auxerre', slug: 'auxerre', shortName: 'Auxerre' },
  { name: 'Angers SCO', slug: 'angers', shortName: 'Angers' },
  { name: 'FC Lorient', slug: 'lorient', shortName: 'Lorient' },
  { name: 'Paris FC', slug: 'paris-fc', shortName: 'Paris FC' },
  { name: 'FC Metz', slug: 'metz', shortName: 'Metz' },
];

const POSITION_MAP = {
  'Gardien': 'Gardien',
  'Gardiens': 'Gardien',
  'G': 'Gardien',
  'Défenseur': 'Defenseur',
  'Défenseurs': 'Defenseur',
  'D': 'Defenseur',
  'Milieu': 'Milieu',
  'Milieux': 'Milieu',
  'M': 'Milieu',
  'Attaquant': 'Attaquant',
  'Attaquants': 'Attaquant',
  'A': 'Attaquant',
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeClubEffectif(browser, club) {
  const page = await browser.newPage();

  // User agent réaliste
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const url = `https://www.lequipe.fr/Football/club/${club.slug}/effectif`;
  console.log(`   URL: ${url}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Attendre que la page charge
    await sleep(2000);

    const content = await page.content();
    const $ = cheerio.load(content);

    const players = [];
    let currentPosition = 'Milieu';

    // Structure L'Équipe: sections par poste avec liste de joueurs
    // Chercher les différentes structures possibles

    // Structure 1: Divs avec classes spécifiques
    $('[class*="effectif"], [class*="roster"], [class*="squad"]').each((_, section) => {
      $(section).find('a[href*="/Football/Footballeur/"]').each((_, el) => {
        const $el = $(el);
        const href = $el.attr('href');
        const name = $el.text().trim();

        if (name && href) {
          players.push({
            name,
            href,
            position: currentPosition,
          });
        }
      });
    });

    // Structure 2: Liste directe de joueurs
    if (players.length === 0) {
      $('a[href*="/Football/Footballeur/"]').each((_, el) => {
        const $el = $(el);
        const href = $el.attr('href');
        let name = $el.text().trim();

        // Ignorer les liens trop courts ou génériques
        if (name && name.length > 2 && href && !href.includes('classement')) {
          // Essayer de détecter la position depuis le contexte
          const parentText = $el.parent().parent().text().toLowerCase();
          if (parentText.includes('gardien')) currentPosition = 'Gardien';
          else if (parentText.includes('défenseur')) currentPosition = 'Defenseur';
          else if (parentText.includes('milieu')) currentPosition = 'Milieu';
          else if (parentText.includes('attaquant')) currentPosition = 'Attaquant';

          // Éviter les doublons
          if (!players.find(p => p.href === href)) {
            players.push({
              name,
              href,
              position: currentPosition,
            });
          }
        }
      });
    }

    // Structure 3: Chercher dans les tables
    if (players.length === 0) {
      $('table').each((_, table) => {
        $(table).find('tr').each((_, row) => {
          const $row = $(row);
          const link = $row.find('a[href*="/Football/Footballeur/"]');
          if (link.length) {
            const name = link.text().trim();
            const href = link.attr('href');
            if (name && href) {
              players.push({
                name,
                href,
                position: currentPosition,
              });
            }
          }
        });
      });
    }

    await page.close();
    return players;

  } catch (err) {
    console.error(`   Erreur: ${err.message}`);
    await page.close();
    return [];
  }
}

async function scrapePlayerDetails(browser, playerUrl, clubName) {
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const fullUrl = playerUrl.startsWith('http') ? playerUrl : `https://www.lequipe.fr${playerUrl}`;

  try {
    await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1500);

    const content = await page.content();
    const $ = cheerio.load(content);

    // Extraire les infos du joueur
    const details = {
      nationality: '',
      age: 0,
      number: 0,
      photo_url: '',
      matches_played: 0,
      goals: 0,
      assists: 0,
      position: 'Milieu',
    };

    // Photo
    const img = $('img[src*="medias"]').first();
    if (img.length) {
      details.photo_url = img.attr('src');
    }

    // Chercher les stats dans différents formats
    const pageText = $('body').text();

    // Nationalité (chercher drapeau ou texte)
    const natMatch = pageText.match(/Nationalité\s*:\s*(\w+)/i);
    if (natMatch) details.nationality = natMatch[1];

    // Âge
    const ageMatch = pageText.match(/(\d{1,2})\s*ans/);
    if (ageMatch) details.age = parseInt(ageMatch[1], 10);

    // Numéro
    const numMatch = pageText.match(/N°\s*(\d{1,2})/);
    if (numMatch) details.number = parseInt(numMatch[1], 10);

    // Stats saison (matchs, buts, passes)
    // Format possible: "15 matchs", "5 buts", "3 passes décisives"
    const matchesMatch = pageText.match(/(\d+)\s*match/i);
    if (matchesMatch) details.matches_played = parseInt(matchesMatch[1], 10);

    const goalsMatch = pageText.match(/(\d+)\s*but/i);
    if (goalsMatch) details.goals = parseInt(goalsMatch[1], 10);

    const assistsMatch = pageText.match(/(\d+)\s*passe/i);
    if (assistsMatch) details.assists = parseInt(assistsMatch[1], 10);

    // Position
    if (pageText.toLowerCase().includes('gardien')) details.position = 'Gardien';
    else if (pageText.toLowerCase().includes('défenseur')) details.position = 'Defenseur';
    else if (pageText.toLowerCase().includes('milieu')) details.position = 'Milieu';
    else if (pageText.toLowerCase().includes('attaquant')) details.position = 'Attaquant';

    await page.close();
    return details;

  } catch (err) {
    console.error(`      Erreur détails: ${err.message}`);
    await page.close();
    return null;
  }
}

async function main() {
  console.log('🚀 Scraping L\'Équipe - Joueurs Ligue 1');
  console.log('');

  await initDb();

  // Vider les tables
  console.log('🗑️  Vidage de la base...');
  runSql('DELETE FROM votes');
  runSql('DELETE FROM players');
  saveDb();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let totalImported = 0;

  for (let i = 0; i < L1_CLUBS_LEQUIPE.length; i++) {
    const club = L1_CLUBS_LEQUIPE[i];
    console.log(`\n📦 [${i + 1}/${L1_CLUBS_LEQUIPE.length}] ${club.name}`);

    const players = await scrapeClubEffectif(browser, club);
    console.log(`   ${players.length} joueurs trouvés`);

    if (players.length === 0) {
      console.log('   ⚠️  Aucun joueur - vérifier la structure de la page');
      continue;
    }

    // Pour chaque joueur, récupérer les détails (limité pour éviter surcharge)
    for (let j = 0; j < Math.min(players.length, 35); j++) {
      const player = players[j];

      await sleep(1000); // Rate limiting

      const details = await scrapePlayerDetails(browser, player.href, club.name);

      const fullName = player.name;
      const nameParts = fullName.split(' ');
      const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0];
      const lastName = nameParts[nameParts.length - 1];

      const position = details?.position || POSITION_MAP[player.position] || 'Milieu';

      runSql(`
        INSERT INTO players (
          first_name, last_name, name, club, position, nationality,
          photo_url, age, number,
          matches_played, goals, assists, clean_sheets, saves,
          source_season
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
      `, [
        firstName,
        lastName,
        fullName,
        club.name,
        position,
        details?.nationality || '',
        details?.photo_url || '',
        details?.age || 0,
        details?.number || 0,
        details?.matches_played || 0,
        details?.goals || 0,
        details?.assists || 0,
        CURRENT_SEASON,
      ]);

      totalImported++;
      process.stdout.write(`\r   Importé: ${j + 1}/${Math.min(players.length, 35)}`);
    }

    console.log('');
    saveDb();

    // Pause entre les clubs
    await sleep(2000);
  }

  await browser.close();

  console.log('\n═══════════════════════════════════════');
  console.log(`✅ Import terminé: ${totalImported} joueurs`);

  // Vérification
  const count = queryAll('SELECT COUNT(*) as c FROM players')[0];
  console.log(`   Vérification DB: ${count?.c || 0} joueurs`);
}

main().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
