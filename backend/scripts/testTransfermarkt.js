/**
 * Test scraping Transfermarkt - 10 joueurs du PSG
 *
 * Usage: node scripts/testTransfermarkt.js
 */

const cheerio = require('cheerio');

const TRANSFERMARKT_BASE = 'https://www.transfermarkt.fr';

// Headers pour simuler un navigateur
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
};

// Mapping des positions Transfermarkt vers nos positions
const POSITION_MAP = {
  'Gardien de but': 'Gardien',
  'Défenseur central': 'Defenseur',
  'Arrière droit': 'Defenseur',
  'Arrière gauche': 'Defenseur',
  'Milieu défensif': 'Milieu',
  'Milieu central': 'Milieu',
  'Milieu offensif': 'Milieu',
  'Milieu droit': 'Milieu',
  'Milieu gauche': 'Milieu',
  'Ailier droit': 'Attaquant',
  'Ailier gauche': 'Attaquant',
  'Avant-centre': 'Attaquant',
  'Attaquant': 'Attaquant',
};

function normalizePosition(pos) {
  if (!pos) return 'Milieu';
  for (const [key, value] of Object.entries(POSITION_MAP)) {
    if (pos.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return 'Milieu';
}

async function fetchPage(url) {
  console.log(`Fetching: ${url}`);
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.text();
}

async function scrapeClubSquad(clubSlug, clubId, seasonId = '2024') {
  // URL format: /psg/kader/verein/583/saison_id/2024
  const url = `${TRANSFERMARKT_BASE}/${clubSlug}/kader/verein/${clubId}/saison_id/${seasonId}`;

  const html = await fetchPage(url);
  const $ = cheerio.load(html);

  const players = [];

  // Les joueurs sont dans des lignes de tableau avec classe "odd" ou "even"
  $('table.items tbody tr.odd, table.items tbody tr.even').each((i, row) => {
    const $row = $(row);

    // Nom du joueur
    const nameCell = $row.find('td.hauptlink a').first();
    const name = nameCell.text().trim();
    const playerUrl = nameCell.attr('href');

    // Photo
    const photoImg = $row.find('img.bilderrahmen-fixed').first();
    let photoUrl = photoImg.attr('data-src') || photoImg.attr('src') || '';
    // Convertir les thumbnails en images plus grandes
    photoUrl = photoUrl.replace('/small/', '/header/').replace('/kader/', '/header/');

    // Position
    const positionCell = $row.find('td.posrela table tr:last-child td').first();
    const positionRaw = positionCell.text().trim();
    const position = normalizePosition(positionRaw);

    // Numéro
    const numberCell = $row.find('div.rn_nummer').first();
    const number = parseInt(numberCell.text().trim()) || 0;

    // Age - dans une des colonnes centrales
    const cells = $row.find('td.zentriert');
    let age = 0;
    let nationality = '';

    cells.each((j, cell) => {
      const text = $(cell).text().trim();
      // Age est généralement un nombre entre 15 et 45
      const ageMatch = text.match(/^\d{2}$/);
      if (ageMatch && parseInt(text) >= 15 && parseInt(text) <= 45) {
        age = parseInt(text);
      }
      // Nationalité via le flag
      const flagImg = $(cell).find('img.flaggenrahmen');
      if (flagImg.length > 0) {
        nationality = flagImg.attr('title') || '';
      }
    });

    if (name) {
      players.push({
        name,
        position,
        positionRaw,
        number,
        age,
        nationality,
        photoUrl,
        playerUrl,
      });
    }
  });

  return players;
}

async function testScraping() {
  console.log('=== Test Scraping Transfermarkt ===\n');
  console.log('Club: Paris Saint-Germain\n');

  try {
    const players = await scrapeClubSquad('paris-saint-germain', 583, '2024');

    console.log(`\nTotal joueurs trouvés: ${players.length}\n`);
    console.log('--- 10 premiers joueurs ---\n');

    const sample = players.slice(0, 10);
    sample.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   Position: ${p.position} (${p.positionRaw})`);
      console.log(`   Numéro: ${p.number || 'N/A'}`);
      console.log(`   Age: ${p.age || 'N/A'}`);
      console.log(`   Nationalité: ${p.nationality || 'N/A'}`);
      console.log(`   Photo: ${p.photoUrl ? 'OK' : 'MANQUANTE'}`);
      console.log('');
    });

    // Résumé des données
    console.log('--- Résumé qualité données ---');
    const withPhoto = players.filter(p => p.photoUrl).length;
    const withAge = players.filter(p => p.age > 0).length;
    const withNat = players.filter(p => p.nationality).length;
    const withNumber = players.filter(p => p.number > 0).length;

    console.log(`Photos: ${withPhoto}/${players.length}`);
    console.log(`Ages: ${withAge}/${players.length}`);
    console.log(`Nationalités: ${withNat}/${players.length}`);
    console.log(`Numéros: ${withNumber}/${players.length}`);

  } catch (err) {
    console.error('Erreur:', err.message);
    if (err.message.includes('403')) {
      console.log('\nTransfermarkt bloque peut-être les requêtes automatisées.');
      console.log('Solutions possibles:');
      console.log('1. Utiliser un proxy');
      console.log('2. Ajouter des délais plus longs');
      console.log('3. Utiliser une autre source de données');
    }
  }
}

testScraping();
