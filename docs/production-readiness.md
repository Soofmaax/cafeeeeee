# Préparation de la production

## Responsabilité des comptes

Les comptes Supabase, Stripe, Resend et hébergement doivent appartenir à Amelia ou à
Café de Papá. Le développeur reçoit un accès nominatif limité. Les clés secrètes restent
dans le gestionnaire de secrets de l'hébergeur et ne sont jamais envoyées au navigateur.

## Environnement temporaire

Déployer la branche principale sur l'URL temporaire HTTPS fournie par l'hébergeur, puis
renseigner `NEXT_PUBLIC_APP_URL` avec cette URL complète. Elle alimente les retours Stripe,
les URL canoniques, le sitemap et `robots.txt`. Aucun développement ne dépend du domaine
définitif.

Variables nécessaires sur la preview fonctionnelle :

```text
NEXT_PUBLIC_APP_URL=https://adresse-temporaire.example
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ADMIN_EMAILS=adresse-personnelle-amelia@example.com
ADMIN_EMAIL=adresse-recevable@example.com
RESEND_API_KEY=
FROM_EMAIL=adresse-validee-par-resend@example.com
REQUIRE_PRODUCTION_CONFIG=true
LEGAL_HOST_NAME=raison-sociale-de-hebergeur
LEGAL_HOST_ADDRESS=adresse-legale-de-hebergeur
```

`REQUIRE_PRODUCTION_CONFIG=true` bloque le démarrage si une variable indispensable manque
ou si l'URL publique n'utilise pas HTTPS. Le laisser à `false` uniquement pour les builds de
preview sans services externes.

Renseigner les coordonnées juridiques exactes de l'hébergeur choisi. La page de mentions
légales les lit depuis `LEGAL_HOST_NAME` et `LEGAL_HOST_ADDRESS`.

## Supabase

1. Créer le projet dans l'organisation contrôlée par Café de Papá.
2. Appliquer toutes les migrations dans l'ordre.
3. Créer le compte Auth d'Amelia avec un mot de passe unique d'au moins 12 caractères.
4. Placer son adresse exacte dans `ADMIN_EMAILS`.
5. Vérifier dans le tableau de bord que `customers`, `orders`, `checkout_intents`,
   `stock_incidents`, `admin_audit_log` et `api_rate_limits` ne possèdent aucune politique
   publique.
6. Importer le catalogue validé, puis contrôler chaque prix, SKU, variation et stock.

## Stripe

1. Utiliser un compte Stripe contrôlé par Café de Papá.
2. Commencer avec `sk_test_...`.
3. Créer un webhook vers `https://adresse-temporaire.example/api/webhook`.
4. Activer `checkout.session.completed`, `checkout.session.async_payment_succeeded` et
   `checkout.session.async_payment_failed`.
5. Tester un paiement accepté, un paiement refusé, un double webhook et un remboursement
   automatique après conflit de stock.
6. Passer aux clés live uniquement après la recette et l'activation du compte marchand.

## Resend

Resend peut être testé avec un domaine déjà contrôlé par Café de Papá ou avec le mode de
test autorisé par le compte. Sans clé, l'application journalise les e-mails sans les envoyer.

À faire après récupération du domaine : vérifier `cafedepapa.fr` dans Resend.

À faire après récupération du domaine : publier les enregistrements SPF, DKIM et DMARC
fournis par Resend.

À faire après récupération du domaine : remplacer `FROM_EMAIL` par l'adresse validée sur
`cafedepapa.fr` et vérifier la réception chez plusieurs fournisseurs de messagerie.

## Domaine et hébergement

À faire après récupération du domaine : ajouter `cafedepapa.fr` et `www.cafedepapa.fr`
au projet d'hébergement contrôlé par Café de Papá.

À faire après récupération du domaine : publier les enregistrements DNS indiqués par
l'hébergeur.

À faire après récupération du domaine : définir `NEXT_PUBLIC_APP_URL=https://cafedepapa.fr`
dans l'environnement de production, puis reconstruire le site.

À faire après récupération du domaine : remplacer l'URL du webhook Stripe temporaire par
`https://cafedepapa.fr/api/webhook` et enregistrer le nouveau secret de signature.

À faire après récupération du domaine : tester la redirection de `www` vers le domaine
principal, HTTPS, les URL canoniques, `robots.txt` et le sitemap.

## Recette avant ouverture

La recette couvre les largeurs 375, 768 et 1440 pixels, le clavier, les messages d'erreur,
le panier persistant, le stock épuisé, le paiement, la confirmation, l'e-mail de commande,
l'e-mail de retrait, l'administration et la déconnexion. Aucun outil de mesure d'audience
n'est installé. Son ajout futur nécessitera une décision de consentement avant déploiement.
