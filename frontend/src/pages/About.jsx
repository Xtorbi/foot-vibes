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
              <p className="mt-3">
                Notre objectif est simple : créer un espace où chaque fan de football peut exprimer
                son opinion sur les joueurs qu'il voit évoluer chaque week-end. Que vous soyez
                supporter du PSG, de l'OM, de Lyon ou d'un club moins médiatisé, votre voix compte autant.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">L'histoire de Topflop</h2>
              <p>
                Topflop est né d'un constat simple : les classements traditionnels de joueurs sont souvent
                basés uniquement sur les statistiques brutes (buts, passes, tacles). Mais le football,
                c'est bien plus que des chiffres !
              </p>
              <p className="mt-3">
                Un joueur peut avoir des stats moyennes mais être décisif dans les moments clés.
                Un autre peut empiler les buts mais disparaître dans les grands matchs. Seuls les
                supporters qui regardent les matchs peuvent vraiment juger de l'impact d'un joueur.
              </p>
              <p className="mt-3">
                C'est pourquoi nous avons créé Topflop en 2026 : une plateforme où c'est la communauté
                qui décide. Pas de jury d'experts, pas d'algorithme opaque. Juste l'avis collectif
                des passionnés de Ligue 1.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">Comment ça marche ?</h2>
              <p className="mb-4">
                Le principe est volontairement simple pour que voter prenne quelques secondes :
              </p>
              <div className="grid gap-4 mt-4">
                <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4">
                  <div className="w-10 h-10 bg-fv-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-fv-green font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Découvrez un joueur</p>
                    <p className="text-white/60 text-sm">Un joueur de Ligue 1 vous est présenté avec sa photo, son club et ses statistiques de la saison en cours</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4">
                  <div className="w-10 h-10 bg-fv-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-fv-green font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Votez selon votre ressenti</p>
                    <p className="text-white/60 text-sm">Pouce haut si vous appréciez le joueur, pouce bas si vous n'êtes pas convaincu, ou neutre si vous n'avez pas d'avis tranché</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 bg-white/5 rounded-xl p-4">
                  <div className="w-10 h-10 bg-fv-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-fv-green font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Consultez le classement</p>
                    <p className="text-white/60 text-sm">Découvrez quels joueurs sont les plus appréciés par la communauté, filtrez par club, poste ou période</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm">
                <strong className="text-white">Astuce mobile :</strong> Sur smartphone, vous pouvez aussi swiper la carte
                vers la droite (pouce haut), la gauche (pouce bas) ou le bas (neutre) pour voter encore plus rapidement !
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">Le système de score</h2>
              <p>
                Le classement Topflop est basé sur un système de points simple et transparent :
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong className="text-white">Pouce haut</strong> : +1 point</li>
                <li><strong className="text-white">Vote neutre</strong> : 0 point</li>
                <li><strong className="text-white">Pouce bas</strong> : -1 point</li>
              </ul>
              <p className="mt-3">
                Le score d'un joueur est la somme de tous les votes reçus. Un joueur très apprécié
                aura un score positif élevé, tandis qu'un joueur controversé pourrait avoir un score
                proche de zéro (autant de votes positifs que négatifs).
              </p>
              <p className="mt-3">
                Pour apparaître au classement, un joueur doit avoir reçu au moins un vote. Cela évite
                d'afficher des joueurs que personne n'a encore évalués.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">Les données</h2>
              <p>
                Notre base de données couvre les <strong className="text-white">18 clubs de Ligue 1</strong> pour
                la saison 2025-2026, avec plus de <strong className="text-white">480 joueurs</strong> et leurs
                statistiques à jour.
              </p>
              <p className="mt-3">
                <strong className="text-white">Statistiques disponibles :</strong>
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Nombre de matchs joués</li>
                <li>Buts marqués</li>
                <li>Passes décisives</li>
                <li>Pour les gardiens : clean sheets et arrêts</li>
              </ul>
              <p className="mt-3">
                Les données sont mises à jour régulièrement pour refléter les dernières performances.
                Après chaque journée de Ligue 1, les joueurs ayant récemment joué sont prioritaires
                dans l'affichage pour que vous puissiez voter sur des performances fraîches.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">Pourquoi Topflop ?</h2>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong className="text-white">Simple</strong> : Un swipe ou un clic, c'est tout. Pas de compte à créer, pas de formulaire à remplir</li>
                <li><strong className="text-white">Fun</strong> : Pas de prise de tête, juste du feeling. Votez selon vos émotions, pas selon les stats</li>
                <li><strong className="text-white">Communautaire</strong> : Le classement reflète l'avis de tous les participants, pas celui d'une poignée d'experts</li>
                <li><strong className="text-white">Gratuit</strong> : 100% gratuit, sans abonnement ni fonctionnalités payantes</li>
                <li><strong className="text-white">Respectueux</strong> : Nous ne collectons que le minimum de données nécessaires au fonctionnement</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">Questions fréquentes (FAQ)</h2>

              <div className="space-y-4 mt-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="font-semibold text-white">Puis-je voter plusieurs fois pour le même joueur ?</p>
                  <p className="text-white/60 text-sm mt-2">
                    Oui, vous pouvez voter plusieurs fois pour le même joueur au fil du temps.
                    Cela permet de refléter l'évolution de votre opinion après chaque match.
                    Cependant, un système anti-spam limite le nombre de votes par période.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <p className="font-semibold text-white">Pourquoi je vois souvent les mêmes joueurs ?</p>
                  <p className="text-white/60 text-sm mt-2">
                    Notre algorithme favorise les joueurs qui ont joué récemment (dans les dernières 24-48h)
                    pour que vos votes soient basés sur des performances fraîches. Les joueurs des grands
                    clubs apparaissent aussi plus souvent car ils sont généralement plus connus.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <p className="font-semibold text-white">Est-ce que je peux voter uniquement pour mon club ?</p>
                  <p className="text-white/60 text-sm mt-2">
                    Oui ! Sur la page d'accueil, vous pouvez sélectionner votre club favori pour ne voir
                    que ses joueurs. Le classement peut aussi être filtré par club.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <p className="font-semibold text-white">Comment est calculé le classement sur 7 jours ou 30 jours ?</p>
                  <p className="text-white/60 text-sm mt-2">
                    Les filtres de période ne comptent que les votes effectués dans la période sélectionnée.
                    C'est utile pour voir les joueurs "en forme" du moment, indépendamment de leur réputation globale.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <p className="font-semibold text-white">Mes votes sont-ils anonymes ?</p>
                  <p className="text-white/60 text-sm mt-2">
                    Oui. Nous ne stockons aucune information personnelle permettant de vous identifier.
                    Consultez notre <Link to="/confidentialite" className="text-fv-green hover:underline">politique de confidentialité</Link> pour plus de détails.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <p className="font-semibold text-white">Allez-vous ajouter d'autres championnats ?</p>
                  <p className="text-white/60 text-sm mt-2">
                    Pour l'instant, Topflop se concentre sur la Ligue 1 pour offrir la meilleure expérience possible.
                    Si le projet rencontre du succès, nous envisagerons d'ajouter d'autres championnats européens.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">Nos engagements</h2>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 bg-fv-green/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-fv-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-white">Respect de la vie privée</p>
                  <p className="text-white/60 text-xs mt-1">Aucun compte requis, données minimales</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 bg-fv-green/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-fv-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-white">Transparence totale</p>
                  <p className="text-white/60 text-xs mt-1">Algorithme simple et expliqué</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 bg-fv-green/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-fv-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-white">Communauté avant tout</p>
                  <p className="text-white/60 text-xs mt-1">Chaque vote compte également</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 bg-fv-green/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-fv-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-white">Toujours gratuit</p>
                  <p className="text-white/60 text-xs mt-1">Aucune fonctionnalité payante</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">Contact</h2>
              <p>
                Une question, une suggestion, un bug à signaler ? Nous sommes à l'écoute !
                Rendez-vous sur notre <Link to="/contact" className="text-fv-green hover:underline">page de contact</Link> pour
                nous envoyer un message. Nous répondons généralement sous 48 heures.
              </p>
              <p className="mt-3">
                Vous pouvez aussi consulter nos <Link to="/cgu" className="text-fv-green hover:underline">conditions d'utilisation</Link> et
                notre <Link to="/confidentialite" className="text-fv-green hover:underline">politique de confidentialité</Link>.
              </p>
            </section>

          </div>
        </div>

        {/* Boutons d'action en bas de page */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/vote"
            className="bg-fv-green text-fv-navy font-bold px-8 py-4 rounded-full text-center
                       hover:bg-fv-green-dark transition-all"
          >
            Commencer à voter
          </Link>
          <Link
            to="/classement"
            className="border-2 border-white/30 text-white font-bold px-8 py-4 rounded-full text-center
                       hover:border-white/60 transition-all"
          >
            Voir le classement
          </Link>
        </div>
      </div>
    </main>
  );
}

export default About;
