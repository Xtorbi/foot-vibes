/**
 * Test scraping calendrier/résultats Ligue 1
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

async function test() {
  console.log('🔍 Exploration calendrier Ligue 1\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Page calendrier-resultats Ligue 1
  console.log('1. Page calendrier-resultats Ligue 1:');
  try {
    await page.goto('https://www.lequipe.fr/Football/ligue-1/page-calendrier-resultats/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await new Promise(r => setTimeout(r, 4000));

    const content = await page.content();
    const $ = cheerio.load(content);

    console.log('   Titre:', $('title').text().trim().substring(0, 60));

    // Chercher tous les liens
    const allLinks = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      allLinks.push({ href, text: text.substring(0, 50) });
    });

    // Filtrer les liens de matchs
    const matchLinks = allLinks.filter(l =>
      l.href.includes('match-direct') ||
      l.href.includes('/Direct/') ||
      l.href.includes('-live/')
    );
    console.log(`   Liens matchs trouvés: ${matchLinks.length}`);
    if (matchLinks.length > 0) {
      console.log('   Exemples:');
      matchLinks.slice(0, 5).forEach(l => console.log(`      ${l.text}: ${l.href}`));
    }

    // Chercher les noms d'équipes
    const clubNames = ['PSG', 'Paris', 'Marseille', 'Lyon', 'Monaco', 'Lille', 'Nice', 'Lens', 'Rennes', 'Brest'];
    const foundClubs = clubNames.filter(c => $('body').text().includes(c));
    console.log(`   Clubs trouvés: ${foundClubs.join(', ')}`);

    // Chercher structure de journée
    const journeeMatch = $('body').text().match(/Journée\s*(\d+)/gi);
    if (journeeMatch) {
      console.log(`   Journées: ${[...new Set(journeeMatch)].slice(0, 5).join(', ')}`);
    }

    fs.writeFileSync('debug_calendrier_l1.html', content);
    console.log('   HTML sauvegardé');

    // Chercher les données JSON/script
    console.log('\n   Recherche données structurées...');
    $('script').each((i, el) => {
      const text = $(el).html() || '';
      if (text.includes('matchList') || text.includes('fixtures') || text.includes('__NEXT_DATA__')) {
        console.log(`   ✅ Script ${i} contient des données structurées`);
        if (text.includes('__NEXT_DATA__')) {
          try {
            const jsonMatch = text.match(/\{.*\}/s);
            if (jsonMatch) {
              const data = JSON.parse(jsonMatch[0]);
              fs.writeFileSync('next_data_calendar.json', JSON.stringify(data, null, 2));
              console.log('   JSON sauvegardé: next_data_calendar.json');
              console.log('   Clés:', Object.keys(data.props?.pageProps || data).slice(0, 10).join(', '));
            }
          } catch (e) {
            console.log('   Erreur parsing JSON');
          }
        }
      }
    });

  } catch (err) {
    console.log('   Erreur:', err.message);
  }

  // Test 2: Aller sur une journée spécifique
  console.log('\n2. Test journée spécifique (dernière):');
  try {
    // Essayer différents formats d'URL pour une journée
    const journeeUrls = [
      'https://www.lequipe.fr/Football/ligue-1/page-calendrier-resultats/journee-19',
      'https://www.lequipe.fr/Football/ligue-1/page-calendrier-resultats/J19',
    ];

    for (const url of journeeUrls) {
      console.log(`   Test: ${url}`);
      const resp = await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      console.log(`   Status: ${resp.status()}`);

      if (resp.status() === 200) {
        await new Promise(r => setTimeout(r, 2000));
        const content = await page.content();
        const $ = cheerio.load(content);

        // Chercher les matchs
        const matchLinks = [];
        $('a').each((_, el) => {
          const href = $(el).attr('href') || '';
          if (href.includes('match-direct') && href.includes('ligue-1')) {
            matchLinks.push(href);
          }
        });

        if (matchLinks.length > 0) {
          console.log(`   ✅ Matchs Ligue 1: ${matchLinks.length}`);
          console.log('   Premier:', matchLinks[0]);
          fs.writeFileSync('debug_journee.html', content);
          break;
        }
      }
    }
  } catch (err) {
    console.log('   Erreur:', err.message);
  }

  // Test 3: Explorer un match spécifique de Ligue 1
  console.log('\n3. Recherche directe match Ligue 1:');
  try {
    // Chercher dans le HTML sauvegardé
    const calHtml = fs.readFileSync('debug_calendrier_l1.html', 'utf8');
    const $cal = cheerio.load(calHtml);

    // Trouver tous les liens qui ressemblent à des matchs
    const allHrefs = [];
    $cal('a').each((_, el) => {
      allHrefs.push($cal(el).attr('href') || '');
    });

    // Filtrer pour Ligue 1
    const l1Matches = allHrefs.filter(h => h.includes('ligue-1') && h.includes('live'));
    console.log(`   Matchs L1 dans calendrier: ${l1Matches.length}`);

    if (l1Matches.length > 0) {
      const matchUrl = l1Matches[0].startsWith('http') ? l1Matches[0] : `https://www.lequipe.fr${l1Matches[0]}`;
      console.log(`   Test match: ${matchUrl}`);

      await page.goto(matchUrl, { waitUntil: 'networkidle2', timeout: 20000 });
      await new Promise(r => setTimeout(r, 3000));

      const matchContent = await page.content();
      const $m = cheerio.load(matchContent);

      // Chercher les joueurs
      const players = [];
      $m('a').each((_, el) => {
        const href = $m(el).attr('href') || '';
        const text = $m(el).text().trim();
        if (href.includes('Footballeur') && text.length > 2 && text.length < 50) {
          players.push({ name: text, href });
        }
      });

      console.log(`   ✅ Joueurs trouvés: ${players.length}`);
      if (players.length > 0) {
        console.log('   Exemples:', players.slice(0, 10).map(p => p.name).join(', '));
      }

      fs.writeFileSync('debug_match_l1.html', matchContent);
      console.log('   HTML match sauvegardé');
    }

  } catch (err) {
    console.log('   Erreur:', err.message);
  }

  await browser.close();
  console.log('\n✅ Exploration terminée');
}

test().catch(console.error);
