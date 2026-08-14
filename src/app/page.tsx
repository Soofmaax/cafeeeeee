import { supabase, type Product } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import StoresSection from '@/components/StoresSection';
import { OFFICIAL_STORES } from '@/data/stores';
import Link from 'next/link';
import { ArrowRight, Flame, Truck, Store, Clock, Sprout, Award, Users, Medal, TreePine } from 'lucide-react';
import Footer from '@/components/Footer';

const HERO_IMAGE = 'https://images.pexels.com/photos/38213574/pexels-photo-38213574.jpeg?auto=compress&cs=tinysrgb&w=1920';
const STORY_IMAGE = 'https://images.pexels.com/photos/36040333/pexels-photo-36040333.jpeg?auto=compress&cs=tinysrgb&w=1200';

const CAFE_IMAGE = 'https://images.pexels.com/photos/16556498/pexels-photo-16556498.jpeg?auto=compress&cs=tinysrgb&w=800';
const THE_IMAGE = 'https://images.pexels.com/photos/8329977/pexels-photo-8329977.jpeg?auto=compress&cs=tinysrgb&w=800';
const ACCESSOIRE_IMAGE = 'https://images.pexels.com/photos/12273081/pexels-photo-12273081.jpeg?auto=compress&cs=tinysrgb&w=800';

const CATEGORY_CARDS = [
  {
    href: '/cafes',
    title: 'Nos Cafés',
    subtitle: '100% Arabica · Torréfiés à Paris',
    image: CAFE_IMAGE,
    description: 'Des grands crus du Pérou, d\'Éthiopie et de Colombie, torréfiés lentement à la commande.',
  },
  {
    href: '/thes',
    title: 'Nos Thés',
    subtitle: 'Grands crus & créations maison',
    image: THE_IMAGE,
    description: 'Thés noirs, verts, jasmin et infusions fumées — sélectionnés avec la même exigence.',
  },
  {
    href: '/accessoires',
    title: 'Accessoires',
    subtitle: 'L\'art de la préparation',
    image: ACCESSOIRE_IMAGE,
    description: 'French Press, Moka italienne et pièces de rechange pour préparer le café parfait.',
  },
];

const REASSURANCE_ITEMS = [
  { icon: Flame, text: 'Torréfié à la commande sous 4 jours ouvrés' },
  { icon: Sprout, text: 'Direct producteur Pérou' },
  { icon: Store, text: 'Retrait Paris 18e ou Mondial Relay offert dès 45 €' },
];

const CERTIFICATIONS = [
  { icon: Award, title: 'Diplôme Café Vert — SCAE', sub: 'Speciality Coffee Association of Europe' },
  { icon: Flame, title: 'Membre du Comité Français du Café', sub: 'Reconnaissance professionnelle nationale' },
  { icon: Users, title: 'Membre du Réseau des Baristas de France', sub: 'Communauté d\'excellence et de savoir-faire' },
  { icon: TreePine, title: 'Terroir Sanchirio El Palomar', sub: 'Chanchamayo — Le Café d\'Honneur du Pérou' },
];

