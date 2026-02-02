/**
 * Explorer la structure d'une page de match L'Équipe
 */
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

async function explore() {
  console.log('🔍 Exploration structure page match\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  // 1. Aller sur le calendrier pour trouver des matchs terminés
  console.log('1. Recherche matchs terminés...');
  await page.goto('https://www.lequipe.fr/Football/ligue-1/page-calendrier-resultats/', {
    waitUntil: 'networkidle2',
    timeout: 45000
  });
  await new Promise(r => setTimeout(r, 5000));

  let content = await page.content();
  let $ = cheerio.load(content);

  // Chercher les liens de matchs avec score (terminés)
  const matchLinks = [];
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim();
    // Chercher les liens qui contiennent un score (X - Y)
    if (href.includes('ligue-1') && href.includes('live')) {
      matchLinks.push({ href, text: text.substring(0, 50) });
    }
  });

  console.log(`   Liens matchs trouvés: ${matchLinks.length}`);

  // Chercher directement dans le HTML les liens avec format match-direct
  const matchUrls = [];
  const hrefMatches = content.match(/href="([^"]*ligue-1[^"]*live[^"]*)"/g) || [];
  hrefMatches.forEach(m => {
    const url = m.match(/href="([^"]*)"/)[1];
    if (!matchUrls.includes(url)) matchUrls.push(url);
  });

  console.log(`   URLs matchs extraites: ${matchUrls.length}`);
  if (matchUrls.length > 0) {
    console.log('   Exemples:');
    matchUrls.slice(0, 5).forEach(u => console.log(`      ${u}`));
  }

  // 2. Aller sur un match terminé
  if (matchUrls.length > 0) {
    // Prendre un match au milieu de la liste (plus susceptible d'être terminé)
    const matchUrl = matchUrls[Math.floor(matchUrls.length / 2)];
    const fullUrl = matchUrl.startsWith('http') ? matchUrl : `https://www.lequipe.fr${matchUrl}`;

    console.log(`\n2. Exploration match: ${fullUrl}`);
    await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 4000));

    content = await page.content();
    $ = cheerio.load(content);

    const title = $('title').text().trim();
    console.log(`   Titre: ${title}`);

    // Sauvegarder le HTML
    fs.writeFileSync('debug_match_structure.html', content);
    console.log('   HTML sauvegardé: debug_match_structure.html');

    // Analyser la structure
    console.log('\n3. Analyse structure:');

    // Chercher les sections de composition
    const sections = [];
    $('section, div, article').each((_, el) => {
      const className = $(el).attr('class') || '';
      const id = $(el).attr('id') || '';
      if (className.toLowerCase().includes('compo') ||
          className.toLowerCase().includes('lineup') ||
          className.toLowerCase().includes('team') ||
          className.toLowerCase().includes('player') ||
          id.toLowerCase().includes('compo')) {
        sections.push({ tag: el.tagName, class: className, id });
      }
    });
    console.log(`   Sections composition: ${sections.length}`);
    sections.slice(0, 5).forEach(s => console.log(`      ${s.tag}.${s.class || s.id}`));

    // Chercher les liens vers joueurs
    const playerLinks = [];
    $('a[href*="FootballFicheJoueur"]').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (text && text.length > 1) {
        playerLinks.push({ name: text, href });
      }
    });
    console.log(`\n   Joueurs trouvés: ${playerLinks.length}`);
    if (playerLinks.length > 0) {
      console.log('   Liste:');
      playerLinks.forEach(p => console.log(`      - ${p.name}`));
    }

    // Chercher les buteurs/passeurs
    console.log('\n   Recherche buteurs/stats...');
    const bodyText = $('body').text();

    // Pattern pour buteurs: "Nom (minute')"
    const buteurPattern = /([A-Za-zÀ-ÿ\s\-\.]+)\s*\((\d+)'?\)/g;
    let match;
    const buteurs = [];
    while ((match = buteurPattern.exec(bodyText)) !== null) {
      if (match[1].trim().length > 2 && match[1].trim().length < 30) {
        buteurs.push({ name: match[1].trim(), minute: match[2] });
      }
    }
    if (buteurs.length > 0) {
      console.log('   Buteurs potentiels:');
      buteurs.slice(0, 10).forEach(b => console.log(`      - ${b.name} (${b.minute}')`));
    }

    // Chercher le score
    const scoreMatch = bodyText.match(/(\d)\s*[-–]\s*(\d)/);
    if (scoreMatch) {
      console.log(`\n   Score: ${scoreMatch[1]} - ${scoreMatch[2]}`);
    }

    // Chercher les équipes
    const equipesMatch = title.match(/([^-–]+)\s*[-–]\s*([^(,]+)/);
    if (equipesMatch) {
      console.log(`   Équipes: ${equipesMatch[1].trim()} vs ${equipesMatch[2].trim()}`);
    }
  }

  // 3. Explorer la page "compo" si elle existe
  console.log('\n4. Test page composition spécifique...');
  if (matchUrls.length > 0) {
    // Remplacer "live" par "compo" ou ajouter "/compo"
    const matchUrl = matchUrls[0];
    const compoUrl = matchUrl.replace('-live/', '-compo/').replace('-preview/', '-compo/');
    const fullCompoUrl = `https://www.lequipe.fr${compoUrl}`;

    console.log(`   Test: ${fullCompoUrl}`);
    try {
      const resp = await page.goto(fullCompoUrl, { waitUntil: 'networkidle2', timeout: 15000 });
      console.log(`   Status: ${resp.status()}`);

      if (resp.status() === 200) {
        await new Promise(r => setTimeout(r, 3000));
        content = await page.content();
        $ = cheerio.load(content);

        const players = [];
        $('a[href*="FootballFicheJoueur"]').each((_, el) => {
          const text = $(el).text().trim();
          if (text && text.length > 1) players.push(text);
        });

        console.log(`   Joueurs sur page compo: ${players.length}`);
        if (players.length > 0) {
          console.log('   Liste:', players.slice(0, 15).join(', '));
          fs.writeFileSync('debug_compo.html', content);
        }
      }
    } catch (err) {
      console.log(`   Erreur: ${err.message}`);
    }
  }

  await browser.close();
  console.log('\n✅ Exploration terminée');
}

explore().catch(console.error);
