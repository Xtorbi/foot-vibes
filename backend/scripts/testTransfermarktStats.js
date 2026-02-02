/**
 * Test scraping stats Transfermarkt - buts et passes décisives
 *
 * Usage: node scripts/testTransfermarktStats.js
 */

const cheerio = require('cheerio');

const TRANSFERMARKT_BASE = 'https://www.transfermarkt.fr';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
};

async function fetchPage(url) {
  console.log(`Fetching: ${url}`);
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.text();
}

async function scrapeClubStats(clubSlug, clubId, seasonId = '2024') {
  // Page des stats: /leistungsdaten/verein/583/reldata/%262024/plus/1
  // ou /paris-saint-germain/leistungsdaten/verein/583/plus/1?reldata=%262024
  const url = `${TRANSFERMARKT_BASE}/${clubSlug}/leistungsdaten/verein/${clubId}/plus/1?reldata=%262024`;

  const html = await fetchPage(url);
  const $ = cheerio.load(html);

  const players = [];

  // Table des stats
  $('table.items tbody tr.odd, table.items tbody tr.even').each((i, row) => {
    const $row = $(row);

    // Nom du joueur
    const nameCell = $row.find('td.hauptlink a').first();
    const name = nameCell.text().trim();

    // Position
    const positionCell = $row.find('td.posrela table tr:last-child td').first();
    const position = positionCell.text().trim();

    // Les colonnes de stats (zentriert)
    const statCells = $row.find('td.zentriert');

    // Chercher les stats dans les colonnes
    // Structure typique: Age | Matchs | Buts | Assists | etc.
    let matches = 0;
    let goals = 0;
    let assists = 0;

    // On parcourt toutes les cellules pour trouver les bonnes valeurs
    const values = [];
    statCells.each((j, cell) => {
      const text = $(cell).text().trim();
      values.push(text);
    });

    if (name) {
      players.push({
        name,
        position,
        values, // pour debug
      });
    }
  });

  return { players, html };
}

async function testStats() {
  console.log('=== Test Stats Transfermarkt ===\n');
  console.log('Club: Paris Saint-Germain\n');

  try {
    const { players, html } = await scrapeClubStats('paris-saint-germain', 583, '2024');
    const $ = cheerio.load(html);

    // Afficher les headers pour comprendre la structure
    console.log('--- Headers des colonnes ---');
    const headers = [];
    $('table.items thead tr th').each((i, th) => {
      headers.push($(th).text().trim() || `col${i}`);
    });
    console.log(headers.join(' | '));
    console.log('');

    // Chercher Dembélé
    console.log('--- Recherche Dembélé ---');
    const dembele = players.find(p => p.name.toLowerCase().includes('dembélé') || p.name.toLowerCase().includes('dembele'));

    if (dembele) {
      console.log(`Trouvé: ${dembele.name}`);
      console.log(`Position: ${dembele.position}`);
      console.log(`Valeurs colonnes: ${dembele.values.join(' | ')}`);
    } else {
      console.log('Dembélé non trouvé dans la liste');
      console.log('\nJoueurs disponibles:');
      players.slice(0, 15).forEach(p => console.log(`  - ${p.name}`));
    }

    console.log('\n--- Échantillon de 5 joueurs avec stats ---');
    players.slice(0, 5).forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   Colonnes: ${p.values.join(' | ')}`);
      console.log('');
    });

  } catch (err) {
    console.error('Erreur:', err.message);
  }
}

testStats();
