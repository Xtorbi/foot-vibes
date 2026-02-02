/**
 * Test scraping stats Transfermarkt - identification précise des colonnes
 */

const cheerio = require('cheerio');

const TRANSFERMARKT_BASE = 'https://www.transfermarkt.fr';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
};

async function fetchPage(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function analyzeStatsPage() {
  const url = `${TRANSFERMARKT_BASE}/paris-saint-germain/leistungsdaten/verein/583/plus/1?reldata=%262024`;
  console.log(`Fetching: ${url}\n`);

  const html = await fetchPage(url);
  const $ = cheerio.load(html);

  // Analyser tous les headers (y compris les images/icônes)
  console.log('=== ANALYSE DES HEADERS ===\n');

  $('table.items thead tr').each((rowIdx, tr) => {
    console.log(`Row ${rowIdx}:`);
    $(tr).find('th').each((i, th) => {
      const $th = $(th);
      const text = $th.text().trim();
      const title = $th.attr('title') || '';
      const img = $th.find('img').attr('title') || $th.find('img').attr('alt') || '';
      const colspan = $th.attr('colspan') || '1';

      if (text || title || img) {
        console.log(`  [${i}] text="${text}" title="${title}" img="${img}" colspan=${colspan}`);
      }
    });
  });

  // Trouver les joueurs avec stats connues pour valider
  console.log('\n=== VALIDATION AVEC JOUEURS CONNUS ===\n');

  const playersToCheck = ['Dembélé', 'Hakimi', 'Barcola', 'Asensio', 'Kolo Muani'];

  $('table.items tbody tr').each((i, row) => {
    const $row = $(row);
    const name = $row.find('td.hauptlink a').first().text().trim();

    if (playersToCheck.some(p => name.toLowerCase().includes(p.toLowerCase()))) {
      console.log(`\n${name}:`);

      // Récupérer TOUTES les cellules td avec leur index
      $row.find('td').each((j, td) => {
        const $td = $(td);
        const text = $td.text().trim().replace(/\s+/g, ' ');
        const cls = $td.attr('class') || '';

        if (text && !text.includes('Joueur') && text.length < 30) {
          console.log(`  td[${j}] (${cls}): "${text}"`);
        }
      });
    }
  });
}

analyzeStatsPage().catch(console.error);
