# cafeeeeee

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-npxd3yld)

## Tester un déploiement sans clés

Le site peut être compilé et démarré sans secrets afin de valider un déploiement de
prévisualisation :

```bash
npm ci
npm run build
npm start
```

Sans variables Supabase, les pages publiques restent disponibles avec un catalogue
vide. Sans clés serveur, le paiement, le webhook et la consultation des commandes ne
sont pas opérationnels. Aucun faux secret ne doit être ajouté pour ce test.

Pour activer toutes les fonctions, copiez `.env.example` vers `.env.local` et renseignez
les variables nécessaires. `RESEND_API_KEY` reste facultative : les e-mails sont simulés
dans les logs lorsqu'elle est absente.

## Sécurité des commandes

Les migrations Supabase doivent être appliquées dans leur ordre, notamment
`20260823000000_secure_orders_and_atomic_stock.sql`. Cette migration retire les accès
publics aux clients et commandes, réserve les écritures catalogue au serveur et installe
la finalisation transactionnelle des commandes payées.

La consultation d'une commande nécessite le jeton aléatoire fourni dans l'URL de retour
Stripe. Seul son hash SHA-256, assorti d'une expiration, est conservé en base. Mondial
Relay reste désactivé tant qu'une intégration officielle n'est pas disponible ; le seul
mode proposé est le Click & Collect.

## Vérifications du site

`npm run test:site` contrôle les routes et ancres internes statiques, ainsi que la présence
de la page 404, du favicon, de l'image de partage, de `robots.txt` et du sitemap.

La procédure de staging, la configuration des comptes externes et les actions réservées à
la récupération du domaine sont détaillées dans `docs/production-readiness.md`.
