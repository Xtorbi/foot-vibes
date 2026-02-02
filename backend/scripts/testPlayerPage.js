/**
 * Test : explorer une fiche joueur L'Équipe pour voir les données disponibles
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function main() {
  const playerId = process.argv[2] || '48416'; // Kylian Mbappé par défaut
  const url = `https://www.lequipe.fr/Football/FootballFicheJoueur${playerId}.html`;

  console.log(`\n🔍 Analyse de ${url}\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    await new Promise(r => setTimeout(r, 2000));

    const content = await page.content();
    const $ = cheerio.load(content);

    // Titre de la page
    const title = $('title').text();
    console.log('📄 Titre:', title);

    // Chercher le nom du joueur
    const h1 = $('h1').text().trim();
    console.log('👤 H1:', h1);

    // Chercher toutes les infos textuelles
    const bodyText = $('body').text();

    // Patterns à chercher
    const patterns = [
      { name: 'Poste', regex: /Poste\s*:\s*([^\n]+)/i },
      { name: 'Nationalité', regex: /Nationalité\s*:\s*([^\n]+)/i },
      { name: 'Âge', regex: /(\d{1,2})\s*ans/i },
      { name: 'Date naissance', regex: /Né le\s*([^\n]+)/i },
      { name: 'Taille', regex: /(\d+)\s*cm/i },
      { name: 'Poids', regex: /(\d+)\s*kg/i },
      { name: 'Club', regex: /Club\s*:\s*([^\n]+)/i },
    ];

    console.log('\n📊 Infos extraites:');
    patterns.forEach(p => {
      const match = bodyText.match(p.regex);
      if (match) console.log(`   ${p.name}: ${match[1].trim()}`);
    });

    // Chercher les stats de saison
    console.log('\n📈 Recherche stats saison...');

    // Chercher des tableaux de stats
    $('table').each((i, table) => {
      const tableText = $(table).text();
      if (tableText.includes('Matchs') || tableText.includes('Buts') || tableText.includes('Minutes')) {
        console.log(`\n   Table ${i}:`);
        $(table).find('tr').each((j, row) => {
          const rowText = $(row).text().replace(/\s+/g, ' ').trim();
          if (rowText.length < 200) console.log(`   ${rowText}`);
        });
      }
    });

    // Chercher des éléments avec des classes liées aux stats
    console.log('\n🔎 Éléments avec stats:');
    $('[class*="stat"], [class*="Stat"], [class*="number"], [class*="value"]').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 50 && i < 20) {
        console.log(`   ${$(el).attr('class')}: "${text}"`);
      }
    });

    // Chercher les sections
    console.log('\n📑 Sections H2/H3:');
    $('h2, h3').each((i, el) => {
      const text = $(el).text().trim();
      if (text) console.log(`   ${el.tagName}: ${text}`);
    });

    // Afficher un extrait du texte brut pour repérer les patterns
    console.log('\n📝 Extrait texte (recherche stats):');
    const statsContext = bodyText.match(/.{0,50}(Matchs?|Buts?|Passes?|Minutes?|Titulaire).{0,100}/gi);
    if (statsContext) {
      statsContext.slice(0, 10).forEach(ctx => console.log(`   "${ctx.trim()}"`));
    }

  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }

  await browser.close();
  console.log('\n✅ Terminé');
}

main().catch(console.error);
