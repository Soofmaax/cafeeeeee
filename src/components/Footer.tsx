import Link from 'next/link';
import { Award, Flame, Users, TreePine } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Nos Cafés', href: '/cafes' },
  { label: 'Nos Thés', href: '/thes' },
  { label: 'Accessoires', href: '/accessoires' },
  { label: 'Notre Histoire', href: '/notre-histoire' },
  { label: 'Mon compte', href: '/account' },
];

const LEGAL_LINKS = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'CGV', href: '/cgv' },
  { label: 'Confidentialité', href: '/politique-de-confidentialite' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

const CERTIFICATIONS = [
  { icon: Award, label: 'Diplôme Café Vert — SCAE' },
  { icon: Flame, label: 'Comité Français du Café' },
  { icon: Users, label: 'Réseau des Baristas de France' },
  { icon: TreePine, label: "Café d'Honneur du Pérou" },
];

export default function Footer() {
  return (
    <footer className="bg-ink-950 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <p className="font-serif text-2xl font-semibold tracking-wide text-ink-50">
            CAFÉ DE PAPÁ
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-400">
            Café de spécialité issu de la Finca La Campiña au Pérou,
            torréfié à Paris par une histoire de famille.
          </p>
          <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ink-500">
            {CERTIFICATIONS.map((cert, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <cert.icon size={14} className="text-accent-500" />
                {cert.label}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-ink-400 transition-colors hover:text-accent-400"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium text-ink-500 transition-colors hover:text-accent-400"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-10 h-px w-full max-w-xs bg-ink-800" />
          <p className="mt-6 text-xs text-ink-600">
            © 2026 Café de Papá — Exploité par FINCA LA CAMPINA SARL (RCS Paris 535 001 069). Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
