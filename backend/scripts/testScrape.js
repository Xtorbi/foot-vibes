/**
 * Test de scraping sur un seul club pour vérifier la structure
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function test() {
  console.log('🔍 Test scraping L\'Équipe - PSG\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Test 1: Page effectif PSG
  console.log('1. Test page effectif PSG:');
  const effectifUrl = 'https://www.lequipe.fr/Football/club/paris-sg/effectif';
  console.log(`   URL: ${effectifUrl}`);

  try {
    await page.goto(effectifUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    const content = await page.content();
    const $ = cheerio.load(content);

    // Debug: afficher la structure
    console.log('\n   Titre page:', $('title').text());
    console.log('   H1:', $('h1').first().text().trim());

    // Chercher tous les liens vers des joueurs
    const playerLinks = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      if (href.includes('/Football/Footballeur/') || href.includes('/football/joueur/')) {
        playerLinks.push({ text, href });
      }
    });

    console.log(`\n   Liens joueurs trouvés: ${playerLinks.length}`);
    if (playerLinks.length > 0) {
      console.log('   5 premiers:');
      playerLinks.slice(0, 5).forEach(p => console.log(`      - ${p.text}: ${p.href}`));
    }

    // Alternative: chercher par structure de liste
    console.log('\n   Recherche par structure alternative...');

    // Chercher les sections/divs qui pourraient contenir les joueurs
    const sections = [];
    $('section, div[class*="squad"], div[class*="roster"], div[class*="effectif"], div[class*="player"], ul[class*="player"]').each((_, el) => {
      const className = $(el).attr('class') || '';
      if (className) sections.push(className);
    });
    console.log('   Classes trouvées:', [...new Set(sections)].slice(0, 10).join(', '));

    // Chercher les images de joueurs
    const images = [];
    $('img').each((_, el) => {
      const src = $(el).attr('src') || '';
      const alt = $(el).attr('alt') || '';
      if (src.includes('joueur') || src.includes('player') || alt.includes('joueur')) {
        images.push({ alt, src: src.substring(0, 80) });
      }
    });
    console.log(`\n   Images joueurs: ${images.length}`);

    // Sauvegarder le HTML pour analyse
    const fs = require('fs');
    fs.writeFileSync('debug_page.html', content);
    console.log('\n   HTML sauvegardé dans debug_page.html');

  } catch (err) {
    console.error('   Erreur:', err.message);
  }

  // Test 2: Essayer une autre URL
  console.log('\n2. Test page club directe:');
  const clubUrl = 'https://www.lequipe.fr/Football/club/paris-sg/';

  try {
    await page.goto(clubUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    const content2 = await page.content();
    const $2 = cheerio.load(content2);

    const links2 = [];
    $2('a').each((_, el) => {
      const href = $2(el).attr('href') || '';
      if (href.includes('effectif') || href.includes('squad') || href.includes('joueur')) {
        links2.push(href);
      }
    });
    console.log('   Liens effectif/joueurs:', [...new Set(links2)].slice(0, 5).join(', '));

  } catch (err) {
    console.error('   Erreur:', err.message);
  }

  // Test 3: API L'Équipe (si elle existe)
  console.log('\n3. Test recherche API/données structurées:');
  try {
    const statsUrl = 'https://www.lequipe.fr/Football/ligue-1/page-classement-equipes/general';
    await page.goto(statsUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    const content3 = await page.content();
    const $3 = cheerio.load(content3);

    console.log('   Titre:', $3('title').text());

    // Chercher des données JSON embarquées
    $3('script').each((_, el) => {
      const scriptContent = $3(el).html() || '';
      if (scriptContent.includes('"players"') || scriptContent.includes('"team"') || scriptContent.includes('__NEXT_DATA__')) {
        console.log('   ✅ Données JSON trouvées dans un script!');
        // Extraire un échantillon
        const sample = scriptContent.substring(0, 500);
        console.log('   Échantillon:', sample.substring(0, 200) + '...');
      }
    });

  } catch (err) {
    console.error('   Erreur:', err.message);
  }

  await browser.close();
  console.log('\n✅ Test terminé');
}

test().catch(console.error);
