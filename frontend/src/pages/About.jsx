import { Link } from 'react-router-dom';

function About() {
  return (
    <main className="min-h-screen bg-vibes py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </Link>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h1 className="font-heading text-4xl text-white mb-8 tracking-wide">À propos de Topflop</h1>

          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/80">

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">Notre mission</h2>
              <p>
                Topflop est le baromètre communautaire des joueurs de Ligue 1. Exprimez votre ressenti
                sur les joueurs : pas de statistiques froides, pas d'algorithmes complexes,
                juste l'émotion pure des supporters.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">Comment ça marche ?</h2>
              <div className="grid gap-4 mt-4">
                <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4">
                  <div className="w-10 h-10 bg-fv-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-fv-green font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Découvrez un joueur</p>
                    <p className="text-white/60 text-sm">Un joueur de Ligue 1 vous est présenté avec ses stats</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4">
                  <div className="w-10 h-10 bg-fv-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-fv-green font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Votez selon votre ressenti</p>
                    <p className="text-white/60 text-sm">Pouce haut, neutre ou pouce bas - exprimez votre avis</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4">
                  <div className="w-10 h-10 bg-fv-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-fv-green font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Consultez le classement</p>
                    <p className="text-white/60 text-sm">Découvrez quels joueurs sont les plus cotés par la communauté</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">Les données</h2>
              <p>
                Notre base de données couvre les <strong className="text-white">18 clubs de Ligue 1</strong> pour
                la saison 2025-2026, avec plus de <strong className="text-white">480 joueurs</strong> et leurs
                statistiques à jour (matchs, buts, passes décisives).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">Pourquoi Topflop ?</h2>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong className="text-white">Simple</strong> : Un swipe ou un clic, c'est tout</li>
                <li><strong className="text-white">Fun</strong> : Pas de prise de tête, juste du feeling</li>
                <li><strong className="text-white">Communautaire</strong> : Le classement reflète l'avis de tous</li>
                <li><strong className="text-white">Gratuit</strong> : 100% gratuit, pour toujours</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">Contact</h2>
              <p>
                Une question, une suggestion, un bug à signaler ?
                Rendez-vous sur notre <Link to="/contact" className="text-fv-green hover:underline">page de contact</Link>.
              </p>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}

export default About;
