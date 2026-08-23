import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Sprout,
  Flame,
  Heart,
  MapPin,
  Coffee,
  Leaf,
  Gauge,
  Award,
  Users,
  Medal,
  TreePine,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Notre Histoire — Café de Papá',
  description:
    "L'histoire d'Amélia Flores et de son père Walter Flores, fondateur de la Finca La Campiña au Pérou. Du champ familial jusqu'à la brûlerie parisienne : un pont direct, sans intermédiaire.",
  openGraph: {
    title: 'Notre Histoire — Café de Papá',
    description: "De la Finca La Campiña au Pérou à la brûlerie du 18e arrondissement de Paris.",
  },
};

const STORY_IMAGE =
  'https://images.pexels.com/photos/36040333/pexels-photo-36040333.jpeg?auto=compress&cs=tinysrgb&w=1200';
const PLANTATION_IMAGE =
  'https://images.pexels.com/photos/38213574/pexels-photo-38213574.jpeg?auto=compress&cs=tinysrgb&w=1200';

const TIMELINE = [
  {
    icon: Sprout,
    year: 'Les origines',
    title: 'Walter Flores & la Finca La Campiña',
    text: "Au cœur de la vallée verdoyante de Chanchamayo, au Pérou, Walter Flores fonde et exploite la Finca La Campiña. Sur ces hauteurs andines, il cultive le café avec une exigence absolue : des cerises cueillies à la main, à pleine maturité, sur des terroirs d'altitude.",
  },
  {
    icon: Heart,
    year: "L'hommage",
    title: 'Pourquoi « Café de Papá »',
    text: "« Papá », c'est « Papa » en espagnol. Amélia Flores, sa fille, a choisi ce nom comme un vibrant hommage à son père. En venant en France, elle s'est promis de faire rayonner la récolte familiale et de créer un pont direct, sans intermédiaire, entre le champ de son père et la tasse parisienne.",
  },
  {
    icon: Flame,
    year: 'Paris 18e',
    title: 'La brûlerie de la Rue du Poteau',
    text: "Amélia installe sa première brûlerie au 1 Rue du Poteau, dans le 18e arrondissement de Paris. Là, chaque lot est torréfié lentement, en petites quantités, puis expédié frais sous 4 jours ouvrés. La mouture se fait à la commande — jamais à l'avance.",
  },
];

const EXPERTISE_STATS = [
  {
    icon: Coffee,
    value: '30',
    label: 'Grands Crus du Monde',
    sub: '100% Purs Arabicas, sélectionnés et fraîchement torréfiés à la commande',
  },
  {
    icon: Leaf,
    value: '60',
    label: "Thés d'Exception",
    sub: 'Thés bio et grands parfums : blancs, rouges, noirs, verts',
  },
  {
    icon: Sprout,
    value: '1 750 m',
    label: "Cru Familial d'Altitude",
    sub: 'Finca La Campiña, Chanchamayo, Pérou',
  },
  {
    icon: Gauge,
    value: '4 jours',
    label: 'Torréfaction Artisanale',
    sub: 'Préparation et mouture fraîche à la commande sous 4 jours ouvrés',
  },
];

const CERTIFICATIONS = [
  {
    icon: Award,
    title: 'Diplôme Café Vert — SCAE',
    sub: 'Speciality Coffee Association of Europe',
  },
  {
    icon: Coffee,
    title: 'Membre du Comité Français du Café',
    sub: 'Reconnaissance professionnelle nationale',
  },
  {
    icon: Users,
    title: 'Membre du Réseau des Baristas de France',
    sub: 'Communauté d\'excellence et de savoir-faire',
  },
  {
    icon: TreePine,
    title: 'Terroir Sanchirio El Palomar',
    sub: 'Chanchamayo — Le Café d\'Honneur du Pérou',
  },
];

