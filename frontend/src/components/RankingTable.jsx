// Mapping nationalité -> code ISO pour les drapeaux
// Inclut les variantes françaises (Transfermarkt FR) et anglaises
const NATIONALITY_CODES = {
  // Europe de l'Ouest
  'France': 'fr',
  'England': 'gb-eng',
  'Angleterre': 'gb-eng',
  'Spain': 'es',
  'Espagne': 'es',
  'Germany': 'de',
  'Allemagne': 'de',
  'Italy': 'it',
  'Italie': 'it',
  'Portugal': 'pt',
  'Belgium': 'be',
  'Belgique': 'be',
  'Netherlands': 'nl',
  'Pays-Bas': 'nl',
  'Austria': 'at',
  'Autriche': 'at',
  'Switzerland': 'ch',
  'Suisse': 'ch',
  'Luxembourg': 'lu',
  'Ireland': 'ie',
  'Irlande': 'ie',
  'Republic of Ireland': 'ie',
  'Scotland': 'gb-sct',
  'Écosse': 'gb-sct',
  'Wales': 'gb-wls',
  'Pays de Galles': 'gb-wls',
  'Northern Ireland': 'gb-nir',
  'Irlande du Nord': 'gb-nir',

  // Europe du Nord
  'Denmark': 'dk',
  'Danemark': 'dk',
  'Sweden': 'se',
  'Suède': 'se',
  'Norway': 'no',
  'Norvège': 'no',
  'Finland': 'fi',
  'Finlande': 'fi',
  'Iceland': 'is',
  'Islande': 'is',

  // Europe de l'Est
  'Poland': 'pl',
  'Pologne': 'pl',
  'Czech Republic': 'cz',
  'Czechia': 'cz',
  'Tchéquie': 'cz',
  'Slovakia': 'sk',
  'Slovaquie': 'sk',
  'Hungary': 'hu',
  'Hongrie': 'hu',
  'Romania': 'ro',
  'Roumanie': 'ro',
  'Bulgaria': 'bg',
  'Bulgarie': 'bg',
  'Ukraine': 'ua',
  'Russia': 'ru',
  'Russie': 'ru',
  'Belarus': 'by',
  'Biélorussie': 'by',
  'Moldova': 'md',
  'Moldavie': 'md',

  // Balkans
  'Croatia': 'hr',
  'Croatie': 'hr',
  'Serbia': 'rs',
  'Serbie': 'rs',
  'Bosnia-Herzegovina': 'ba',
  'Bosnia and Herzegovina': 'ba',
  'Bosnie-Herzégovine': 'ba',
  'Montenegro': 'me',
  'Monténégro': 'me',
  'Slovenia': 'si',
  'Slovénie': 'si',
  'North Macedonia': 'mk',
  'Macedonia': 'mk',
  'Macédoine du Nord': 'mk',
  'Albania': 'al',
  'Albanie': 'al',
  'Kosovo': 'xk',
  'Greece': 'gr',
  'Grèce': 'gr',

  // Autres Europe
  'Turkey': 'tr',
  'Turquie': 'tr',
  'Georgia': 'ge',
  'Géorgie': 'ge',
  'Armenia': 'am',
  'Arménie': 'am',
  'Azerbaijan': 'az',
  'Azerbaïdjan': 'az',
  'Cyprus': 'cy',
  'Chypre': 'cy',
  'Malta': 'mt',
  'Malte': 'mt',

  // Afrique du Nord
  'Morocco': 'ma',
  'Maroc': 'ma',
  'Algeria': 'dz',
  'Algérie': 'dz',
  'Tunisia': 'tn',
  'Tunisie': 'tn',
  'Egypt': 'eg',
  'Égypte': 'eg',
  'Libya': 'ly',
  'Libye': 'ly',

  // Afrique de l'Ouest
  'Senegal': 'sn',
  'Sénégal': 'sn',
  'Ivory Coast': 'ci',
  'Cote d\'Ivoire': 'ci',
  'Côte d\'Ivoire': 'ci',
  'Mali': 'ml',
  'Guinea': 'gn',
  'Guinée': 'gn',
  'Burkina Faso': 'bf',
  'Ghana': 'gh',
  'Nigeria': 'ng',
  'Nigéria': 'ng',
  'Cameroon': 'cm',
  'Cameroun': 'cm',
  'Togo': 'tg',
  'Benin': 'bj',
  'Bénin': 'bj',
  'Niger': 'ne',
  'Mauritania': 'mr',
  'Mauritanie': 'mr',
  'Gambia': 'gm',
  'Gambie': 'gm',
  'The Gambia': 'gm',
  'Guinea-Bissau': 'gw',
  'Guinée-Bissau': 'gw',
  'Sierra Leone': 'sl',
  'Liberia': 'lr',
  'Libéria': 'lr',
  'Cape Verde': 'cv',
  'Cabo Verde': 'cv',
  'Cap-Vert': 'cv',

  // Afrique Centrale
  'DR Congo': 'cd',
  'Congo DR': 'cd',
  'Democratic Republic of Congo': 'cd',
  'RD Congo': 'cd',
  'Congo': 'cg',
  'Republic of the Congo': 'cg',
  'Gabon': 'ga',
  'Equatorial Guinea': 'gq',
  'Guinée équatoriale': 'gq',
  'Central African Republic': 'cf',
  'République Centrafricaine': 'cf',
  'Chad': 'td',
  'Tchad': 'td',
  'Rwanda': 'rw',
  'Burundi': 'bi',

  // Afrique de l'Est
  'Kenya': 'ke',
  'Tanzania': 'tz',
  'Tanzanie': 'tz',
  'Uganda': 'ug',
  'Ouganda': 'ug',
  'Ethiopia': 'et',
  'Éthiopie': 'et',
  'Somalia': 'so',
  'Somalie': 'so',
  'Eritrea': 'er',
  'Érythrée': 'er',
  'Djibouti': 'dj',
  'Comoros': 'km',
  'Comores': 'km',
  'Madagascar': 'mg',
  'Mauritius': 'mu',
  'Maurice': 'mu',

  // Afrique Australe
  'South Africa': 'za',
  'Afrique du Sud': 'za',
  'Zimbabwe': 'zw',
  'Zambia': 'zm',
  'Zambie': 'zm',
  'Angola': 'ao',
  'Mozambique': 'mz',
  'Namibia': 'na',
  'Namibie': 'na',
  'Botswana': 'bw',

  // Amérique du Sud
  'Brazil': 'br',
  'Brésil': 'br',
  'Argentina': 'ar',
  'Argentine': 'ar',
  'Colombia': 'co',
  'Colombie': 'co',
  'Uruguay': 'uy',
  'Chile': 'cl',
  'Chili': 'cl',
  'Venezuela': 've',
  'Vénézuéla': 've',
  'Peru': 'pe',
  'Pérou': 'pe',
  'Ecuador': 'ec',
  'Équateur': 'ec',
  'Paraguay': 'py',
  'Bolivia': 'bo',
  'Bolivie': 'bo',

  // Amérique du Nord / Centrale
  'USA': 'us',
  'United States': 'us',
  'États-Unis': 'us',
  'Canada': 'ca',
  'Mexico': 'mx',
  'Mexique': 'mx',
  'Haiti': 'ht',
  'Haïti': 'ht',
  'Jamaica': 'jm',
  'Jamaïque': 'jm',
  'Honduras': 'hn',
  'Costa Rica': 'cr',
  'Panama': 'pa',
  'Guatemala': 'gt',
  'El Salvador': 'sv',
  'Salvador': 'sv',
  'Nicaragua': 'ni',
  'Cuba': 'cu',
  'Dominican Republic': 'do',
  'République Dominicaine': 'do',
  'Trinidad and Tobago': 'tt',
  'Trinité-et-Tobago': 'tt',
  'Curaçao': 'cw',
  'Curacao': 'cw',
  'Suriname': 'sr',
  'Guadeloupe': 'gp',
  'Martinique': 'mq',
  'French Guiana': 'gf',
  'Guyane Française': 'gf',
  'Guyane française': 'gf',
  'Montserrat': 'ms',

  // Asie
  'Japan': 'jp',
  'Japon': 'jp',
  'South Korea': 'kr',
  'Korea Republic': 'kr',
  'Corée du Sud': 'kr',
  'China': 'cn',
  'Chine': 'cn',
  'Iran': 'ir',
  'Israel': 'il',
  'Israël': 'il',
  'Saudi Arabia': 'sa',
  'Arabie Saoudite': 'sa',
  'Arabie saoudite': 'sa',
  'Qatar': 'qa',
  'United Arab Emirates': 'ae',
  'Émirats arabes unis': 'ae',
  'Iraq': 'iq',
  'Irak': 'iq',
  'Syria': 'sy',
  'Syrie': 'sy',
  'Lebanon': 'lb',
  'Liban': 'lb',
  'Jordan': 'jo',
  'Jordanie': 'jo',
  'Palestine': 'ps',
  'Uzbekistan': 'uz',
  'Ouzbékistan': 'uz',
  'Kazakhstan': 'kz',
  'Tajikistan': 'tj',
  'Tadjikistan': 'tj',
  'Kyrgyzstan': 'kg',
  'Kirghizistan': 'kg',
  'Turkmenistan': 'tm',
  'Turkménistan': 'tm',
  'Afghanistan': 'af',
  'Pakistan': 'pk',
  'India': 'in',
  'Inde': 'in',
  'Vietnam': 'vn',
  'Viêt Nam': 'vn',
  'Thailand': 'th',
  'Thaïlande': 'th',
  'Indonesia': 'id',
  'Indonésie': 'id',
  'Philippines': 'ph',
  'Malaysia': 'my',
  'Malaisie': 'my',

  // Océanie
  'Australia': 'au',
  'Australie': 'au',
  'New Zealand': 'nz',
  'Nouvelle-Zélande': 'nz',
  'New Caledonia': 'nc',
  'Nouvelle-Calédonie': 'nc',
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
    if (rank === 1) return 'bg-emerald-500 text-fv-navy';
    if (rank === 2) return 'bg-emerald-500/70 text-fv-navy';
    if (rank === 3) return 'bg-emerald-500/40 text-white';
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
            <th className="py-2 sm:py-3 px-2 sm:px-3 hidden sm:table-cell text-center">Votants</th>
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
              <td className="py-2 sm:py-3 px-2 sm:px-3 text-white/60 hidden sm:table-cell text-center">{player.unique_voters || 0}</td>
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
