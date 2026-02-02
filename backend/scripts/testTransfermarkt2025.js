/**
 * Test scraping Transfermarkt - Saison 2025-2026
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
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function testSeason2025() {
  console.log('=== Test Saison 2025-2026 ===\n');

  // Test page effectif PSG saison 2025
  const kaderUrl = `${TRANSFERMARKT_BASE}/paris-saint-germain/kader/verein/583/saison_id/2025`;

  try {
    const html = await fetchPage(kaderUrl);
    const $ = cheerio.load(html);

    // Compter les joueurs
    const playerRows = $('table.items tbody tr.odd, table.items tbody tr.even');
    console.log(`\nJoueurs trouvés (effectif 2025-2026): ${playerRows.length}`);

    // Lister les 10 premiers
    console.log('\n--- 10 premiers joueurs ---\n');
    playerRows.slice(0, 10).each((i, row) => {
      const $row = $(row);
      const name = $row.find('td.hauptlink a').first().text().trim();
      const position = $row.find('td.posrela table tr:last-child td').first().text().trim();
      console.log(`${i + 1}. ${name} - ${position}`);
    });

  } catch (err) {
    console.error('Erreur effectif:', err.message);
  }

  // Test page stats PSG saison 2025
  console.log('\n\n=== Stats Saison 2025-2026 ===\n');
  const statsUrl = `${TRANSFERMARKT_BASE}/paris-saint-germain/leistungsdaten/verein/583/plus/1?reldata=%262025`;

  try {
    const html = await fetchPage(statsUrl);
    const $ = cheerio.load(html);

    // Chercher Dembélé et Barcola
    const playersToCheck = ['Dembélé', 'Barcola', 'Hakimi', 'Doué', 'Donnarumma'];

    $('table.items tbody tr').each((i, row) => {
      const $row = $(row);
      const name = $row.find('td.hauptlink a').first().text().trim();

      if (playersToCheck.some(p => name.toLowerCase().includes(p.toLowerCase()))) {
        const tds = [];
        $row.find('td.zentriert').each((j, td) => {
          tds.push($(td).text().trim());
        });

        // td indices: [0]=numéro, [1]=âge, [2]=nat, [3]=effectif, [4]=matchs, [5]=buts, [6]=assists...
        console.log(`${name}:`);
        console.log(`  Numéro: ${tds[0] || '-'}`);
        console.log(`  Matchs: ${tds[4] || '-'}`);
        console.log(`  Buts: ${tds[5] || '-'}`);
        console.log(`  Passes D: ${tds[6] || '-'}`);
        console.log('');
      }
    });

  } catch (err) {
    console.error('Erreur stats:', err.message);
  }
}

testSeason2025().catch(console.error);
