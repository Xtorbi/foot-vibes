/**
 * Script de scraping L'Équipe - Version finale
 * Récupère les joueurs via la page des buteurs et les fiches joueurs
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { initDb, runSql, saveDb, queryAll } = require('../models/database');
const { CURRENT_SEASON } = require('../config/clubs');

// Mapping des clubs L'Équipe vers nos noms
const CLUB_MAPPING = {
  'Paris SG': 'Paris Saint-Germain',
  'Paris Saint-Germain': 'Paris Saint-Germain',
  'PSG': 'Paris Saint-Germain',
  'Marseille': 'Olympique de Marseille',
  'OM': 'Olympique de Marseille',
  'Olympique de Marseille': 'Olympique de Marseille',
  'Lyon': 'Olympique Lyonnais',
  'OL': 'Olympique Lyonnais',
  'Olympique Lyonnais': 'Olympique Lyonnais',
  'Monaco': 'AS Monaco',
  'AS Monaco': 'AS Monaco',
  'Lille': 'LOSC Lille',
  'LOSC': 'LOSC Lille',
  'LOSC Lille': 'LOSC Lille',
  'Nice': 'OGC Nice',
  'OGC Nice': 'OGC Nice',
  'Lens': 'RC Lens',
  'RC Lens': 'RC Lens',
  'Rennes': 'Stade Rennais',
  'Stade Rennais': 'Stade Rennais',
  'Brest': 'Stade Brestois 29',
  'Stade Brestois': 'Stade Brestois 29',
  'Strasbourg': 'RC Strasbourg Alsace',
  'RC Strasbourg': 'RC Strasbourg Alsace',
  'Toulouse': 'Toulouse FC',
  'Toulouse FC': 'Toulouse FC',
  'Nantes': 'FC Nantes',
  'FC Nantes': 'FC Nantes',
  'Le Havre': 'Le Havre AC',
  'Le Havre AC': 'Le Havre AC',
  'Auxerre': 'AJ Auxerre',
  'AJ Auxerre': 'AJ Auxerre',
  'Angers': 'Angers SCO',
  'Angers SCO': 'Angers SCO',
  'Lorient': 'FC Lorient',
  'FC Lorient': 'FC Lorient',
  'Paris FC': 'Paris FC',
  'Metz': 'FC Metz',
  'FC Metz': 'FC Metz',
};

const L1_CLUBS = Object.values(CLUB_MAPPING).filter((v, i, a) => a.indexOf(v) === i);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeClub(clubName) {
  return CLUB_MAPPING[clubName] || clubName;
}

async function scrapeButeursPage(page) {
  console.log('📊 Scraping page des buteurs...');

  await page.goto('https://www.lequipe.fr/Football/ligue-1/page-classement-individuel/buteurs', {
    waitUntil: 'networkidle2',
    timeout: 45000
  });
  await sleep(4000);

  const content = await page.content();
  const $ = cheerio.load(content);

  // Extraire les joueurs avec leurs IDs
  const players = [];
  const playerIds = new Set();

  // Trouver tous les liens vers des fiches joueurs
  $('a[href*="FootballFicheJoueur"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const match = href.match(/FootballFicheJoueur(\d+)/);
    if (match && !playerIds.has(match[1])) {
      playerIds.add(match[1]);

      // Essayer de récupérer le nom depuis le contexte
      let name = $(el).text().trim();
      if (!name || name.length < 2) {
        name = $(el).find('span, div').first().text().trim();
      }

      players.push({
        id: match[1],
        href: href,
        name: name || `Joueur_${match[1]}`,
      });
    }
  });

  console.log(`   ${players.length} joueurs trouvés sur la page buteurs`);
  return players;
}

async function scrapePasseursPage(page) {
  console.log('📊 Scraping page des passeurs...');

  await page.goto('https://www.lequipe.fr/Football/ligue-1/page-classement-individuel/passeurs', {
    waitUntil: 'networkidle2',
    timeout: 45000
  });
  await sleep(4000);

  const content = await page.content();
  const $ = cheerio.load(content);

  const players = [];
  const playerIds = new Set();

  $('a[href*="FootballFicheJoueur"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const match = href.match(/FootballFicheJoueur(\d+)/);
    if (match && !playerIds.has(match[1])) {
      playerIds.add(match[1]);
      let name = $(el).text().trim();
      players.push({
        id: match[1],
        href: href,
        name: name || `Joueur_${match[1]}`,
      });
    }
  });

  console.log(`   ${players.length} joueurs trouvés sur la page passeurs`);
  return players;
}

async function scrapePlayerFiche(page, playerId) {
  const url = `https://www.lequipe.fr/Football/FootballFicheJoueur${playerId}.html`;

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    await sleep(2000);

    const content = await page.content();
    const $ = cheerio.load(content);

    const details = {
      name: '',
      firstName: '',
      lastName: '',
      club: '',
      position: 'Milieu',
      nationality: '',
      age: 0,
      number: 0,
      photo_url: '',
      matches_played: 0,
      goals: 0,
      assists: 0,
    };

    // Nom du joueur (titre de la page ou h1)
    const title = $('title').text();
    const nameMatch = title.match(/^([^-–]+)/);
    if (nameMatch) {
      details.name = nameMatch[1].trim();
      const parts = details.name.split(' ');
      details.firstName = parts.slice(0, -1).join(' ') || parts[0];
      details.lastName = parts[parts.length - 1];
    }

    // Photo
    const img = $('img[src*="medias"]').first();
    if (img.length) {
      details.photo_url = img.attr('src') || '';
    }

    // Texte complet pour extraction
    const bodyText = $('body').text();

    // Club (chercher les noms de clubs L1)
    for (const clubName of Object.keys(CLUB_MAPPING)) {
      if (bodyText.includes(clubName)) {
        details.club = normalizeClub(clubName);
        break;
      }
    }

    // Position
    if (bodyText.toLowerCase().includes('gardien')) details.position = 'Gardien';
    else if (bodyText.toLowerCase().includes('défenseur')) details.position = 'Defenseur';
    else if (bodyText.toLowerCase().includes('milieu')) details.position = 'Milieu';
    else if (bodyText.toLowerCase().includes('attaquant')) details.position = 'Attaquant';

    // Nationalité
    const natPatterns = [
      /Nationalité\s*:\s*(\w+)/i,
      /nationalité\s+(\w+)/i,
    ];
    for (const pattern of natPatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        details.nationality = match[1];
        break;
      }
    }

    // Âge
    const ageMatch = bodyText.match(/(\d{2})\s*ans/);
    if (ageMatch) details.age = parseInt(ageMatch[1], 10);

    // Stats saison 2025-2026
    // Chercher les stats dans différents formats
    const statsPatterns = [
      /(\d+)\s*matchs?\s*(joués?)?/i,
      /(\d+)\s*titularisations?/i,
    ];
    for (const pattern of statsPatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        details.matches_played = parseInt(match[1], 10);
        break;
      }
    }

    const goalsMatch = bodyText.match(/(\d+)\s*buts?(?!\s*encaissés)/i);
    if (goalsMatch) details.goals = parseInt(goalsMatch[1], 10);

    const assistsMatch = bodyText.match(/(\d+)\s*passes?\s*(décisives?|D)/i);
    if (assistsMatch) details.assists = parseInt(assistsMatch[1], 10);

    return details;

  } catch (err) {
    console.error(`   Erreur fiche ${playerId}: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('🚀 Scraping L\'Équipe - Joueurs Ligue 1\n');
  console.log('   Saison:', CURRENT_SEASON);
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

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    // Récupérer les joueurs des classements
    const buteurs = await scrapeButeursPage(page);
    const passeurs = await scrapePasseursPage(page);

    // Fusionner et dédupliquer
    const allPlayerIds = new Map();
    [...buteurs, ...passeurs].forEach(p => {
      if (!allPlayerIds.has(p.id)) {
        allPlayerIds.set(p.id, p);
      }
    });

    const playersList = Array.from(allPlayerIds.values());
    console.log(`\n📦 Total joueurs uniques: ${playersList.length}`);

    // Scraper chaque fiche joueur
    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < playersList.length; i++) {
      const player = playersList[i];
      process.stdout.write(`\r   Traitement: ${i + 1}/${playersList.length} - ${player.name || player.id}`);

      await sleep(1500); // Rate limiting

      const details = await scrapePlayerFiche(page, player.id);

      if (details && details.name && details.club && L1_CLUBS.includes(details.club)) {
        runSql(`
          INSERT INTO players (
            first_name, last_name, name, club, position, nationality,
            photo_url, age, number,
            matches_played, goals, assists, clean_sheets, saves,
            source_season, api_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
        `, [
          details.firstName,
          details.lastName,
          details.name,
          details.club,
          details.position,
          details.nationality,
          details.photo_url,
          details.age,
          details.number,
          details.matches_played,
          details.goals,
          details.assists,
          CURRENT_SEASON,
          parseInt(player.id, 10),
        ]);
        imported++;
      } else {
        skipped++;
      }

      // Sauvegarder tous les 10 joueurs
      if ((i + 1) % 10 === 0) {
        saveDb();
      }
    }

    saveDb();

    console.log('\n\n═══════════════════════════════════════');
    console.log('📊 RÉSUMÉ');
    console.log('═══════════════════════════════════════');
    console.log(`Joueurs importés: ${imported}`);
    console.log(`Joueurs ignorés (hors L1): ${skipped}`);

    // Vérification
    const dbCount = queryAll('SELECT COUNT(*) as c FROM players')[0];
    console.log(`Vérification DB: ${dbCount?.c || 0} joueurs`);

    // Stats par club
    console.log('\nPar club:');
    const byClub = queryAll('SELECT club, COUNT(*) as c FROM players GROUP BY club ORDER BY c DESC');
    byClub.forEach(row => console.log(`   ${row.club}: ${row.c}`));

  } catch (err) {
    console.error('\n❌ Erreur:', err.message);
  }

  await browser.close();
  console.log('\n✅ Scraping terminé');
}

main().catch(console.error);
