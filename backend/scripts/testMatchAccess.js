/**
 * Test d'accès aux pages de match L'Équipe
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

async function test() {
  console.log('🔍 Test accès pages matchs\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  // Matchs trouvés dans le calendrier (prochaine journée)
  const matchIds = [
    { teams: 'lens-le-havre', id: '675971' },
    { teams: 'paris-fc-om', id: '675965' },
    { teams: 'strasbourg-psg', id: '675967' },
  ];

  // Pour chaque match, tester différentes URLs
  for (const match of matchIds) {
    console.log(`\n📄 Match: ${match.teams}`);

    const variants = [
      `/Football/match-direct/ligue-1/2025-2026/${match.teams}-preview/${match.id}`,
      `/Football/match-direct/ligue-1/2025-2026/${match.teams}-live/${match.id}`,
      `/Football/match-direct/ligue-1/2025-2026/${match.teams}/${match.id}`,
      `/Football/match-direct/ligue-1/2025-2026/${match.teams}-resume/${match.id}`,
      `/Football/match-direct/ligue-1/2025-2026/${match.teams}-compo/${match.id}`,
    ];

    for (const path of variants) {
      const url = `https://www.lequipe.fr${path}`;
      console.log(`   Test: ${path.split('/').pop()}`);

      try {
        const resp = await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
        const status = resp.status();

        if (status === 200) {
          await new Promise(r => setTimeout(r, 2000));
          const content = await page.content();
          const $ = cheerio.load(content);

          const title = $('title').text().trim();

          // Vérifier si c'est une vraie page de match
          if (title.includes(match.teams.split('-')[0]) || title.includes('Ligue 1')) {
            console.log(`      ✅ ${status} - ${title.substring(0, 50)}`);

            // Chercher les joueurs
            const players = [];
            $('a[href*="FootballFicheJoueur"]').each((_, el) => {
              const text = $(el).text().trim();
              if (text && text.length > 1 && text.length < 40) {
                players.push(text);
              }
            });

            if (players.length > 0) {
              console.log(`      ✅ ${players.length} joueurs trouvés!`);
              console.log(`         ${players.slice(0, 5).join(', ')}...`);

              // Sauvegarder cette page
              fs.writeFileSync(`match_${match.teams}_${path.split('-').pop().split('/')[0]}.html`, content);
              break; // On a trouvé une bonne page
            }
          } else {
            console.log(`      ⚠️ Redirigé vers: ${title.substring(0, 40)}`);
          }
        } else {
          console.log(`      ❌ ${status}`);
        }
      } catch (err) {
        console.log(`      ❌ Erreur: ${err.message.substring(0, 50)}`);
      }
    }
  }

  // Essayer avec un ID de match plus ancien (journée passée)
  console.log('\n\n📄 Test matchs journées précédentes (IDs plus petits)...');

  // Les IDs semblent être séquentiels, essayons des IDs plus petits
  const olderMatchIds = [675800, 675700, 675600, 675500];

  for (const id of olderMatchIds) {
    const url = `https://www.lequipe.fr/Football/match-direct/ligue-1/2025-2026/psg-placeholder-live/${id}`;
    console.log(`   Test ID ${id}...`);

    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });

      if (resp.status() === 200) {
        await new Promise(r => setTimeout(r, 2000));
        const content = await page.content();
        const $ = cheerio.load(content);
        const title = $('title').text().trim();

        // Vérifier si c'est un match L1
        if (title.includes('Ligue 1')) {
          console.log(`      ✅ ${title.substring(0, 60)}`);

          const players = [];
          $('a[href*="FootballFicheJoueur"]').each((_, el) => {
            const text = $(el).text().trim();
            if (text && text.length > 1) players.push(text);
          });

          if (players.length > 0) {
            console.log(`      ✅ ${players.length} joueurs!`);
            fs.writeFileSync(`match_id_${id}.html`, content);
            break;
          }
        } else {
          console.log(`      Page: ${title.substring(0, 40)}`);
        }
      }
    } catch (err) {
      // Ignorer
    }
  }

  await browser.close();
  console.log('\n✅ Test terminé');
}

test().catch(console.error);
