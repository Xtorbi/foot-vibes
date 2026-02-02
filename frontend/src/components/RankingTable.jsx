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
          <tr className="border-b border-white/10 text-white/40 text-sm">
            <th className="py-3 px-3 w-14">#</th>
            <th className="py-3 px-3">Joueur</th>
            <th className="py-3 px-3 hidden sm:table-cell">Club</th>
            <th className="py-3 px-3 hidden md:table-cell">Poste</th>
            <th className="py-3 px-3 text-right">Score</th>
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
              <td className="py-3 px-3">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${getRankStyle(player.rank)}`}>
                  {player.rank}
                </span>
              </td>
              <td className="py-3 px-3 font-semibold text-white">{player.name}</td>
              <td className="py-3 px-3 text-white/50 hidden sm:table-cell">{player.club}</td>
              <td className="py-3 px-3 text-white/50 hidden md:table-cell">{player.position}</td>
              <td className="py-3 px-3 text-right font-bold">
                <span className={`inline-block px-2 py-0.5 rounded ${
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
