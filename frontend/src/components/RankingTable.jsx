// Mapping nationalité -> code ISO pour les drapeaux
// Inclut les variantes Transfermarkt
const NATIONALITY_CODES = {
  // Europe de l'Ouest
  'France': 'fr',
  'England': 'gb-eng',
  'Angleterre': 'gb-eng',
  'Spain': 'es',
  'Germany': 'de',
  'Italy': 'it',
  'Portugal': 'pt',
  'Belgium': 'be',
  'Netherlands': 'nl',
  'Austria': 'at',
  'Switzerland': 'ch',
  'Luxembourg': 'lu',
  'Ireland': 'ie',
  'Republic of Ireland': 'ie',
  'Scotland': 'gb-sct',
  'Wales': 'gb-wls',
  'Northern Ireland': 'gb-nir',

  // Europe du Nord
  'Denmark': 'dk',
  'Sweden': 'se',
  'Norway': 'no',
  'Finland': 'fi',
  'Iceland': 'is',

  // Europe de l'Est
  'Poland': 'pl',
  'Pologne': 'pl',
  'Czech Republic': 'cz',
  'Czechia': 'cz',
  'Tchéquie': 'cz',
  'Slovakia': 'sk',
  'Hungary': 'hu',
  'Romania': 'ro',
  'Bulgaria': 'bg',
  'Ukraine': 'ua',
  'Russia': 'ru',
  'Belarus': 'by',
  'Moldova': 'md',

  // Balkans
  'Croatia': 'hr',
  'Serbia': 'rs',
  'Bosnia-Herzegovina': 'ba',
  'Bosnia and Herzegovina': 'ba',
  'Montenegro': 'me',
  'Slovenia': 'si',
  'North Macedonia': 'mk',
  'Macedonia': 'mk',
  'Albania': 'al',
  'Kosovo': 'xk',
  'Greece': 'gr',
  'Grèce': 'gr',

  // Autres Europe
  'Turkey': 'tr',
  'Georgia': 'ge',
  'Armenia': 'am',
  'Azerbaijan': 'az',
  'Cyprus': 'cy',
  'Malta': 'mt',

  // Afrique du Nord
  'Morocco': 'ma',
  'Algeria': 'dz',
  'Tunisia': 'tn',
  'Egypt': 'eg',
  'Libya': 'ly',

  // Afrique de l'Ouest
  'Senegal': 'sn',
  'Ivory Coast': 'ci',
  'Cote d\'Ivoire': 'ci',
  'Côte d\'Ivoire': 'ci',
  'Mali': 'ml',
  'Guinea': 'gn',
  'Burkina Faso': 'bf',
  'Ghana': 'gh',
  'Nigeria': 'ng',
  'Cameroon': 'cm',
  'Cameroun': 'cm',
  'Togo': 'tg',
  'Benin': 'bj',
  'Niger': 'ne',
  'Mauritania': 'mr',
  'Gambia': 'gm',
  'The Gambia': 'gm',
  'Guinea-Bissau': 'gw',
  'Sierra Leone': 'sl',
  'Liberia': 'lr',
  'Cape Verde': 'cv',
  'Cabo Verde': 'cv',

  // Afrique Centrale
  'DR Congo': 'cd',
  'Congo DR': 'cd',
  'Democratic Republic of Congo': 'cd',
  'Congo': 'cg',
  'Republic of the Congo': 'cg',
  'Gabon': 'ga',
  'Equatorial Guinea': 'gq',
  'Central African Republic': 'cf',
  'Chad': 'td',
  'Rwanda': 'rw',
  'Burundi': 'bi',

  // Afrique de l'Est
  'Kenya': 'ke',
  'Tanzania': 'tz',
  'Uganda': 'ug',
  'Ethiopia': 'et',
  'Somalia': 'so',
  'Eritrea': 'er',
  'Djibouti': 'dj',
  'Comoros': 'km',
  'Madagascar': 'mg',
  'Mauritius': 'mu',

  // Afrique Australe
  'South Africa': 'za',
  'Zimbabwe': 'zw',
  'Zambia': 'zm',
  'Angola': 'ao',
  'Mozambique': 'mz',
  'Namibia': 'na',
  'Botswana': 'bw',

  // Amérique du Sud
  'Brazil': 'br',
  'Argentina': 'ar',
  'Argentine': 'ar',
  'Colombia': 'co',
  'Uruguay': 'uy',
  'Chile': 'cl',
  'Venezuela': 've',
  'Peru': 'pe',
  'Ecuador': 'ec',
  'Paraguay': 'py',
  'Bolivia': 'bo',

  // Amérique du Nord / Centrale
  'USA': 'us',
  'United States': 'us',
  'Canada': 'ca',
  'Mexico': 'mx',
  'Haiti': 'ht',
  'Jamaica': 'jm',
  'Honduras': 'hn',
  'Costa Rica': 'cr',
  'Panama': 'pa',
  'Guatemala': 'gt',
  'El Salvador': 'sv',
  'Nicaragua': 'ni',
  'Cuba': 'cu',
  'Dominican Republic': 'do',
  'Trinidad and Tobago': 'tt',
  'Curaçao': 'cw',
  'Curacao': 'cw',
  'Suriname': 'sr',
  'Guadeloupe': 'gp',
  'Martinique': 'mq',
  'French Guiana': 'gf',

  // Asie
  'Japan': 'jp',
  'South Korea': 'kr',
  'Korea Republic': 'kr',
  'China': 'cn',
  'Iran': 'ir',
  'Israel': 'il',
  'Saudi Arabia': 'sa',
  'Qatar': 'qa',
  'United Arab Emirates': 'ae',
  'Iraq': 'iq',
  'Syria': 'sy',
  'Lebanon': 'lb',
  'Jordan': 'jo',
  'Palestine': 'ps',
  'Uzbekistan': 'uz',
  'Kazakhstan': 'kz',
  'Tajikistan': 'tj',
  'Kyrgyzstan': 'kg',
  'Turkmenistan': 'tm',
  'Afghanistan': 'af',
  'Pakistan': 'pk',
  'India': 'in',
  'Vietnam': 'vn',
  'Thailand': 'th',
  'Indonesia': 'id',
  'Philippines': 'ph',
  'Malaysia': 'my',

  // Océanie
  'Australia': 'au',
  'New Zealand': 'nz',
  'New Caledonia': 'nc',
  'Tahiti': 'pf',
};