export default function NotreHistoirePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative flex h-[55vh] min-h-[420px] items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={STORY_IMAGE}
          alt="Récolte manuelle des cerises de café au Pérou"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/60 to-ink-950/70" />
        <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-400">
            Notre Histoire
          </p>
          <h1 className="mt-4 font-serif text-4xl font-medium leading-tight text-ink-50 sm:text-5xl">
            Du champ de son père
            <br />
            <span className="italic text-accent-400">jusqu'à votre tasse parisienne</span>
          </h1>
        </div>
      </section>

      {/* Manifeste */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
        <figure className="relative">
          <div className="absolute -left-2 -top-6 font-serif text-6xl text-accent-300/40" aria-hidden="true">
            «
          </div>
          <blockquote className="relative">
            <p className="font-serif text-xl font-medium leading-relaxed text-ink-800 sm:text-2xl">
              Le Café de Papá est bien plus qu'un simple café. C'est un lieu où la passion se mêle
              à l'engagement pour la qualité et l'authenticité. Fondé en hommage à Walter Flores,
              notre café puise ses racines au cœur de notre exploitation familiale Finca La Campiña,
              dans la province de Chanchamayo au Pérou.
            </p>
          </blockquote>
          <figcaption className="mt-4 text-sm font-medium text-accent-600">
            — Amélia Flores, fondatrice de Café de Papá
          </figcaption>
        </figure>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:pb-24">
        <div className="space-y-6 text-base leading-relaxed text-ink-600">
          <p>
            Au cœur de la vallée verdoyante de <strong className="text-ink-800">Chanchamayo</strong>,
            au Pérou, <strong className="text-ink-800">Walter Flores</strong> fonde et exploite la{' '}
            <strong className="text-ink-800">Finca La Campiña</strong>. Sur ces hauteurs andines,
            à 1 750 mètres d&apos;altitude, le climat et les sols volcaniques offrent des conditions
            idéales pour produire un café d&apos;exception, 100% Arabica.
          </p>
          <p>
            Chaque cerise y est cueillie à la main, au moment exact où elle atteint sa pleine
            maturité. Ce savoir-faire, transmis de génération en génération, est au cœur de tout
            ce que nous faisons. Aujourd&apos;hui, sa fille{' '}
            <strong className="text-ink-800">Amélia Flores</strong> veille sur la plantation
            familiale avec la même passion que son père.
          </p>
          <p>
            « <strong className="text-ink-800">Papá</strong> », c&apos;est « Papa » en espagnol.
            Amélia a choisi ce nom comme un vibrant hommage à Walter. En venant en France, elle
            s&apos;est promis de faire rayonner la récolte familiale et de créer un pont direct,
            sans intermédiaire, entre le champ de son père et la tasse parisienne.
          </p>
          <p>
            De là, les grains voyagent jusqu&apos;à Paris, dans le 18e arrondissement. Dans
            notre atelier de la Rue du Poteau, nous torréfions chaque lot lentement, en petites
            quantités, pour révéler des arômes uniques — du chocolat noir du Pérou aux notes
            florales de jasmin d&apos;Éthiopie. Chaque paquet est torréfié à la commande,
            puis expédié frais sous 4 jours ouvrés.
          </p>
          <p>
            C&apos;est ça, Café de Papá : pas d&apos;intermédiaire, pas de compromis. Juste
            le fruit d&apos;un travail de famille, du producteur au torréfacteur.
          </p>
        </div>
      </section>

      {/* Engagement Torréfaction & Fraîcheur */}
      <section className="bg-ink-900 py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-ink-800 text-accent-400">
            <Flame size={28} strokeWidth={1.5} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-400">
            Engagement Torréfaction &amp; Fraîcheur
          </p>
          <p className="mt-6 font-serif text-xl font-medium leading-relaxed text-ink-100 sm:text-2xl">
            Nous vous offrons bien plus qu'une simple tasse : une expérience gustative
            d'exception, méticuleusement façonnée à partir des grains les plus nobles.
            Torréfaction précise à Paris 18e, fraîcheur garantie sous 4 jours ouvrés et
            amour du terroir péruvien à chaque gorgée.
          </p>
        </div>
      </section>

      {/* Expertise stats */}
      <section className="bg-ink-100/60 py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-600">
              L'expertise d'Amélia
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium text-ink-900 sm:text-4xl">
              Les chiffres clés de la maison
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {EXPERTISE_STATS.map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-2xl border border-ink-200 bg-white p-6 text-center shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-900 text-accent-400">
                  <stat.icon size={22} strokeWidth={1.5} />
                </div>
                <p className="mt-4 font-serif text-3xl font-medium text-ink-900">{stat.value}</p>
                <p className="mt-1 text-sm font-semibold text-ink-800">{stat.label}</p>
                <p className="mt-2 text-xs leading-relaxed text-ink-500">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-600">
            Distinctions professionnelles
          </p>
          <h2 className="mt-3 font-serif text-3xl font-medium text-ink-900 sm:text-4xl">
            Les certifications d'Amélia Flores
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {CERTIFICATIONS.map((cert, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl border border-ink-200 bg-white p-5 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                <cert.icon size={22} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-medium text-ink-900">{cert.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">{cert.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-ink-100/60 py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center font-serif text-3xl font-medium text-ink-900 sm:text-4xl">
            Une histoire de famille
          </h2>
          <div className="space-y-10">
            {TIMELINE.map((item, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink-900 text-accent-400">
                    <item.icon size={24} strokeWidth={1.5} />
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div className="mt-2 h-full w-px flex-1 bg-ink-300" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="font-serif text-lg font-medium text-accent-600">{item.year}</p>
                  <h3 className="mt-1 font-serif text-xl font-medium text-ink-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plantation image */}
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PLANTATION_IMAGE}
          alt="Plantation de café sur les hauteurs du Pérou"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-ink-950/50">
          <div className="text-center">
            <MapPin size={24} className="mx-auto text-accent-400" />
            <p className="mt-3 font-serif text-2xl font-medium text-ink-50">
              Finca La Campiña, Chanchamayo, Pérou
            </p>
            <p className="mt-1 text-sm text-ink-200">1 750 m d&apos;altitude · 100% Arabica</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:py-24">
        <h2 className="font-serif text-3xl font-medium text-ink-900 sm:text-4xl">
          Goûtez à notre histoire
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-600">
          Chaque tasse raconte le voyage de nos grains, du champ de Walter Flores au Pérou
          jusqu&apos;à notre brûlerie parisienne.
        </p>
        <Link
          href="/cafes"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink-900 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-ink-50 transition-colors hover:bg-ink-800"
        >
          Découvrir nos cafés
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
