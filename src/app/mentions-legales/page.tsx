import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  alternates: { canonical: '/mentions-legales' },
  title: 'Mentions Légales — Café de Papá',
  description:
    "Mentions légales de Café de Papá, exploité par FINCA LA CAMPINA SARL : éditeur, hébergement, coordonnées et contact.",
};

export default function LegalMentionsPage() {
  const hostName = process.env.LEGAL_HOST_NAME || 'Hébergeur de la prévisualisation';
  const hostAddress = process.env.LEGAL_HOST_ADDRESS || 'Adresse à renseigner avant la mise en production';

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
      >
        <ArrowLeft size={16} />
        Retour à la boutique
      </Link>

      <h1 className="font-serif text-3xl font-medium text-ink-900 sm:text-4xl">Mentions Légales</h1>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink-600">
        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Éditeur du site</h2>
          <dl className="mt-3 space-y-2">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="font-semibold text-ink-800 sm:w-56 shrink-0">Raison sociale</dt>
              <dd>FINCA LA CAMPINA (SARL au capital de 7 500,00 €)</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="font-semibold text-ink-800 sm:w-56 shrink-0">Enseigne / Nom commercial</dt>
              <dd>Café de Papá</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="font-semibold text-ink-800 sm:w-56 shrink-0">Gérante &amp; Directrice de publication</dt>
              <dd>Luz Amélia FLORES LEON</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="font-semibold text-ink-800 sm:w-56 shrink-0">Siège social</dt>
              <dd>1 Rue du Poteau, 75018 Paris, France</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="font-semibold text-ink-800 sm:w-56 shrink-0">SIREN</dt>
              <dd>535 001 069</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="font-semibold text-ink-800 sm:w-56 shrink-0">SIRET</dt>
              <dd>535 001 069 00025</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="font-semibold text-ink-800 sm:w-56 shrink-0">RCS</dt>
              <dd>Inscrite au Registre du Commerce et des Sociétés de Paris</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="font-semibold text-ink-800 sm:w-56 shrink-0">N° de TVA intracommunautaire</dt>
              <dd>FR91535001069</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="font-semibold text-ink-800 sm:w-56 shrink-0">Code APE / NAF</dt>
              <dd>4637Z (Commerce de café, thé, cacao et épices)</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="font-semibold text-ink-800 sm:w-56 shrink-0">Contact</dt>
              <dd>
                <a href="mailto:admin.cafedepapa@gmail.com" className="text-ink-900 underline underline-offset-2">admin.cafedepapa@gmail.com</a>
                <br />
                Tél : 01 46 06 51 75 / 06 99 76 12 76
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Hébergement</h2>
          <p className="mt-2">
            Le site est hébergé par {hostName}, {hostAddress}.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Propriété intellectuelle</h2>
          <p className="mt-2">
            L&apos;ensemble des contenus présents sur ce site (textes, images, logos, marques) est la
            propriété de FINCA LA CAMPINA SARL / Café de Papá, sauf mention contraire. Toute
            reproduction, représentation, modification ou adaptation, totale ou partielle, est
            interdite sans autorisation écrite préalable.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Nos boutiques</h2>
          <p className="mt-2">
            <strong>Brûlerie historique (Click &amp; Collect)</strong><br />
            1 Rue du Poteau, 75018 Paris — Tél : 01 46 06 51 75 / 06 99 76 12 76
          </p>
          <p className="mt-2">
            <strong>Boutique Caulaincourt</strong><br />
            116 Rue Caulaincourt, 75018 Paris — Tél : 09 81 10 49 80
          </p>
          <p className="mt-2">
            <strong>Boutique Courbevoie</strong><br />
            12 Rue Baudin, 92400 Courbevoie — Tél : 06 99 76 12 76
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Contact</h2>
          <p className="mt-2">
            Pour toute question relative au site ou à nos produits, vous pouvez nous contacter à
            l&apos;adresse :{' '}
            <a href="mailto:admin.cafedepapa@gmail.com" className="text-ink-900 underline underline-offset-2">
              admin.cafedepapa@gmail.com
            </a>{' '}
            ou par téléphone au 01 46 06 51 75 / 06 99 76 12 76.
          </p>
        </section>
      </div>
    </div>
  );
}
