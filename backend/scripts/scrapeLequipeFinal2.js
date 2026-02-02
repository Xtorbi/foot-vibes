/**
 * Script de scraping L'Équipe - Version corrigée
 * Meilleure détection des clubs
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const { initDb, runSql, saveDb, queryAll } = require('../models/database');
const { CURRENT_SEASON } = require('../config/clubs');

// Liste des clubs L1 avec variantes (ordre du plus spécifique au plus général)
const CLUBS_PATTERNS = [
  { patterns: ['Paris Saint-Germain', 'Paris SG', 'PSG'], name: 'Paris Saint-Germain' },
  { patterns: ['Paris FC'], name: 'Paris FC' },
  { patterns: ['Olympique de Marseille', 'Marseille', 'OM'], name: 'Olympique de Marseille' },
  { patterns: ['Olympique Lyonnais', 'Lyon', 'OL'], name: 'Olympique Lyonnais' },
  { patterns: ['AS Monaco', 'Monaco'], name: 'AS Monaco' },
  { patterns: ['LOSC Lille', 'LOSC', 'Lille'], name: 'LOSC Lille' },
  { patterns: ['OGC Nice', 'Nice'], name: 'OGC Nice' },
  { patterns: ['RC Lens', 'Lens'], name: 'RC Lens' },
  { patterns: ['Stade Rennais', 'Rennes'], name: 'Stade Rennais' },
  { patterns: ['Stade Brestois', 'Brest'], name: 'Stade Brestois 29' },
  { patterns: ['RC Strasbourg', 'Strasbourg'], name: 'RC Strasbourg Alsace' },
  { patterns: ['Toulouse FC', 'Toulouse'], name: 'Toulouse FC' },
  { patterns: ['FC Nantes', 'Nantes'], name: 'FC Nantes' },
  { patterns: ['Le Havre AC', 'Le Havre'], name: 'Le Havre AC' },
  { patterns: ['AJ Auxerre', 'Auxerre'], name: 'AJ Auxerre' },
  { patterns: ['Angers SCO', 'Angers'], name: 'Angers SCO' },
  { patterns: ['FC Lorient', 'Lorient'], name: 'FC Lorient' },
  { patterns: ['FC Metz', 'Metz'], name: 'FC Metz' },
];

const L1_CLUBS = CLUBS_PATTERNS.map(c => c.name);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function detectClub(text) {
  // Chercher les patterns du plus spécifique au plus général
  for (const club of CLUBS_PATTERNS) {
    for (const pattern of club.patterns) {
      // Utiliser une regex pour matcher le mot complet
      const regex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(text)) {
        return club.name;
      }
    }
  }
  return null;
}

async function scrapeRankingPage(page, url, description) {
  console.log(`📊 Scraping ${description}...`);

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
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
      players.push({ id: match[1], href, name: name || `Joueur_${match[1]}` });
    }
  });

  console.log(`   ${players.length} joueurs trouvés`);
  return players;
}

async function scrapePlayerFiche(page, playerId) {
  const url = `https://www.lequipe.fr/Football/FootballFicheJoueur${playerId}.html`;

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    await sleep(1500);

    const content = await page.content();
    const $ = cheerio.load(content);

    const details = {
      name: '',
      firstName: '',
      lastName: '',
      club: null,
      position: 'Milieu',
      nationality: '',
      age: 0,
      number: 0,
      photo_url: '',
      matches_played: 0,
      goals: 0,
      assists: 0,
    };

    // Titre de la page pour le nom
    const title = $('title').text();
    const nameMatch = title.match(/^([^-–:]+)/);
    if (nameMatch) {
      details.name = nameMatch[1].trim().replace(/\s+/g, ' ');
      const parts = details.name.split(' ');
      details.firstName = parts.slice(0, -1).join(' ') || parts[0];
      details.lastName = parts[parts.length - 1];
    }

    // Photo - chercher dans plusieurs formats
    $('img').each((_, el) => {
      const src = $(el).attr('src') || '';
      if (src.includes('medias') && src.includes('joueur') && !details.photo_url) {
        details.photo_url = src;
      }
    });

    // Texte complet de la page
    const bodyText = $('body').text();

    // Club - utiliser la fonction de détection améliorée
    // D'abord chercher dans une zone spécifique (header, infos joueur)
    const headerText = $('header, .player-info, .PlayerHeader, h1, h2').text();
    details.club = detectClub(headerText);

    // Si pas trouvé, chercher dans le titre
    if (!details.club) {
      details.club = detectClub(title);
    }

    // Si toujours pas trouvé, chercher dans le body mais avec plus de contexte
    if (!details.club) {
      // Chercher les patterns "joue à", "évolue à", etc.
      const clubContextMatch = bodyText.match(/(joue|évolue|appartient).*?(Paris|Marseille|Lyon|Monaco|Lille|Nice|Lens|Rennes|Brest|Strasbourg|Toulouse|Nantes|Le Havre|Auxerre|Angers|Lorient|Metz)/i);
      if (clubContextMatch) {
        details.club = detectClub(clubContextMatch[2]);
      }
    }

    // Position
    const positionPatterns = [
      { regex: /gardien/i, pos: 'Gardien' },
      { regex: /défenseur|arrière/i, pos: 'Defenseur' },
      { regex: /milieu/i, pos: 'Milieu' },
      { regex: /attaquant|avant/i, pos: 'Attaquant' },
    ];
    for (const { regex, pos } of positionPatterns) {
      if (regex.test(bodyText)) {
        details.position = pos;
        break;
      }
    }

    // Nationalité
    const natMatch = bodyText.match(/Nationalité\s*:?\s*(\w+)/i);
    if (natMatch) details.nationality = natMatch[1];

    // Âge
    const ageMatch = bodyText.match(/(\d{2})\s*ans/);
    if (ageMatch) details.age = parseInt(ageMatch[1], 10);

    // Stats saison
    const matchesMatch = bodyText.match(/(\d+)\s*matchs?/i);
    if (matchesMatch) details.matches_played = parseInt(matchesMatch[1], 10);

    const goalsMatch = bodyText.match(/(\d+)\s*buts?(?!\s*(encaissés|contre))/i);
    if (goalsMatch) details.goals = parseInt(goalsMatch[1], 10);

    const assistsMatch = bodyText.match(/(\d+)\s*passes?\s*(décisives?|D\.?)/i);
    if (assistsMatch) details.assists = parseInt(assistsMatch[1], 10);

    return details;

  } catch (err) {
    return null;
  }
}

async function main() {
  console.log('🚀 Scraping L\'Équipe - Joueurs Ligue 1 (v2)\n');
  console.log('   Saison:', CURRENT_SEASON);
  console.log('');

  await initDb();

  console.log('🗑️  Vidage de la base...');
  runSql('DELETE FROM votes');
  runSql('DELETE FROM players');
  saveDb();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  try {
    // Récupérer les joueurs des différents classements
    const buteurs = await scrapeRankingPage(page,
      'https://www.lequipe.fr/Football/ligue-1/page-classement-individuel/buteurs',
      'buteurs');

    const passeurs = await scrapeRankingPage(page,
      'https://www.lequipe.fr/Football/ligue-1/page-classement-individuel/passeurs',
      'passeurs');

    // Fusionner et dédupliquer
    const allPlayerIds = new Map();
    [...buteurs, ...passeurs].forEach(p => {
      if (!allPlayerIds.has(p.id)) allPlayerIds.set(p.id, p);
    });

    const playersList = Array.from(allPlayerIds.values());
    console.log(`\n📦 Total joueurs uniques: ${playersList.length}`);

    let imported = 0;
    let skipped = 0;
    const noClub = [];

    for (let i = 0; i < playersList.length; i++) {
      const player = playersList[i];
      process.stdout.write(`\r   [${i + 1}/${playersList.length}] ${player.name.padEnd(25)}`);

      await sleep(1200);

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
        if (details) {
          noClub.push({ name: details.name, detectedClub: details.club });
        }
      }

      if ((i + 1) % 10 === 0) saveDb();
    }

    saveDb();

    console.log('\n\n═══════════════════════════════════════');
    console.log('📊 RÉSUMÉ');
    console.log('═══════════════════════════════════════');
    console.log(`Joueurs importés: ${imported}`);
    console.log(`Joueurs ignorés: ${skipped}`);

    if (noClub.length > 0) {
      console.log('\nJoueurs sans club détecté:');
      noClub.slice(0, 10).forEach(p => console.log(`   - ${p.name}: "${p.detectedClub}"`));
    }

    const dbCount = queryAll('SELECT COUNT(*) as c FROM players')[0];
    console.log(`\nVérification DB: ${dbCount?.c || 0} joueurs`);

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
