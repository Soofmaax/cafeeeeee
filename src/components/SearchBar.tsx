'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import type { Product } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';

export interface SearchProduct {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  origin: string | null;
  aromatic_notes: string | null;
  image: string;
  price_cents: number;
}

export default function SearchBar({ products }: { products: SearchProduct[] }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim().length >= 2 ? searchProducts(products, query) : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      const product = results[highlightedIndex];
      if (product) {
        window.location.href = `/products/${product.slug}`;
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }

  function getBasePrice(p: SearchProduct): number {
    return p.price_cents;
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher un café, thé, accessoire…"
          aria-label="Rechercher un produit"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-autocomplete="list"
          className="w-full rounded-full border border-ink-300 bg-white py-2 pl-9 pr-9 text-sm text-ink-900 placeholder-ink-400 outline-none transition-colors focus:border-ink-900"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Effacer la recherche"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-900"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div
          id="search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-ink-200 bg-white shadow-xl"
        >
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-ink-500">
              Aucun résultat pour « {query} »
            </p>
          ) : (
            <ul>
              {results.map((product, i) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                    }}
                    role="option"
                    aria-selected={i === highlightedIndex}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      i === highlightedIndex ? 'bg-ink-100' : 'hover:bg-ink-50'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">{product.name}</p>
                      <p className="truncate text-xs text-ink-500">
                        {product.category}
                        {product.origin ? ` · ${product.origin}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-ink-700">
                      {formatPrice(getBasePrice(product))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function searchProducts(products: SearchProduct[], query: string): SearchProduct[] {
  const q = query.toLowerCase().trim();
  return products
    .filter((p) => {
      const haystack = [
        p.name,
        p.category,
        p.origin,
        p.aromatic_notes,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    })
    .slice(0, 8);
}
