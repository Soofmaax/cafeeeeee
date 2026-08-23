import { OFFICIAL_STORES, type Store } from '@/data/stores';
import { MapPin, Phone, Clock, Navigation, Star } from 'lucide-react';

export default function StoresSection() {
  return (
    <section id="boutiques" className="bg-ink-100/60 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-600">
            Nos boutiques
          </p>
          <h2 className="mt-3 font-serif text-3xl font-medium text-ink-900 sm:text-4xl">
            Trois adresses, une même passion
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-600">
            Du quartier de Jules Joffrin aux ruelles de Montmartre et jusqu&apos;à Courbevoie,
            retrouvez Café de Papá près de chez vous pour déguster, acheter et rencontrer nos baristas.
          </p>
        </div>

        {/* Mobile: horizontal snap carousel */}
        <div className="flex snap-x-mandatory gap-4 overflow-x-auto pb-4 no-scrollbar lg:hidden">
          {OFFICIAL_STORES.map((store) => (
            <div key={store.id} className="w-[85vw] shrink-0 snap-center sm:w-[60vw]">
              <StoreCard store={store} />
            </div>
          ))}
        </div>

        {/* Desktop: 3-column grid */}
        <div className="hidden gap-6 lg:grid lg:grid-cols-3">
          {OFFICIAL_STORES.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StoreCard({ store }: { store: Store }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${store.mapQuery}`;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center gap-2 bg-ink-900 px-5 py-4">
        <Star size={16} className="shrink-0 text-accent-400" />
        <span className="text-sm font-medium text-ink-50">{store.rating}</span>
        {store.allowsClickAndCollect && (
          <span className="ml-auto rounded-full bg-accent-400 px-3 py-0.5 text-xs font-semibold text-ink-950">
            Click &amp; Collect
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-600">
          {store.cityArea}
        </p>
        <h3 className="mt-2 font-serif text-xl font-medium leading-snug text-ink-900">
          {store.name}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-600">{store.description}</p>

        <div className="mt-5 space-y-3 text-sm text-ink-600">
          <div className="flex items-start gap-2.5">
            <MapPin size={16} className="mt-0.5 shrink-0 text-ink-400" />
            <span>
              {store.address}, {store.postalCode} {store.city}
            </span>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock size={16} className="mt-0.5 shrink-0 text-ink-400" />
            <span className="whitespace-pre-line">{store.hours}</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Navigation size={16} className="mt-0.5 shrink-0 text-ink-400" />
            <span>{store.access}</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Phone size={16} className="mt-0.5 shrink-0 text-ink-400" />
            <a
              href={`tel:${store.phone.replace(/\s/g, '')}`}
              className="transition-colors hover:text-ink-900"
            >
              {store.phone}
            </a>
          </div>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink-300 px-5 py-2.5 text-sm font-medium text-ink-900 transition-colors duration-200 hover:border-ink-900 hover:bg-ink-50"
        >
          <MapPin size={15} />
          Voir sur la carte
        </a>
      </div>
    </div>
  );
}
