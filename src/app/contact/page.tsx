import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact — Café de Papá',
  description:
    "Contactez Café de Papá (FINCA LA CAMPINA SARL) : e-mail, téléphone et adresse de notre brûlerie au 1 Rue du Poteau, 75018 Paris.",
};

const CONTACT_ITEMS = [
  {
    icon: Mail,
    label: 'E-mail',
    value: 'cafefincalacampina@outlook.fr',
    href: 'mailto:cafefincalacampina@outlook.fr',
  },
  {
    icon: Phone,
    label: 'Téléphone',
    value: '01 46 06 51 75 / 06 99 76 12 76',
  },
  {
    icon: MapPin,
    label: 'Adresse',
    value: '1 Rue du Poteau, 75018 Paris, France',
  },
  {
    icon: Clock,
    label: 'Horaires',
    value: 'Mar - Ven : 10h-13h & 15h30-20h | Sam : 10h-14h & 15h-19h30 | Dim : 10h-13h30 (Fermé le Lundi)',
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
      >
        <ArrowLeft size={16} />
        Retour à la boutique
      </Link>

      <h1 className="font-serif text-3xl font-medium text-ink-900 sm:text-4xl">Contact</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-500">
        Une question sur nos produits, une commande ou un retrait Click &amp; Collect ?
        Nous sommes à votre écoute.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {CONTACT_ITEMS.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-4 rounded-xl border border-ink-200 bg-white p-5 shadow-sm"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink-900 text-accent-400">
              <item.icon size={20} strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent-600">
                {item.label}
              </p>
              {item.href ? (
                <a
                  href={item.href}
                  className="mt-1 block text-sm text-ink-700 underline underline-offset-2 hover:text-ink-900"
                >
                  {item.value}
                </a>
              ) : (
                <p className="mt-1 text-sm leading-relaxed text-ink-700">{item.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl bg-ink-100/60 p-6">
        <h2 className="font-serif text-lg font-medium text-ink-900">Nos boutiques</h2>
        <ul className="mt-4 space-y-3 text-sm text-ink-600">
          <li>
            <strong className="text-ink-800">Brûlerie historique (Click &amp; Collect)</strong>
            <br />
            1 Rue du Poteau, 75018 Paris — Tél : 01 46 06 51 75 / 06 99 76 12 76
          </li>
          <li>
            <strong className="text-ink-800">Boutique Caulaincourt</strong>
            <br />
            116 Rue Caulaincourt, 75018 Paris — Tél : 09 81 10 49 80
          </li>
          <li>
            <strong className="text-ink-800">Boutique Courbevoie</strong>
            <br />
            12 Rue Baudin, 92400 Courbevoie — Tél : 06 99 76 12 76
          </li>
        </ul>
      </div>

      <div className="mt-6 text-center text-xs text-ink-500">
        Exploité par FINCA LA CAMPINA SARL — RCS Paris 535 001 069 — TVA : FR91535001069
      </div>
    </div>
  );
}