export default async function HomePage() {
  const { data: allProducts } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });

  const products = (allProducts ?? []) as Product[];
  const featured = products.slice(0, 4);

  const storesJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: OFFICIAL_STORES.map((store, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CafeOrCoffeeShop',
        name: store.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: store.address,
          postalCode: store.postalCode,
          addressLocality: store.city,
          addressCountry: 'FR',
        },
        telephone: store.phone,
        openingHours: store.hours,
        description: store.description,
        areaServed: store.cityArea,
      },
    })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storesJsonLd) }}
      />

      {/* Hero */}
      <section className="relative flex h-[85vh] min-h-[600px] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGE}
            alt="Plantation de café au Pérou"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/60 via-ink-950/40 to-ink-950/70" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.3em] text-accent-400 sm:text-sm">
            Café de spécialité • Pérou → Paris
          </p>
          <h1 className="animate-fade-up animate-delay-100 mt-6 font-serif text-4xl font-medium leading-tight text-ink-50 sm:text-5xl lg:text-6xl">
            De la Terre Péruvienne
            <br />
            <span className="italic text-accent-400">à la Tasse Parisienne.</span>
          </h1>
          <p className="animate-fade-up animate-delay-200 mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-100/80 sm:text-lg">
            Un café né au cœur du Pérou, cultivé avec patience par Walter Flores à la
            Finca La Campiña et porté jusqu&apos;à Paris par sa fille Amélia.
          </p>
          <div className="animate-fade-up animate-delay-300 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/cafes"
              className="inline-flex items-center gap-2 rounded-full bg-ink-50 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-ink-900 transition-all hover:bg-accent-400 hover:text-ink-950"
            >
              Découvrir nos cafés
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/notre-histoire"
              className="inline-flex items-center gap-2 rounded-full border border-ink-100/40 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-ink-50 transition-all hover:border-ink-50 hover:bg-ink-50/10"
            >
              Notre histoire
            </Link>
          </div>
        </div>
      </section>

      {/* Bandeau de rassurance */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ul className="flex flex-col items-center gap-4 py-6 text-center sm:flex-row sm:justify-around sm:gap-2 lg:gap-8">
            {REASSURANCE_ITEMS.map((item, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm font-medium text-ink-700">
                <item.icon size={18} className="shrink-0 text-accent-600" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Explorer nos univers */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-600">
            Explorer nos univers
          </p>
          <h2 className="mt-3 font-serif text-3xl font-medium text-ink-900 sm:text-4xl">
            Trois familles, une même exigence
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {CATEGORY_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-ink-100 focus-visible:outline-none"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-accent-400">
                    {card.subtitle}
                  </p>
                  <h3 className="mt-1 font-serif text-2xl font-medium text-ink-50">{card.title}</h3>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-sm leading-relaxed text-ink-600">{card.description}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 transition-colors group-hover:text-accent-600">
                  Explorer
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Sélection du torréfacteur */}
      {featured.length > 0 && (
        <section className="bg-ink-100/60 py-16 lg:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-600">
                  Sélection du torréfacteur
                </p>
                <h2 className="mt-3 font-serif text-3xl font-medium text-ink-900 sm:text-4xl">
                  Nos best-sellers
                </h2>
              </div>
              <Link
                href="/cafes"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 underline underline-offset-4 transition-colors hover:text-ink-900"
              >
                Découvrir tout le catalogue
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Teaser storytelling */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={STORY_IMAGE}
              alt="Récolte manuelle des cerises de café"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-600">
              Notre Histoire
            </p>
            <h2 className="mt-4 font-serif text-3xl font-medium leading-tight text-ink-900 sm:text-4xl">
              Walter Flores, Amélia & la Finca La Campiña
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-600">
              <p>
                Au cœur de la vallée de Chanchamayo, au Pérou, Walter Flores fonde et exploite
                la Finca La Campiña. Sa fille Amélia perpétue l&apos;héritage familial : « Papá »,
                c&apos;est « Papa » en espagnol — un hommage vibrant à son père.
              </p>
              <p>
                Venue en France pour faire rayonner la récolte familiale, Amélia a fondé sa
                brûlerie au 1 Rue du Poteau, à Paris 18e. Chaque lot est torréfié à la commande
                sous 4 jours ouvrés — du champ de son père jusqu&apos;à votre tasse parisienne.
              </p>
            </div>
            <Link
              href="/notre-histoire"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-ink-300 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-ink-900 transition-colors hover:border-ink-900 hover:bg-ink-100"
            >
              Lire notre histoire
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="bg-ink-100/60 py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-600">
              Distinctions professionnelles
            </p>
            <h2 className="mt-3 font-serif text-2xl font-medium text-ink-900 sm:text-3xl">
              Les certifications d'Amélia Flores
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CERTIFICATIONS.map((cert, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-xl border border-ink-200 bg-white p-5 text-center shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-100 text-accent-700">
                  <cert.icon size={20} strokeWidth={1.5} />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-ink-900">{cert.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-500">{cert.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stores */}
      <StoresSection />

      <Footer />
    </div>
  );
}
