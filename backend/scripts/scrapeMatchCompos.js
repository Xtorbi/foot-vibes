/**
 * Scraper les compositions de matchs L'Équipe
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const { initDb, runSql, saveDb, queryAll, queryOne } = require('../models/database');
const { CURRENT_SEASON } = require('../config/clubs');

// Mapping clubs
const CLUB_NORMALIZE = {
  'PSG': 'Paris Saint-Germain', 'Paris SG': 'Paris Saint-Germain', 'Paris': 'Paris Saint-Germain',
  'OM': 'Olympique de Marseille', 'Marseille': 'Olympique de Marseille',
  'OL': 'Olympique Lyonnais', 'Lyon': 'Olympique Lyonnais',
  'Monaco': 'AS Monaco', 'ASM': 'AS Monaco',
  'LOSC': 'LOSC Lille', 'Lille': 'LOSC Lille',
  'Nice': 'OGC Nice', 'OGCN': 'OGC Nice',
  'Lens': 'RC Lens', 'RCL': 'RC Lens',
  'Rennes': 'Stade Rennais', 'SRFC': 'Stade Rennais',
  'Brest': 'Stade Brestois 29', 'SB29': 'Stade Brestois 29',
  'Strasbourg': 'RC Strasbourg Alsace', 'RCSA': 'RC Strasbourg Alsace',
  'Toulouse': 'Toulouse FC', 'TFC': 'Toulouse FC',
  'Nantes': 'FC Nantes', 'FCN': 'FC Nantes',
  'Le Havre': 'Le Havre AC', 'HAC': 'Le Havre AC',
  'Auxerre': 'AJ Auxerre', 'AJA': 'AJ Auxerre',
  'Angers': 'Angers SCO', 'SCO': 'Angers SCO',
  'Lorient': 'FC Lorient', 'FCL': 'FC Lorient',
  'Paris FC': 'Paris FC', 'PFC': 'Paris FC',
  'Metz': 'FC Metz', 'FCM': 'FC Metz',
};

function normalizeClub(name) {
  // Chercher une correspondance
  for (const [key, value] of Object.entries(CLUB_NORMALIZE)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return name;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getMatchIds(page, journee) {
  console.log(`   Récupération matchs journée ${journee}...`);

  await page.goto(`https://www.lequipe.fr/Football/ligue-1/page-calendrier-resultats/`, {
    waitUntil: 'networkidle2',
    timeout: 45000
  });
  await sleep(3000);

  const content = await page.content();

  // Extraire les IDs de matchs du HTML
  const matchIds = [];
  const regex = /match-direct\/ligue-1\/2025-2026\/([^/]+)\/(\d+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const teams = match[1].replace('-preview', '').replace('-live', '');
    const id = match[2];
    if (!matchIds.find(m => m.id === id)) {
      matchIds.push({ teams, id: parseInt(id, 10) });
    }
  }

  console.log(`   ${matchIds.length} matchs trouvés`);
  return matchIds;
}

async function scrapeMatch(page, matchId) {
  const url = `https://www.lequipe.fr/Football/match-direct/ligue-1/2025-2026/match-live/${matchId}`;

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    await sleep(2500);

    const content = await page.content();
    const $ = cheerio.load(content);

    const title = $('title').text();

    // Extraire les équipes du titre (format: "Equipe1 X-Y Equipe2, Ligue 1")
    const titleMatch = title.match(/([^0-9]+)\s*(\d+)\s*[-–]\s*(\d+)\s*([^,]+)/);
    let homeTeam = '', awayTeam = '', homeScore = 0, awayScore = 0;

    if (titleMatch) {
      homeTeam = normalizeClub(titleMatch[1].trim());
      homeScore = parseInt(titleMatch[2], 10);
      awayScore = parseInt(titleMatch[3], 10);
      awayTeam = normalizeClub(titleMatch[4].trim());
    }

    // Extraire les joueurs depuis les data-player
    const players = [];
    const playerDataRegex = /data-player="(\{[^"]*\})"/g;
    let dataMatch;

    while ((dataMatch = playerDataRegex.exec(content)) !== null) {
      try {
        // Décoder les entities HTML
        const jsonStr = dataMatch[1]
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');

        const data = JSON.parse(jsonStr);
        if (data.playerId) {
          players.push({
            id: data.playerId,
            matchId: matchId,
          });
        }
      } catch (e) {
        // Ignorer les erreurs de parsing
      }
    }

    // Extraire aussi les liens FootballFicheJoueur
    $('a[href*="FootballFicheJoueur"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      const idMatch = href.match(/FootballFicheJoueur(\d+)/);

      if (idMatch && text && text.length > 1) {
        const playerId = idMatch[1];
        if (!players.find(p => p.id === playerId)) {
          players.push({
            id: playerId,
            name: text,
            matchId: matchId,
          });
        }
      }
    });

    // Déterminer l'équipe de chaque joueur (basé sur la position dans le HTML)
    // Simplification: on récupérera l'équipe depuis la fiche joueur

    return {
      matchId,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      players,
      title,
    };

  } catch (err) {
    console.error(`   Erreur match ${matchId}: ${err.message}`);
    return null;
  }
}

async function scrapePlayerFiche(page, playerId) {
  const url = `https://www.lequipe.fr/Football/FootballFicheJoueur${playerId}.html`;

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    await sleep(1500);

    const content = await page.content();
    const $ = cheerio.load(content);

    const title = $('title').text();
    const bodyText = $('body').text();

    // Nom depuis le titre
    const nameMatch = title.match(/^([^-–]+)/);
    const name = nameMatch ? nameMatch[1].trim() : '';
    const parts = name.split(' ');

    // Club
    let club = null;
    for (const [key, value] of Object.entries(CLUB_NORMALIZE)) {
      if (bodyText.includes(key) || title.includes(key)) {
        club = value;
        break;
      }
    }

    // Position
    let position = 'Milieu';
    if (/gardien/i.test(bodyText)) position = 'Gardien';
    else if (/défenseur|arrière/i.test(bodyText)) position = 'Defenseur';
    else if (/attaquant|avant/i.test(bodyText)) position = 'Attaquant';

    // Photo
    let photo = '';
    $('img').each((_, el) => {
      const src = $(el).attr('src') || '';
      if (src.includes('medias') && (src.includes('joueur') || src.includes('player'))) {
        photo = src;
      }
    });

    // Nationalité
    const natMatch = bodyText.match(/Nationalité\s*:?\s*(\w+)/i);
    const nationality = natMatch ? natMatch[1] : '';

    // Âge
    const ageMatch = bodyText.match(/(\d{2})\s*ans/);
    const age = ageMatch ? parseInt(ageMatch[1], 10) : 0;

    return {
      id: playerId,
      name,
      firstName: parts.slice(0, -1).join(' ') || parts[0],
      lastName: parts[parts.length - 1],
      club,
      position,
      nationality,
      age,
      photo_url: photo,
    };

  } catch (err) {
    return null;
  }
}

async function main() {
  console.log('🚀 Scraping compositions de matchs L\'Équipe\n');

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
    // Récupérer les matchs depuis le calendrier
    const matchIds = await getMatchIds(page, 19);

    // Filtrer pour prendre quelques matchs récents (IDs les plus élevés = plus récents)
    const sortedIds = matchIds.sort((a, b) => b.id - a.id);

    // Aussi ajouter quelques matchs terminés (IDs plus petits)
    const olderIds = [];
    for (let id = 675950; id >= 675500; id -= 50) {
      olderIds.push({ teams: 'unknown', id });
    }

    const allMatchIds = [...sortedIds.slice(0, 5), ...olderIds];
    console.log(`\n📦 ${allMatchIds.length} matchs à analyser\n`);

    // Collecter tous les joueurs uniques
    const allPlayers = new Map();
    let matchesAnalyzed = 0;

    for (const match of allMatchIds) {
      console.log(`\n📄 Match ID ${match.id} (${match.teams})...`);

      const matchData = await scrapeMatch(page, match.id);

      if (matchData && matchData.players.length > 0) {
        console.log(`   ${matchData.title?.substring(0, 50)}`);
        console.log(`   ${matchData.players.length} joueurs`);

        matchData.players.forEach(p => {
          if (!allPlayers.has(p.id)) {
            allPlayers.set(p.id, { ...p, matches: 1 });
          } else {
            allPlayers.get(p.id).matches++;
          }
        });

        matchesAnalyzed++;
      }

      await sleep(1500);

      // Limiter le nombre de matchs pour le test
      if (matchesAnalyzed >= 10) break;
    }

    console.log(`\n\n📊 ${allPlayers.size} joueurs uniques trouvés dans ${matchesAnalyzed} matchs`);

    // Récupérer les détails de chaque joueur
    console.log('\n👤 Récupération des fiches joueurs...\n');

    let imported = 0;
    const playerIds = Array.from(allPlayers.keys());

    for (let i = 0; i < playerIds.length; i++) {
      const playerId = playerIds[i];
      process.stdout.write(`\r   [${i + 1}/${playerIds.length}] ID ${playerId}`);

      await sleep(1000);

      const details = await scrapePlayerFiche(page, playerId);

      if (details && details.name && details.club) {
        // Vérifier si le club est en L1
        const l1Clubs = Object.values(CLUB_NORMALIZE).filter((v, i, a) => a.indexOf(v) === i);

        if (l1Clubs.includes(details.club)) {
          runSql(`
            INSERT INTO players (
              first_name, last_name, name, club, position, nationality,
              photo_url, age, number, matches_played, goals, assists,
              clean_sheets, saves, source_season, api_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0, 0, 0, 0, ?, ?)
          `, [
            details.firstName,
            details.lastName,
            details.name,
            details.club,
            details.position,
            details.nationality,
            details.photo_url,
            details.age,
            allPlayers.get(playerId).matches || 1,
            CURRENT_SEASON,
            parseInt(playerId, 10),
          ]);
          imported++;
        }
      }

      if ((i + 1) % 10 === 0) saveDb();
    }

    saveDb();

    console.log('\n\n═══════════════════════════════════════');
    console.log('📊 RÉSUMÉ');
    console.log('═══════════════════════════════════════');
    console.log(`Matchs analysés: ${matchesAnalyzed}`);
    console.log(`Joueurs importés: ${imported}`);

    const byClub = queryAll('SELECT club, COUNT(*) as c FROM players GROUP BY club ORDER BY c DESC');
    console.log('\nPar club:');
    byClub.forEach(row => console.log(`   ${row.club}: ${row.c}`));

  } catch (err) {
    console.error('\n❌ Erreur:', err.message);
  }

  await browser.close();
  console.log('\n✅ Scraping terminé');
}

main().catch(console.error);
