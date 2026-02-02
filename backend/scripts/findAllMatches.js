/**
 * Scanner les IDs pour trouver tous les matchs L1 de la saison
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

async function scan() {
  console.log('🔍 Scan des matchs L1 2025-2026\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  const matchesFound = [];

  // Scanner les IDs de 675400 à 675975 (couvre environ 20 journées)
  // On teste par pas de 10 pour aller plus vite
  const startId = 675400;
  const endId = 675975;
  const step = 1;

  console.log(`Scan de ${startId} à ${endId}...\n`);

  for (let id = startId; id <= endId; id += step) {
    process.stdout.write(`\rTest ID ${id}...`);

    try {
      const url = `https://www.lequipe.fr/Football/match-direct/ligue-1/2025-2026/test-live/${id}`;
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

      if (resp.status() === 200) {
        await new Promise(r => setTimeout(r, 500));
        const title = await page.title();

        // Vérifier si c'est un match L1
        if (title.includes('Ligue 1') && !title.includes('L\'Équipe - L\'actualité')) {
          // Extraire les équipes et le score du titre
          // Format: "Equipe1 X-Y Equipe2, Ligue 1" ou "DIRECT. Equipe1-Equipe2"
          const scoreMatch = title.match(/([^0-9]+?)\s*(\d+)\s*[-–]\s*(\d+)\s*([^,]+)/);
          const previewMatch = title.match(/DIRECT\.\s*([^(]+)/);

          let teams = '';
          let score = '';
          let status = 'unknown';

          if (scoreMatch) {
            teams = `${scoreMatch[1].trim()} vs ${scoreMatch[4].trim()}`;
            score = `${scoreMatch[2]}-${scoreMatch[3]}`;
            status = 'terminé';
          } else if (previewMatch) {
            teams = previewMatch[1].trim();
            status = 'à venir';
          }

          matchesFound.push({ id, teams, score, status, title: title.substring(0, 60) });
          console.log(`\n   ✅ ID ${id}: ${teams} ${score} (${status})`);
        }
      }
    } catch (err) {
      // Ignorer les erreurs
    }

    // Petite pause pour ne pas surcharger
    await new Promise(r => setTimeout(r, 200));
  }

  await browser.close();

  console.log('\n\n═══════════════════════════════════════');
  console.log(`📊 ${matchesFound.length} matchs L1 trouvés`);
  console.log('═══════════════════════════════════════\n');

  // Grouper par statut
  const termines = matchesFound.filter(m => m.status === 'terminé');
  const aVenir = matchesFound.filter(m => m.status === 'à venir');

  console.log(`Matchs terminés: ${termines.length}`);
  console.log(`Matchs à venir: ${aVenir.length}\n`);

  // Sauvegarder la liste
  fs.writeFileSync('matches_found.json', JSON.stringify(matchesFound, null, 2));
  console.log('Liste sauvegardée: matches_found.json');

  // Afficher les matchs terminés
  if (termines.length > 0) {
    console.log('\nMatchs terminés:');
    termines.forEach(m => console.log(`  ${m.id}: ${m.teams} (${m.score})`));
  }
}

scan().catch(console.error);
