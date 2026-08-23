import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
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
            Le responsable du traitement des données est Café de Papá, 14 rue des Caféiers,
            75011 Paris. Pour toute question, contactez-nous à commandes@cafedepapa.fr.
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
            <li>Adresse de livraison (point relais ou boutique)</li>
            <li>Historique des commandes</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Finalités du traitement</h2>
          <p className="mt-2">
            Vos données sont utilisées exclusivement pour :
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Traiter et expédier votre commande</li>
            <li>Vous informer du suivi de votre livraison (e-mail et SMS)</li>
            <li>Assurer le service client en cas de question ou de litige</li>
          </ul>
          <p className="mt-2">
            Café de Papá ne revend ni ne cède vos données personnelles à des tiers à des
            fins commerciales. Les données sont uniquement transmises à nos prestataires
            techniques (Stripe pour le paiement, Mondial Relay pour la livraison) dans la
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
            Pour exercer ces droits, contactez-nous à commandes@cafedepapa.fr. Vous
            pouvez également introduire une réclamation auprès de la CNIL
            (www.cnil.fr).
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-medium text-ink-900">Cookies</h2>
          <p className="mt-2">
            Ce site utilise uniquement les cookies strictement nécessaires au fonctionnement
            du panier d&apos;achat. Aucun cookie de tracking publicitaire n&apos;est déposé.
          </p>
        </section>
      </div>
    </div>
  );
}
