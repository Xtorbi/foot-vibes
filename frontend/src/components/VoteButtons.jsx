import { useState } from 'react';

function VoteButtons({ onVote, disabled }) {
  const [clickedButton, setClickedButton] = useState(null);

  const handleClick = (type) => {
    setClickedButton(type);
    onVote(type);
    setTimeout(() => setClickedButton(null), 200);
  };

  const baseClasses = `rounded-full flex items-center justify-center
                       shadow-lg transition-all duration-200
                       disabled:opacity-50 disabled:hover:scale-100
                       hover:shadow-2xl hover:scale-110 active:scale-95`;

  return (
    <div className="flex justify-center items-center gap-6 mt-6">
      {/* Downvote - Pouce bas */}
      <button
        onClick={() => handleClick('down')}
        disabled={disabled}
        className={`w-14 h-14 ${baseClasses}
                   bg-white/10 border-2 border-white/20 text-white/70
                   hover:bg-red-500/20 hover:border-red-400 hover:text-red-400
                   ${clickedButton === 'down' ? 'animate-vote-bounce bg-red-500/30 border-red-400 text-red-400' : ''}`}
        aria-label="Je n'aime pas"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 4h-2c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h2V4zM2.17 11.12c-.11.25-.17.52-.17.8V13c0 1.1.9 2 2 2h5.5l-.92 4.65c-.05.22-.02.46.08.66.23.45.52.86.88 1.22L10 22l6.41-6.41c.38-.38.59-.89.59-1.42V6.34C17 5.05 15.95 4 14.66 4H6.55c-.7 0-1.36.37-1.72.97l-2.66 6.15z"/>
        </svg>
      </button>

      {/* Neutral - Skip */}
      <button
        onClick={() => handleClick('neutral')}
        disabled={disabled}
        className={`w-11 h-11 ${baseClasses}
                   bg-white/5 border-2 border-white/10 text-white/40
                   hover:bg-white/10 hover:border-white/30 hover:text-white/60
                   ${clickedButton === 'neutral' ? 'animate-vote-bounce' : ''}`}
        aria-label="Passer"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>

      {/* Upvote - Pouce haut */}
      <button
        onClick={() => handleClick('up')}
        disabled={disabled}
        className={`w-14 h-14 ${baseClasses}
                   bg-fv-green text-fv-navy
                   hover:bg-fv-green-dark
                   ${clickedButton === 'up' ? 'animate-vote-bounce' : ''}`}
        aria-label="J'aime"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"/>
        </svg>
      </button>
    </div>
  );
}

export default VoteButtons;
