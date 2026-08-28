import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-600">Erreur 404</p>
      <h1 className="mt-4 font-serif text-4xl font-medium text-ink-900 sm:text-5xl">
        Cette page n&apos;existe pas
      </h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-600">
        Le lien est peut-être ancien ou l&apos;adresse a été mal saisie. Revenez à la boutique
        pour retrouver nos cafés, thés et accessoires.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink-900 px-7 py-3 text-sm font-semibold uppercase tracking-wider text-ink-50"
        >
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/cafes"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink-300 px-7 py-3 text-sm font-semibold uppercase tracking-wider text-ink-800"
        >
          Voir les cafés
        </Link>
      </div>
    </section>
  );
}
