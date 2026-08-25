import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  alternates: { canonical: '/cgv' },
  title: 'Conditions Générales de Vente — Café de Papá',
  description:
    'CGV de Café de Papá, exploité par FINCA LA CAMPINA SARL : commande, prix, paiement Stripe, retrait et droit de rétractation.',
};

export default function CGVPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
      >
        <ArrowLeft size={16} />
        Retour à la boutique
      </Link>

      <h1 className="font-serif text-3xl font-medium text-ink-900 sm:text-4xl">
        Conditions Générales de Vente
      </h1>
      <p className="mt-2 text-sm text-ink-500">Dernière mise à jour : 14 août 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink-600">
        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Article 1 — Identification du vendeur</h2>
          <p className="mt-2">
            Le vendeur est la société <strong>FINCA LA CAMPINA SARL</strong>, enseigne Café de Papá,
            dont le siège social est situé au 1 Rue du Poteau, 75018 Paris, France.
          </p>
          <ul className="mt-2 space-y-1">
            <li><strong>SIREN :</strong> 535 001 069 — <strong>SIRET :</strong> 535 001 069 00025</li>
            <li><strong>RCS :</strong> Paris 535 001 069</li>
            <li><strong>N° de TVA intracommunautaire :</strong> FR91535001069</li>
            <li><strong>Code APE / NAF :</strong> 4637Z (Commerce de café, thé, cacao et épices)</li>
            <li><strong>Contact :</strong> cafefincalacampina@outlook.fr | Tél : 01 46 06 51 75 / 06 99 76 12 76</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Article 2 — Objet</h2>
          <p className="mt-2">
            Les présentes Conditions Générales de Vente (CGV) régissent l&apos;ensemble des ventes
            de produits réalisées par Café de Papá sur son site internet. Toute commande implique
            l&apos;acceptation pleine et entière des présentes CGV par l&apos;acheteur.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Article 3 — Commandes</h2>
          <p className="mt-2">
            Les commandes sont passées directement sur le site. La validation de la commande
            par l&apos;acheteur constitue une offre de contrat. Café de Papá confirme la réception
            de la commande par e-mail après confirmation du paiement.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Article 4 — Prix</h2>
          <p className="mt-2">
            Tous les prix sont indiqués en euros, toutes taxes comprises (TTC). Le retrait en
            boutique (Click &amp; Collect), seul mode proposé actuellement, est gratuit.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Article 5 — Paiement</h2>
          <p className="mt-2">
            Le paiement est sécurisé via Stripe, prestataire de services de paiement agréé.
            Les cartes bancaires acceptées sont Visa, Mastercard et American Express. Le
            débit est effectué immédiatement à la validation de la commande.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Article 6 : Préparation, retrait et délais</h2>
          <p className="mt-2">
            Afin de garantir une fraîcheur absolue, nos cafés sont torréfiés et conditionnés à la commande.
          </p>
          <div className="mt-3 rounded-lg bg-ink-50 p-4">
            <p className="font-medium text-ink-900">Délai de préparation</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li>
                <strong>Délai prévu :</strong> 4 jours ouvrés à compter de la confirmation de paiement.
              </li>
            </ul>
          </div>
          <p className="mt-3">
            Le mode de retrait suivant est proposé :
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              <strong>Retrait en boutique (Click &amp; Collect) — Gratuit</strong> : retrait exclusivement
              à notre brûlerie historique, 1 Rue du Poteau, 75018 Paris. Horaires d&apos;ouverture :
              Mar - Ven : 10h-13h &amp; 15h30-20h | Sam : 10h-14h &amp; 15h-19h30 | Dim : 10h-13h30
              (Fermé le Lundi). Préparation prévue sous 4 jours ouvrés ; le client est invité à
              contacter la boutique avant son déplacement.
            </li>
          </ul>
          <p className="mt-2">
            Un e-mail est envoyé lorsque la commande est prête. Le client doit attendre cette
            confirmation avant de se déplacer.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Article 7 — Droit de rétractation</h2>
          <p className="mt-2">
            Conformément aux dispositions légales, l&apos;acheteur dispose d&apos;un délai de 14 jours
            pour exercer son droit de rétractation. Toutefois, en application de l&apos;article
            L221-6 du Code de la consommation, ce droit ne peut être exercé pour les denrées
            périssables (café moulu, thé, produits alimentaires) qui risquent de se détériorer
            rapidement. Les cafetières et accessoires non alimentaires conservent le droit
            de rétractation dans les 14 jours, sous réserve du retour du produit intact et
            non utilisé.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Article 8 — Garanties</h2>
          <p className="mt-2">
            Café de Papá garantit la conformité des produits vendus. En cas de produit non
            conforme ou défectueux, l&apos;acheteur peut contacter Café de Papá par e-mail
            à l&apos;adresse cafefincalacampina@outlook.fr dans un délai de 48h suivant la réception
            pour obtenir un remboursement ou un échange.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Article 9 — Droit applicable</h2>
          <p className="mt-2">
            Les présentes CGV sont soumises au droit français. En cas de litige, les tribunaux
            français seront seuls compétents.
          </p>
        </section>
      </div>
    </div>
  );
}
