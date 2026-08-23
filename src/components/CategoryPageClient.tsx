'use client';

import { useState, useMemo } from 'react';
import type { Product } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';

export type CategoryId = 'cafes' | 'thes' | 'accessoires';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface SortOption {
  id: string;
  label: string;
}

interface CategoryPageClientProps {
  products: Product[];
  categoryId: CategoryId;
  emptyMessage?: string;
}

const FILTER_GROUPS: Record<CategoryId, FilterGroup[]> = {
  cafes: [
    {
      id: 'origine',
      label: 'Origine / Terroir',
      options: [
        { id: 'perou', label: 'Pérou', value: 'Pérou' },
        { id: 'ethiopie', label: 'Éthiopie', value: 'Éthiopie' },
        { id: 'colombie', label: 'Colombie', value: 'Colombie' },
        { id: 'bresil', label: 'Brésil', value: 'Brésil' },
        { id: 'vietnam', label: 'Vietnam', value: 'Vietnam' },
        { id: 'amerique-centrale', label: 'Amérique Centrale', value: 'Amérique Centrale' },
      ],
    },
    {
      id: 'intensite',
      label: 'Intensité aromatique',
      options: [
        { id: 'int-2', label: '2/5 — Doux', value: '2' },
        { id: 'int-3', label: '3/5 — Équilibré', value: '3' },
        { id: 'int-4', label: '4/5 — Corsé', value: '4' },
      ],
    },
    {
      id: 'type',
      label: 'Type',
      options: [
        { id: 'decafeine', label: 'Décaféiné', value: 'décaféiné' },
        { id: 'grains', label: 'En grains', value: 'grains' },
      ],
    },
  ],
  thes: [
    {
      id: 'famille',
      label: 'Famille de thé',
      options: [
        { id: 'noir', label: 'Thé noir', value: 'noir' },
        { id: 'vert', label: 'Thé vert', value: 'vert' },
        { id: 'fume', label: 'Thé fumé', value: 'fumé' },
        { id: 'floral', label: 'Floral / Infusion', value: 'floral' },
      ],
    },
    {
      id: 'origine',
      label: 'Origine',
      options: [
        { id: 'chine', label: 'Chine', value: 'Chine' },
        { id: 'japon', label: 'Japon', value: 'Japon' },
        { id: 'franco-britannique', label: 'Blend franco-britannique', value: 'Franco-Britannique' },
        { id: 'maison', label: 'Création maison', value: 'Création Maison' },
      ],
    },
  ],
  accessoires: [
    {
      id: 'methode',
      label: "Méthode d'extraction",
      options: [
        { id: 'piston', label: 'Piston / French Press', value: 'piston' },
        { id: 'moka', label: 'Cafetière Italienne Moka', value: 'moka' },
        { id: 'accessoires', label: 'Accessoires & Verres', value: 'accessoire' },
      ],
    },
  ],
};

const SORT_OPTIONS: SortOption[] = [
  { id: 'popularite', label: 'Populaires' },
  { id: 'prix-asc', label: 'Prix croissant' },
  { id: 'prix-desc', label: 'Prix décroissant' },
  { id: 'intensite-asc', label: 'Intensité croissante' },
];

function matchFilter(product: Product, categoryId: CategoryId, groupId: string, value: string): boolean {
  const name = product.name.toLowerCase();
  const origin = (product.origin ?? '').toLowerCase();
  const intensity = product.intensity ?? '';
  const notes = (product.aromatic_notes ?? '').toLowerCase();

  if (categoryId === 'cafes') {
    switch (groupId) {
      case 'origine':
        return origin.includes(value.toLowerCase());
      case 'intensite':
        return intensity.startsWith(value);
      case 'type':
        if (value === 'décaféiné') return name.includes('décaféin');
        if (value === 'grains')
          return (product.variations ?? []).some((v) =>
            (v.attribute ?? '').toLowerCase().includes('grains'),
          );
        return false;
      default:
        return false;
    }
  }

  if (categoryId === 'thes') {
    switch (groupId) {
      case 'famille':
        switch (value) {
          case 'noir':
            return name.includes('earl') || name.includes('nuit') || notes.includes('thé noir');
          case 'vert':
            return (
              name.includes('gyokuro') ||
              name.includes('sencha') ||
              name.includes('vert') ||
              notes.includes('herbe')
            );
          case 'fumé':
            return name.includes('lapsang') || name.includes('fumé') || notes.includes('fumé');
          case 'floral':
            return (
              name.includes('jasmin') ||
              notes.includes('fleur') ||
              notes.includes('rose') ||
              notes.includes('floral')
            );
          default:
            return false;
        }
      case 'origine':
        return origin.includes(value.toLowerCase());
      default:
        return false;
    }
  }

  if (categoryId === 'accessoires') {
    switch (groupId) {
      case 'methode':
        switch (value) {
          case 'piston':
            return name.includes('piston');
          case 'moka':
            return (
              name.includes('moka') || name.includes('italienne') || name.includes('bialetti')
            );
          case 'accessoire':
            return (
              name.includes('verre') ||
              name.includes('rechange') ||
              (product.intensity ?? '').toLowerCase().includes('accessoire')
            );
          default:
            return false;
        }
      default:
        return false;
    }
  }

  return false;
}

