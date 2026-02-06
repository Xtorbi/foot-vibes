import { Link } from 'react-router-dom';

function Privacy() {
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
          <h1 className="font-heading text-4xl text-white mb-8 tracking-wide">Politique de confidentialité</h1>

          <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/80">
            <p className="text-white/60 text-sm">Dernière mise à jour : 6 février 2026</p>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Introduction</h2>
              <p>
                Foot Vibes est une application web de vote communautaire pour les joueurs de Ligue 1.
                Nous nous engageons à protéger votre vie privée et à être transparents sur les données que nous collectons.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Données collectées</h2>
              <p>Nous collectons les données suivantes :</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Adresse IP</strong> : utilisée uniquement pour limiter les abus (anti-spam) et compter les votants uniques. Non partagée avec des tiers.</li>
                <li><strong>Données de vote</strong> : vos votes (positif/neutre/négatif) sont enregistrés de manière anonyme.</li>
                <li><strong>localStorage</strong> : nous stockons localement sur votre appareil votre compteur de votes personnel et vos préférences.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Cookies et publicités</h2>
              <p>
                Nous utilisons Google AdSense pour afficher des publicités. Google peut utiliser des cookies pour personnaliser
                les annonces en fonction de vos centres d'intérêt. Vous pouvez gérer vos préférences publicitaires sur
                <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-fv-green hover:underline ml-1">
                  adssettings.google.com
                </a>.
              </p>
              <p className="mt-3">
                Cookies utilisés :
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Cookies Google AdSense</strong> : pour la diffusion de publicités</li>
                <li><strong>localStorage</strong> : pour vos préférences locales (non transmis à nos serveurs)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Partage des données</h2>
              <p>
                Nous ne vendons ni ne partageons vos données personnelles avec des tiers, à l'exception de :
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Google AdSense (publicités)</li>
                <li>Obligations légales si requises par la loi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Conservation des données</h2>
              <p>
                Les votes sont conservés pendant la durée de la saison de football en cours.
                Les adresses IP sont conservées uniquement pour le contrôle anti-spam et peuvent être supprimées sur demande.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. Vos droits (RGPD)</h2>
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Droit d'accès à vos données</li>
                <li>Droit de rectification</li>
                <li>Droit à l'effacement</li>
                <li>Droit à la portabilité</li>
                <li>Droit d'opposition</li>
              </ul>
              <p className="mt-3">
                Pour exercer ces droits, contactez-nous via notre <Link to="/contact" className="text-fv-green hover:underline">page de contact</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mt-8 mb-4">7. Contact</h2>
              <p>
                Pour toute question concernant cette politique de confidentialité, vous pouvez nous contacter via
                notre <Link to="/contact" className="text-fv-green hover:underline">page de contact</Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Privacy;
