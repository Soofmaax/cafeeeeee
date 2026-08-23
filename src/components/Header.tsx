'use client';

import { useState, useEffect } from 'react';
import { Menu, X, User, ShoppingBag, Search } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import SearchBar, { type SearchProduct } from '@/components/SearchBar';

const navLinks = [
  { label: 'Nos Cafés', href: '/cafes' },
  { label: 'Nos Thés', href: '/thes' },
  { label: 'Accessoires', href: '/accessoires' },
  { label: 'Nos Boutiques', href: '/#boutiques' },
  { label: 'Notre Histoire', href: '/notre-histoire' },
];

export default function Header({ searchProducts }: { searchProducts?: SearchProduct[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalItems, openCart } = useCart();

  useEffect(() => {
    if (menuOpen || searchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-ink-200/60 bg-ink-50/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:gap-6 lg:px-8">
        {/* Colonne gauche : burger (mobile) + nav (desktop) */}
        <div className="flex shrink-0 items-center gap-2 md:flex-1">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-700 transition-colors hover:text-ink-900 md:hidden"
          >
            <Menu size={22} />
          </button>

          <nav className="hidden items-center gap-5 lg:flex xl:gap-6" aria-label="Navigation principale">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="whitespace-nowrap text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Colonne centrale : logo */}
        <div className="flex shrink-0 items-center justify-center">
          <Link
            href="/"
            className="whitespace-nowrap font-serif text-xl font-semibold tracking-wide text-ink-900"
          >
            CAFÉ DE PAPÁ
          </Link>
        </div>

        {/* Colonne droite : recherche + actions */}
        <div className="flex shrink-0 items-center justify-end gap-1 md:flex-1">
          {/* Desktop search */}
          {searchProducts && (
            <div className="hidden w-48 xl:block xl:w-64">
              <SearchBar products={searchProducts} />
            </div>
          )}

          {/* Mobile search trigger */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Rechercher"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-700 transition-colors hover:text-ink-900 xl:hidden"
          >
            <Search size={20} />
          </button>

          <Link
            href="/account"
            aria-label="Mon compte"
            className="hidden h-11 w-11 items-center justify-center rounded-lg text-ink-600 transition-colors hover:text-ink-900 md:flex"
          >
            <User size={20} />
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label={`Ouvrir le panier${totalItems > 0 ? `, ${totalItems} article${totalItems > 1 ? 's' : ''}` : ''}`}
            className="relative flex h-11 w-11 items-center justify-center rounded-lg text-ink-700 transition-colors hover:text-ink-900"
          >
            <ShoppingBag size={22} />
            {totalItems > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-ink-950"
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile search overlay */}
      {searchOpen && searchProducts && (
        <div className="fixed inset-0 z-50 bg-ink-50 px-4 pt-4 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <SearchBar products={searchProducts} />
            </div>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Fermer la recherche"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-500 hover:text-ink-900"
            >
              <X size={22} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile menu drawer */}
      <div
        className={`fixed inset-0 z-50 bg-ink-950/40 transition-opacity duration-300 md:hidden ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
        className={`fixed left-0 top-0 z-50 flex h-full w-full max-w-xs flex-col bg-ink-50 shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
          <span className="font-serif text-lg font-semibold text-ink-900">Menu</span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Fermer le menu"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-500 transition-colors hover:text-ink-900"
          >
            <X size={22} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-5 py-4" aria-label="Navigation mobile">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-4 py-3.5 text-base font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-4 py-3.5 text-base font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
              >
                Mon Compte
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
