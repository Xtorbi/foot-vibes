/**
 * Test scraping via la page Directs de L'Équipe
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

async function test() {
  console.log('🔍 Exploration page Directs L\'Équipe\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Test 1: Page Directs principale
  console.log('1. Page Directs:');
  try {
    await page.goto('https://www.lequipe.fr/Directs', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    const content = await page.content();
    const $ = cheerio.load(content);

    console.log('   Titre:', $('title').text().trim().substring(0, 60));

    // Chercher les liens vers des matchs Ligue 1
    const matchLinks = new Set();
    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      if (href.includes('Football') && (href.includes('Direct') || href.includes('direct') || href.includes('Match'))) {
        matchLinks.add(href);
      }
    });
    console.log(`   Liens matchs: ${matchLinks.size}`);
    if (matchLinks.size > 0) {
      console.log('   Exemples:', [...matchLinks].slice(0, 5).join('\n             '));
    }

    // Chercher "Ligue 1" dans le contenu
    const bodyText = $('body').text();
    if (bodyText.includes('Ligue 1')) {
      console.log('   ✅ "Ligue 1" trouvé dans la page');
    }

    fs.writeFileSync('debug_directs.html', content);
    console.log('   HTML sauvegardé: debug_directs.html');

  } catch (err) {
    console.log('   Erreur:', err.message);
  }

  // Test 2: Page résultats Ligue 1
  console.log('\n2. Page résultats/calendrier Ligue 1:');
  const calendarUrls = [
    'https://www.lequipe.fr/Football/ligue-1/page-calendrier-resultats/',
    'https://www.lequipe.fr/Football/ligue-1/resultats/',
    'https://www.lequipe.fr/Football/Calendrier-et-Resultats/LIGUE-1/',
  ];

  for (const url of calendarUrls) {
    console.log(`\n   Test: ${url}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
      await new Promise(r => setTimeout(r, 2000));

      const content = await page.content();
      const $ = cheerio.load(content);

      const title = $('title').text().trim();
      console.log(`   Titre: ${title.substring(0, 50)}`);

      // Chercher des scores (format X - Y)
      const scoreMatches = $('body').text().match(/\d+\s*[-–]\s*\d+/g);
      if (scoreMatches && scoreMatches.length > 0) {
        console.log(`   ✅ Scores trouvés: ${scoreMatches.length}`);
        console.log('   Exemples:', scoreMatches.slice(0, 5).join(', '));
      }

      // Chercher les liens vers matchs individuels
      const matchLinks = [];
      $('a').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (href.includes('/Football/') && href.includes('/Direct/')) {
          matchLinks.push(href);
        }
      });
      if (matchLinks.length > 0) {
        console.log(`   ✅ Liens matchs directs: ${matchLinks.length}`);
        console.log('   Premier:', matchLinks[0]);

        // Sauvegarder pour analyse
        fs.writeFileSync('debug_calendar.html', content);
      }

    } catch (err) {
      console.log(`   Erreur: ${err.message}`);
    }
  }

  // Test 3: Explorer un match spécifique si trouvé
  console.log('\n3. Test page match individuel:');
  try {
    // Chercher un lien de match dans le fichier sauvegardé
    if (fs.existsSync('debug_calendar.html')) {
      const calContent = fs.readFileSync('debug_calendar.html', 'utf8');
      const $cal = cheerio.load(calContent);

      let matchUrl = null;
      $cal('a').each((_, el) => {
        const href = $cal(el).attr('href') || '';
        if (href.includes('/Football/') && href.includes('/Direct/') && !matchUrl) {
          matchUrl = href.startsWith('http') ? href : `https://www.lequipe.fr${href}`;
        }
      });

      if (matchUrl) {
        console.log(`   URL match: ${matchUrl}`);
        await page.goto(matchUrl, { waitUntil: 'networkidle2', timeout: 20000 });
        await new Promise(r => setTimeout(r, 3000));

        const matchContent = await page.content();
        const $m = cheerio.load(matchContent);

        console.log('   Titre:', $m('title').text().trim().substring(0, 60));

        // Chercher les compositions / joueurs
        const playerNames = [];
        $m('a').each((_, el) => {
          const href = $m(el).attr('href') || '';
          const text = $m(el).text().trim();
          if (href.includes('/Football/Footballeur/') && text.length > 2) {
            playerNames.push(text);
          }
        });

        if (playerNames.length > 0) {
          console.log(`   ✅ Joueurs trouvés: ${playerNames.length}`);
          console.log('   Exemples:', playerNames.slice(0, 10).join(', '));
        }

        // Chercher les données JSON
        $m('script').each((_, el) => {
          const scriptText = $m(el).html() || '';
          if (scriptText.includes('lineup') || scriptText.includes('composition') || scriptText.includes('player')) {
            if (scriptText.length < 50000) {
              console.log('   ✅ Script avec données joueurs détecté');
            }
          }
        });

        fs.writeFileSync('debug_match.html', matchContent);
        console.log('   HTML match sauvegardé: debug_match.html');
      }
    }
  } catch (err) {
    console.log('   Erreur:', err.message);
  }

  await browser.close();
  console.log('\n✅ Exploration terminée');
}

test().catch(console.error);
