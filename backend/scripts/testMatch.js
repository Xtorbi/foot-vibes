/**
 * Test d'une page de match Ligue 1
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

async function test() {
  console.log('🔍 Test pages matchs Ligue 1\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Test plusieurs URLs de matchs avec différents formats
  const matchUrls = [
    // Format preview (à venir)
    'https://www.lequipe.fr/Football/match-direct/ligue-1/2025-2026/strasbourg-psg-preview/675967',
    // Essayer sans preview
    'https://www.lequipe.fr/Football/match-direct/ligue-1/2025-2026/strasbourg-psg/675967',
    // Essayer avec live
    'https://www.lequipe.fr/Football/match-direct/ligue-1/2025-2026/strasbourg-psg-live/675967',
    // Essayer un autre match (journée passée - ID plus petit)
    'https://www.lequipe.fr/Football/match-direct/ligue-1/2025-2026/psg-lyon-live/675800',
    'https://www.lequipe.fr/Football/match-direct/ligue-1/2025-2026/marseille-nice-live/675750',
  ];

  for (const url of matchUrls) {
    console.log(`\n📄 Test: ${url.split('/').slice(-2).join('/')}`);
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
      console.log(`   Status: ${resp.status()}`);

      if (resp.status() === 200) {
        await new Promise(r => setTimeout(r, 3000));
        const content = await page.content();
        const $ = cheerio.load(content);

        const title = $('title').text().trim();
        console.log(`   Titre: ${title.substring(0, 60)}`);

        // Vérifier si c'est la bonne page
        if (title.includes('Ligue 1') || title.includes('PSG') || title.includes('Strasbourg')) {
          console.log('   ✅ Page de match L1 trouvée!');

          // Chercher les joueurs
          const players = [];
          $('a').each((_, el) => {
            const href = $(el).attr('href') || '';
            const text = $(el).text().trim();
            if (href.includes('Footballeur') && text.length > 2 && text.length < 40) {
              if (!players.find(p => p.name === text)) {
                players.push({ name: text, href });
              }
            }
          });

          if (players.length > 0) {
            console.log(`   ✅ Joueurs: ${players.length}`);
            console.log('   Liste:', players.slice(0, 15).map(p => p.name).join(', '));

            // Sauvegarder
            const filename = `match_${url.split('/').slice(-2)[0]}.html`;
            fs.writeFileSync(filename, content);
            console.log(`   HTML sauvegardé: ${filename}`);

            // Chercher les compositions (titulaires vs remplaçants)
            const bodyText = $('body').text().toLowerCase();
            if (bodyText.includes('titulaire') || bodyText.includes('composition')) {
              console.log('   ✅ Section composition détectée');
            }
            if (bodyText.includes('remplaçant') || bodyText.includes('banc')) {
              console.log('   ✅ Section remplaçants détectée');
            }

            // Chercher stats joueurs (buts, passes, notes)
            if (bodyText.includes('but') || bodyText.includes('passe')) {
              console.log('   ✅ Stats joueurs détectées');
            }

            break; // On a trouvé une page valide
          }
        }
      }
    } catch (err) {
      console.log(`   Erreur: ${err.message}`);
    }
  }

  // Test: Page classement buteurs (pour récupérer stats)
  console.log('\n\n📊 Test page classement buteurs:');
  try {
    await page.goto('https://www.lequipe.fr/Football/ligue-1/page-classement-individuel/buteurs', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await new Promise(r => setTimeout(r, 4000));

    const content = await page.content();
    const $ = cheerio.load(content);

    console.log('   Titre:', $('title').text().trim().substring(0, 60));

    // Chercher les joueurs avec leurs stats
    const scorers = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      if (href.includes('Footballeur') && text.length > 2) {
        // Essayer de trouver le nombre de buts à côté
        const parent = $(el).parent();
        const parentText = parent.text();
        const goalsMatch = parentText.match(/(\d+)\s*(buts?|goals?)/i);

        scorers.push({
          name: text,
          href,
          goals: goalsMatch ? parseInt(goalsMatch[1]) : null,
        });
      }
    });

    console.log(`   Buteurs trouvés: ${scorers.length}`);
    if (scorers.length > 0) {
      console.log('   Top buteurs:');
      scorers.filter(s => s.goals).slice(0, 10).forEach(s =>
        console.log(`      - ${s.name}: ${s.goals} buts`)
      );

      if (scorers.filter(s => s.goals).length === 0) {
        console.log('   (Buts non extraits, mais joueurs trouvés)');
        console.log('   Exemples:', scorers.slice(0, 10).map(s => s.name).join(', '));
      }
    }

    fs.writeFileSync('debug_buteurs_l1.html', content);

  } catch (err) {
    console.log('   Erreur:', err.message);
  }

  await browser.close();
  console.log('\n✅ Test terminé');
}

test().catch(console.error);