function getFlag(nationality) {
  if (!nationality) return null;
  const code = NATIONALITY_CODES[nationality];
  if (!code) return null;
  return `https://flagcdn.com/16x12/${code}.png`;
}

function getMissingNationalities(players) {
  const missing = new Set();
  players.forEach(p => {
    if (p.nationality && !NATIONALITY_CODES[p.nationality]) {
      missing.add(p.nationality);
    }
  });
  return Array.from(missing).sort();
}

function RankingTable({ players }) {
  if (!players || players.length === 0) {
    return <p className="text-center text-white/40 mt-8 animate-fade-in-up">Aucun joueur dans le classement.</p>;
  }

  const getRankStyle = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-fv-navy';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-fv-navy';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white';
    return 'bg-white/10 text-white/60';
  };

  return (
    <div className="overflow-x-auto rounded-xl bg-fv-navy-light border border-white/5">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/10 text-white/40 text-xs sm:text-sm">
            <th className="py-2 sm:py-3 px-2 sm:px-3 w-12 sm:w-14">#</th>
            <th className="py-2 sm:py-3 px-2 sm:px-3">Joueur</th>
            <th className="py-2 sm:py-3 px-2 sm:px-3 hidden sm:table-cell">Club</th>
            <th className="py-2 sm:py-3 px-2 sm:px-3 hidden md:table-cell">Poste</th>
            <th className="py-2 sm:py-3 px-2 sm:px-3 text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr
              key={player.id}
              className="border-b border-white/5 hover:bg-white/5
                         transition-colors duration-150 animate-fade-in-up"
              style={{ animationDelay: `${index * 20}ms`, animationFillMode: 'backwards' }}
            >
              <td className="py-2 sm:py-3 px-2 sm:px-3">
                <span className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold text-xs sm:text-sm ${getRankStyle(player.rank)}`}>
                  {player.rank}
                </span>
              </td>
              <td className="py-2 sm:py-3 px-2 sm:px-3">
                <div className="flex items-center gap-2">
                  {getFlag(player.nationality) && (
                    <img
                      src={getFlag(player.nationality)}
                      alt={player.nationality}
                      className="w-4 h-3 object-cover"
                    />
                  )}
                  <span className="font-semibold text-white text-sm sm:text-base">{player.name}</span>
                </div>
              </td>
              <td className="py-2 sm:py-3 px-2 sm:px-3 text-white/50 hidden sm:table-cell">{player.club}</td>
              <td className="py-2 sm:py-3 px-2 sm:px-3 text-white/50 hidden md:table-cell">{player.position}</td>
              <td className="py-2 sm:py-3 px-2 sm:px-3 text-right font-bold">
                <span className={`inline-block px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-sm ${
                  player.score > 0 ? 'bg-emerald-500/20 text-emerald-400' :
                  player.score < 0 ? 'bg-red-500/20 text-red-400' :
                  'bg-white/10 text-white/40'
                }`}>
                  {player.score > 0 ? '+' : ''}{player.score}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RankingTable;
