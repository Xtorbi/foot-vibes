/**
 * Test de scraping - exploration des URLs L'Équipe
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

async function test() {
  console.log('🔍 Exploration L\'Équipe\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Liste d'URLs à tester
  const urlsToTest = [
    'https://www.lequipe.fr/Football/ligue-1/',
    'https://www.lequipe.fr/Football/Ligue-1/',
    'https://www.lequipe.fr/Football/LIGUE-1/',
    'https://www.lequipe.fr/Football/ligue-1/page-classement-buteurs/',
    'https://www.lequipe.fr/Football/Classement/LIGUE-1/',
    'https://www.lequipe.fr/Football/Statistiques/',
  ];

  for (const url of urlsToTest) {
    console.log(`\n📄 Test: ${url}`);
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      console.log(`   Status: ${response.status()}`);

      await new Promise(r => setTimeout(r, 2000));

      const content = await page.content();
      const $ = cheerio.load(content);

      const title = $('title').text().trim();
      console.log(`   Titre: ${title.substring(0, 60)}...`);

      // Chercher des liens vers des joueurs
      const playerLinks = new Set();
      $('a').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (href.includes('Footballeur') || href.includes('joueur')) {
          playerLinks.add(href);
        }
      });
      console.log(`   Liens joueurs: ${playerLinks.size}`);

      if (playerLinks.size > 0) {
        console.log('   Exemples:', [...playerLinks].slice(0, 3).join(', '));
      }

      // Chercher des noms de joueurs connus
      const bodyText = $('body').text();
      const knownPlayers = ['Barcola', 'Dembélé', 'Donnarumma', 'Mbappé', 'Greenwood'];
      const found = knownPlayers.filter(p => bodyText.includes(p));
      if (found.length > 0) {
        console.log(`   ✅ Joueurs trouvés: ${found.join(', ')}`);
      }

      // Sauvegarder si intéressant
      if (playerLinks.size > 0 || found.length > 0) {
        const filename = `debug_${url.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.html`;
        fs.writeFileSync(filename, content);
        console.log(`   Sauvegardé: ${filename}`);
      }

    } catch (err) {
      console.log(`   ❌ Erreur: ${err.message}`);
    }
  }

  // Test spécial: page des meilleurs buteurs
  console.log('\n\n📊 Test page buteurs:');
  try {
    await page.goto('https://www.lequipe.fr/Football/ligue-1/page-classement-buteurs/', {
      waitUntil: 'networkidle2',
      timeout: 20000
    });
    await new Promise(r => setTimeout(r, 3000));

    const content = await page.content();
    const $ = cheerio.load(content);

    console.log('   Titre:', $('title').text().trim().substring(0, 60));

    // Chercher les données structurées
    let foundData = false;
    $('script').each((_, el) => {
      const text = $(el).html() || '';
      if (text.includes('__NEXT_DATA__') || text.includes('"props"') || text.includes('"players"')) {
        foundData = true;
        console.log('   ✅ Données JSON détectées!');

        // Essayer d'extraire le JSON
        const match = text.match(/__NEXT_DATA__.*?(\{.*\})/s);
        if (match) {
          try {
            const json = JSON.parse(match[1].split('</script>')[0]);
            console.log('   Structure:', Object.keys(json).join(', '));
            fs.writeFileSync('next_data.json', JSON.stringify(json, null, 2));
            console.log('   JSON sauvegardé dans next_data.json');
          } catch (e) {
            // Ignorer les erreurs de parsing
          }
        }
      }
    });

    // Chercher les tables
    const tables = $('table');
    console.log(`   Tables trouvées: ${tables.length}`);

    // Chercher les listes de joueurs dans le texte
    const text = $('body').text();
    const buteurMatch = text.match(/(\d+)\s*buts?\s*[-–]\s*(\w+\s*\w*)/gi);
    if (buteurMatch) {
      console.log('   Stats buteurs trouvées:', buteurMatch.slice(0, 5).join(', '));
    }

    fs.writeFileSync('debug_buteurs.html', content);
    console.log('   HTML sauvegardé: debug_buteurs.html');

  } catch (err) {
    console.log('   Erreur:', err.message);
  }

  await browser.close();
  console.log('\n✅ Exploration terminée');
}

test().catch(console.error);
