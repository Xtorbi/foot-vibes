const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { runSql } = require('../models/database');
const { CURRENT_SEASON } = require('../config/clubs');

// Clés secrètes
const ADMIN_KEY = process.env.ADMIN_KEY || 'topflop-admin-2026';
const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY || 'c3778e56a9194c8cb10b0ed617c86492';

// Mapping Football-Data.org -> nom en BDD
const FOOTBALLDATA_TO_DB = {
  'Paris Saint-Germain FC': 'Paris Saint-Germain',
  'Olympique de Marseille': 'Olympique de Marseille',
  'Olympique Lyonnais': 'Olympique Lyonnais',
  'AS Monaco FC': 'AS Monaco',
  'Lille OSC': 'LOSC Lille',
  'OGC Nice': 'OGC Nice',
  'RC Lens': 'RC Lens',
  'Stade Rennais FC 1901': 'Stade Rennais',
  'Stade Brestois 29': 'Stade Brestois 29',
  'RC Strasbourg Alsace': 'RC Strasbourg Alsace',
  'Toulouse FC': 'Toulouse FC',
  'FC Nantes': 'FC Nantes',
  'Le Havre AC': 'Le Havre AC',
  'AJ Auxerre': 'AJ Auxerre',
  'Angers SCO': 'Angers SCO',
  'FC Lorient': 'FC Lorient',
  'Paris FC': 'Paris FC',
  'FC Metz': 'FC Metz',
  // Variantes possibles
  'Paris SG': 'Paris Saint-Germain',
  'Monaco': 'AS Monaco',
  'Lille': 'LOSC Lille',
  'Marseille': 'Olympique de Marseille',
  'Lyon': 'Olympique Lyonnais',
  'Rennes': 'Stade Rennais',
  'Brest': 'Stade Brestois 29',
  'Strasbourg': 'RC Strasbourg Alsace',
  'Nantes': 'FC Nantes',
  'Auxerre': 'AJ Auxerre',
  'Angers': 'Angers SCO',
  'Lorient': 'FC Lorient',
  'Metz': 'FC Metz',
};

// Trouver le nom du club en BDD
function findClubName(apiName) {
  if (!apiName) return null;

  // Essai direct
  if (FOOTBALLDATA_TO_DB[apiName]) {
    return FOOTBALLDATA_TO_DB[apiName];
  }

  // Recherche partielle
  for (const [key, value] of Object.entries(FOOTBALLDATA_TO_DB)) {
    if (apiName.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(apiName.toLowerCase())) {
      return value;
    }
  }

  return null;
}

/**
 * Route pour mettre à jour les dates de match des joueurs
 * Utilise Football-Data.org API (gratuit)
 */
router.get('/update-matches', async (req, res) => {
  const { key } = req.query;

  // Vérification de la clé admin
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const now = new Date();
  const logs = [];

  try {
    logs.push(`Starting update at ${now.toISOString()}`);

    // Récupérer les matchs des 3 derniers jours
    const dateFrom = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const dateFromStr = dateFrom.toISOString().split('T')[0];
    const dateToStr = now.toISOString().split('T')[0];

    // Appel API Football-Data.org - Ligue 1 (FL1)
    const url = `https://api.football-data.org/v4/competitions/FL1/matches?dateFrom=${dateFromStr}&dateTo=${dateToStr}&status=FINISHED`;
    logs.push(`Fetching: ${url}`);

    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': FOOTBALL_DATA_API_KEY,
      },
    });

    logs.push(`Response status: ${response.status}`);

    if (!response.ok) {
      const text = await response.text();
      logs.push(`Error body: ${text.substring(0, 500)}`);
      throw new Error(`Football-Data API error: ${response.status}`);
    }

    const data = await response.json();
    const matches = data.matches || [];
    logs.push(`Matches found: ${matches.length}`);

    const updatedClubs = [];
    const unmatchedTeams = [];

    for (const match of matches) {
      const homeTeam = match.homeTeam?.name;
      const awayTeam = match.awayTeam?.name;
      const matchDate = match.utcDate; // ISO format

      logs.push(`Match: ${homeTeam} vs ${awayTeam} at ${matchDate}`);

      // Mettre à jour les joueurs des deux équipes
      for (const teamName of [homeTeam, awayTeam]) {
        const clubName = findClubName(teamName);

        if (clubName) {
          runSql(
            `UPDATE players SET last_match_date = ? WHERE club = ? AND source_season = ?`,
            [matchDate, clubName, CURRENT_SEASON]
          );
          updatedClubs.push({ club: clubName, matchDate, apiName: teamName });
        } else if (teamName) {
          unmatchedTeams.push(teamName);
        }
      }
    }

    res.json({
      success: true,
      matchesFound: matches.length,
      updatedClubs,
      unmatchedTeams: [...new Set(unmatchedTeams)],
      timestamp: now.toISOString(),
      logs,
    });
  } catch (error) {
    console.error('Error updating matches:', error);
    logs.push(`Error: ${error.message}`);
    res.status(500).json({
      error: error.message,
      logs,
      timestamp: now.toISOString(),
    });
  }
});

/**
 * Route de health check pour le cron
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
