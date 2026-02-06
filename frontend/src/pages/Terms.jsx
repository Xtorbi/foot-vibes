import { Link } from 'react-router-dom';

function Terms() {
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
          <h1 className="font-heading text-4xl text-white mb-8 tracking-wide">Conditions Générales d'Utilisation</h1>

          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/80">
            <p className="text-white/60 text-sm">Dernière mise à jour : 6 février 2026</p>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Objet</h2>
              <p>
                Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation du site Foot Vibes,
                une plateforme de vote communautaire permettant aux utilisateurs d'exprimer leur opinion sur les joueurs de Ligue 1.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Accès au service</h2>
              <p>
                L'accès à Foot Vibes est gratuit et ouvert à tous. Aucune inscription n'est requise pour voter.
                Nous nous réservons le droit de modifier, suspendre ou interrompre le service à tout moment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Fonctionnement des votes</h2>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Chaque utilisateur peut voter pour les joueurs présentés (positif, neutre, négatif)</li>
                <li>Les votes sont anonymes et contribuent au classement communautaire</li>
                <li>Un système anti-spam limite le nombre de votes par utilisateur</li>
                <li>Les votes frauduleux ou automatisés sont interdits</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Comportement des utilisateurs</h2>
              <p>En utilisant Foot Vibes, vous vous engagez à :</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Ne pas tenter de manipuler les votes ou le classement</li>
                <li>Ne pas utiliser de bots, scripts ou outils automatisés</li>
                <li>Ne pas contourner les mesures de sécurité du site</li>
                <li>Respecter les autres utilisateurs et les joueurs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Propriété intellectuelle</h2>
              <p>
                Le site Foot Vibes, son design, son logo et son contenu sont protégés par le droit d'auteur.
                Les photos des joueurs et logos des clubs appartiennent à leurs propriétaires respectifs
                et sont utilisés à des fins informatives.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. Limitation de responsabilité</h2>
              <p>
                Foot Vibes est un site de divertissement. Les classements reflètent uniquement l'opinion
                des utilisateurs et n'ont aucune valeur officielle.
              </p>
              <p className="mt-3">
                Nous ne garantissons pas la disponibilité continue du service ni l'exactitude des données affichées
                (statistiques des joueurs, photos, etc.).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">7. Publicité</h2>
              <p>
                Le site peut afficher des publicités via Google AdSense. Ces publicités nous permettent
                de maintenir le service gratuit.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">8. Modification des CGU</h2>
              <p>
                Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications
                prennent effet dès leur publication sur le site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">9. Droit applicable</h2>
              <p>
                Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux
                français seront seuls compétents.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">10. Contact</h2>
              <p>
                Pour toute question concernant ces CGU, contactez-nous via
                notre <Link to="/contact" className="text-fv-green hover:underline">page de contact</Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Terms;