function sortProducts(products: Product[], sortId: string): Product[] {
  const getBasePrice = (p: Product) =>
    p.variations?.length ? Math.min(...p.variations.map((v) => v.price_cents)) : p.price_cents;
  const getIntensity = (p: Product) => parseInt((p.intensity ?? '0')[0] ?? '0', 10);

  switch (sortId) {
    case 'prix-asc':
      return [...products].sort((a, b) => getBasePrice(a) - getBasePrice(b));
    case 'prix-desc':
      return [...products].sort((a, b) => getBasePrice(b) - getBasePrice(a));
    case 'intensite-asc':
      return [...products].sort((a, b) => getIntensity(a) - getIntensity(b));
    default:
      return [...products].sort((a, b) => a.created_at.localeCompare(b.created_at));
  }
}

export default function CategoryPageClient({
  products,
  categoryId,
  emptyMessage = 'Aucun produit ne correspond à vos filtres.',
}: CategoryPageClientProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState('popularite');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filterGroups = FILTER_GROUPS[categoryId];

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      return Object.entries(activeFilters).every(([groupId, selectedValues]) => {
        if (selectedValues.length === 0) return true;
        return selectedValues.some((val) =>
          matchFilter(product, categoryId, groupId, val),
        );
      });
    });
    return sortProducts(filtered, sortBy);
  }, [products, activeFilters, sortBy, categoryId]);

  function toggleFilter(groupId: string, value: string) {
    setActiveFilters((prev) => {
      const current = prev[groupId] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [groupId]: next };
    });
  }

  function clearAllFilters() {
    setActiveFilters({});
  }

  const totalActiveFilters = Object.values(activeFilters).reduce(
    (sum, arr) => sum + arr.length,
    0,
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-6">
          <FilterSidebar
            filterGroups={filterGroups}
            activeFilters={activeFilters}
            toggleFilter={toggleFilter}
            clearAllFilters={clearAllFilters}
            totalActiveFilters={totalActiveFilters}
          />
        </div>
      </aside>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-ink-950/40 lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filtres"
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-ink-50 p-5 shadow-2xl lg:hidden"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-lg font-medium text-ink-900">Filtres</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Fermer les filtres"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-500 hover:text-ink-900"
              >
                <X size={22} />
              </button>
            </div>
            <FilterSidebar
              filterGroups={filterGroups}
              activeFilters={activeFilters}
              toggleFilter={toggleFilter}
              clearAllFilters={clearAllFilters}
              totalActiveFilters={totalActiveFilters}
            />
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-5 w-full rounded-full bg-ink-900 py-3.5 text-sm font-semibold uppercase tracking-wider text-ink-50"
            >
              Voir {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
            </button>
          </div>
        </>
      )}

      {/* Main content */}
      <div>
        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex min-h-11 items-center gap-2 rounded-full border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-ink-900 lg:hidden"
          >
            <SlidersHorizontal size={16} />
            Filtres
            {totalActiveFilters > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-xs font-bold text-ink-950">
                {totalActiveFilters}
              </span>
            )}
          </button>

          <p className="hidden text-sm text-ink-500 lg:block">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
          </p>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Trier par"
              className="min-h-11 appearance-none rounded-full border border-ink-300 bg-white py-2 pl-4 pr-10 text-sm font-medium text-ink-700 outline-none transition-colors focus:border-ink-900"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-400"
            />
          </div>
        </div>

        {/* Grid */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-serif text-lg text-ink-500">{emptyMessage}</p>
            {totalActiveFilters > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-4 rounded-full border border-ink-300 px-6 py-3 text-sm font-medium text-ink-700 transition-colors hover:border-ink-900"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSidebar({
  filterGroups,
  activeFilters,
  toggleFilter,
  clearAllFilters,
  totalActiveFilters,
}: {
  filterGroups: FilterGroup[];
  activeFilters: Record<string, string[]>;
  toggleFilter: (groupId: string, value: string) => void;
  clearAllFilters: () => void;
  totalActiveFilters: number;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-base font-medium text-ink-900">Affiner</h3>
        {totalActiveFilters > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-medium text-accent-600 underline underline-offset-2 hover:text-accent-500"
          >
            Tout effacer
          </button>
        )}
      </div>
      {filterGroups.map((group) => (
        <div key={group.id} className="border-t border-ink-200 pt-4">
          <p className="mb-3 text-sm font-semibold text-ink-700">{group.label}</p>
          <ul className="space-y-2">
            {group.options.map((opt) => {
              const isChecked = (activeFilters[group.id] ?? []).includes(opt.value);
              return (
                <li key={opt.id}>
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-600 transition-colors hover:text-ink-900">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleFilter(group.id, opt.value)}
                      className="h-4 w-4 rounded accent-ink-900"
                    />
                    {opt.label}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
