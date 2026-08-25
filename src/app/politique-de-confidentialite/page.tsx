import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  alternates: { canonical: '/politique-de-confidentialite' },
  title: 'Politique de Confidentialité — Café de Papá',
  description: 'RGPD : utilisation de vos données personnelles pour la livraison et le suivi de commande.',
};

export default function PrivacyPage() {
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
        Politique de Confidentialité
      </h1>
      <p className="mt-2 text-sm text-ink-500">Dernière mise à jour : 14 août 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink-600">
        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Responsable du traitement</h2>
          <p className="mt-2">
            Le responsable du traitement est FINCA LA CAMPINA SARL, enseigne Café de Papá,
            1 Rue du Poteau, 75018 Paris. Pour toute question, utilisez l&apos;adresse
            cafefincalacampina@outlook.fr.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Données collectées</h2>
          <p className="mt-2">
            Lors de votre commande, nous collectons les données suivantes :
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Nom et prénom</li>
            <li>Adresse e-mail</li>
            <li>Numéro de téléphone</li>
            <li>Boutique de retrait</li>
            <li>Historique des commandes</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Finalités du traitement</h2>
          <p className="mt-2">
            Vos données sont utilisées exclusivement pour :
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Traiter et préparer votre commande</li>
            <li>Vous envoyer la confirmation de paiement par e-mail</li>
            <li>Vous prévenir par e-mail lorsque la commande est prête au retrait</li>
            <li>Assurer le service client en cas de question ou de litige</li>
          </ul>
          <p className="mt-2">
            Café de Papá ne revend ni ne cède vos données personnelles à des tiers à des
            fins commerciales. Les données sont uniquement transmises à nos prestataires
            techniques (Stripe pour le paiement et Resend pour les e-mails) dans la
            mesure strictement nécessaire à l&apos;exécution de votre commande.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Durée de conservation</h2>
          <p className="mt-2">
            Vos données sont conservées pendant la durée nécessaire à l&apos;exécution de la
            commande et au respect des obligations comptables légales (10 ans), puis
            archivées ou supprimées.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Vos droits (RGPD)</h2>
          <p className="mt-2">
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous
            disposez des droits suivants :
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Droit d&apos;accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l&apos;effacement (« droit à l&apos;oubli »)</li>
            <li>Droit à la limitation du traitement</li>
            <li>Droit à la portabilité de vos données</li>
            <li>Droit d&apos;opposition au traitement</li>
          </ul>
          <p className="mt-2">
            Pour exercer ces droits, contactez-nous à cafefincalacampina@outlook.fr. Vous
            pouvez également introduire une réclamation auprès de la CNIL
            (www.cnil.fr).
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Cookies</h2>
          <p className="mt-2">
            Le panier public est conservé dans le stockage local du navigateur. Aucun cookie
            publicitaire ou outil de mesure d&apos;audience n&apos;est installé. Un cookie de session
            strictement nécessaire protège uniquement l&apos;espace d&apos;administration.
          </p>
        </section>
      </div>
    </div>
  );
}
