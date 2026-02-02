function PlayerCardSkeleton() {
  return (
    <div className="w-full max-w-[300px] mx-auto animate-pulse">
      <div className="bg-fv-navy-light rounded-2xl overflow-hidden shadow-material-2">
        {/* Badge position */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-20 h-4 bg-white/10 rounded-full" />
        </div>

        {/* Photo + Nom */}
        <div className="relative flex flex-col items-center px-4 pb-3">
          <div className="w-24 h-24 rounded-full bg-white/10 mb-2" />
          <div className="w-16 h-3 bg-white/10 rounded mb-1" />
          <div className="w-28 h-5 bg-white/10 rounded" />
        </div>

        {/* Club */}
        <div className="py-2 border-t border-fv-navy flex justify-center">
          <div className="w-24 h-3 bg-white/10 rounded" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 border-t border-fv-navy">
          <div className="py-2 px-3 border-r border-b border-fv-navy">
            <div className="w-16 h-3 bg-white/10 rounded" />
          </div>
          <div className="py-2 px-3 border-b border-fv-navy">
            <div className="w-14 h-3 bg-white/10 rounded" />
          </div>
          <div className="py-2 px-3 border-r border-fv-navy">
            <div className="w-12 h-3 bg-white/10 rounded" />
          </div>
          <div className="py-2 px-3">
            <div className="w-20 h-3 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerCardSkeleton;
