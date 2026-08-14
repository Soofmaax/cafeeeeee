import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FAQ — Café de Papá',
  description:
    'Questions fréquentes : torréfaction à la commande, délais de livraison, Click & Collect, paiement sécurisé et conservation du café.',
};

const FAQ_ITEMS = [
  {
    q: "Quels sont les délais de torréfaction et d'expédition ?",
    a: "Tous nos cafés sont torréfiés et conditionnés à la commande dans notre atelier du 1 Rue du Poteau, à Paris 18e. Le délai de préparation est de 4 jours ouvrés à compter de la confirmation de votre paiement. Conformément à l'article L. 216-1 du Code de la consommation, la livraison intervient au plus tard dans un délai de 30 jours.",
  },
  {
    q: "Quels sont les modes de livraison proposés ?",
    a: "Deux options s'offrent à vous : la livraison en Point Relais via Mondial Relay (4,50 €, offerte dès 45 € d'achat) et le retrait gratuit en boutique (Click & Collect) au 1 Rue du Poteau, 75018 Paris.",
  },
  {
    q: "Comment fonctionne le Click & Collect ?",
    a: "Après validation de votre commande, vous recevez un e-mail de confirmation. Sous 4 jours ouvrés, votre commande est prête à être retirée à notre brûlerie historique au 1 Rue du Poteau, Paris 18e. Horaires : Mar - Ven : 10h-13h & 15h30-20h | Sam : 10h-14h & 15h-19h30 | Dim : 10h-13h30 (Fermé le Lundi).",
  },
  {
    q: "Le paiement est-il sécurisé ?",
    a: "Oui. Le paiement est entièrement sécurisé via Stripe, prestataire de services de paiement agréé. Les cartes bancaires acceptées sont Visa, Mastercard et American Express. Le débit est effectué à la validation de la commande.",
  },
  {
    q: "Comment conserver mon café fraîchement torréfié ?",
    a: "Conservez votre café dans son emballage d'origine, bien fermé, à l'abri de la lumière, de la chaleur et de l'humidité. Pour une dégustation optimale, nous vous recommandons de le consommer dans les 4 semaines suivant la torréfaction. Ne congelez que les grains entiers, jamais le café moulu.",
  },
  {
    q: "Puis-je exercer un droit de rétractation ?",
    a: "Pour les cafetières et accessoires non alimentaires, vous disposez d'un délai de 14 jours pour exercer votre droit de rétractation, sous réserve du retour du produit intact et non utilisé. En revanche, conformément à l'article L221-6 du Code de la consommation, ce droit ne s'applique pas aux denrées périssables (café moulu, thé, produits alimentaires).",
  },
  {
    q: "Vos cafés sont-ils 100% Arabica ?",
    a: "Oui, l'intégralité de nos 30 grands crus sont 100% Purs Arabicas, sélectionnés et fraîchement torréfiés à la commande. Notre cru familial d'altitude provient de la Finca La Campiña, à Chanchamayo au Pérou, à 1 750 m d'altitude.",
  },
];

export default function FAQPage() {
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
        Questions Fréquentes
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-500">
        Tout ce que vous devez savoir sur nos cafés, thés, accessoires et nos modes de livraison.
      </p>

      <div className="mt-10 space-y-3">
        {FAQ_ITEMS.map((item, i) => (
          <details
            key={i}
            className="group rounded-xl border border-ink-200 bg-white p-5 shadow-sm [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-ink-900">
              {item.q}
              <ChevronDown
                size={18}
                className="shrink-0 text-ink-400 transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">{item.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-ink-100/60 p-6 text-center">
        <p className="text-sm text-ink-600">
          Vous n&apos;avez pas trouvé la réponse à votre question ?
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-ink-50 transition-colors hover:bg-ink-800"
        >
          Contactez-nous
        </Link>
      </div>
    </div>
  );
}
