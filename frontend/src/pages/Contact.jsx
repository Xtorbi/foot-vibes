import { useState } from 'react';
import { Link } from 'react-router-dom';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pour l'instant, on simule l'envoi (pas de backend email configuré)
    // En prod, on pourrait utiliser EmailJS, Formspree, ou un endpoint backend
    console.log('Contact form:', formData);
    setSubmitted(true);
  };

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
          <h1 className="font-heading text-4xl text-white mb-8 tracking-wide">Contact</h1>

          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-fv-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-fv-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">Message envoyé !</h2>
              <p className="text-white/60 mb-8">Merci de nous avoir contactés. Nous reviendrons vers vous rapidement.</p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-fv-green text-fv-navy font-bold px-6 py-3 rounded-full hover:bg-fv-green-dark transition-colors"
              >
                Retour à l'accueil
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              <p className="text-white/80">
                Une question, une suggestion ou un problème à signaler ? Remplissez le formulaire ci-dessous
                et nous vous répondrons dans les plus brefs délais.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-white/80 text-sm font-medium mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white
                                 placeholder-white/40 focus:outline-none focus:border-fv-green focus:ring-1 focus:ring-fv-green"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white
                                 placeholder-white/40 focus:outline-none focus:border-fv-green focus:ring-1 focus:ring-fv-green"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-white/80 text-sm font-medium mb-2">
                    Sujet
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white
                               focus:outline-none focus:border-fv-green focus:ring-1 focus:ring-fv-green"
                  >
                    <option value="" className="bg-fv-navy">Choisir un sujet</option>
                    <option value="question" className="bg-fv-navy">Question générale</option>
                    <option value="bug" className="bg-fv-navy">Signaler un bug</option>
                    <option value="suggestion" className="bg-fv-navy">Suggestion d'amélioration</option>
                    <option value="data" className="bg-fv-navy">Demande RGPD (données personnelles)</option>
                    <option value="other" className="bg-fv-navy">Autre</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-white/80 text-sm font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white
                               placeholder-white/40 focus:outline-none focus:border-fv-green focus:ring-1 focus:ring-fv-green resize-none"
                    placeholder="Décrivez votre demande..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-fv-green text-fv-navy font-bold px-8 py-3 rounded-full
                             hover:bg-fv-green-dark transition-colors"
                >
                  Envoyer le message
                </button>
              </form>

              <div className="pt-8 border-t border-white/10">
                <p className="text-white/60 text-sm">
                  Vous pouvez également nous contacter par email :
                  <a href="mailto:contact@topflop.fr" className="text-fv-green hover:underline ml-1">
                    contact@topflop.fr
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Contact;
