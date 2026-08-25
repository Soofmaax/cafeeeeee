# cafeeeeee

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-npxd3yld)

## Mode aperçu

Les services externes sont désactivés par défaut. Le site peut donc être déployé
pour valider son apparence sans fournir de clés API :

```env
NEXT_PUBLIC_ENABLE_SUPABASE=false
ENABLE_STRIPE=false
ENABLE_EMAIL=false
```

Les variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` et
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` sont, par définition, envoyées au navigateur.
Netlify est configuré pour ne pas considérer ces trois variables publiques comme
des secrets. Le contrôle reste actif pour les vrais secrets serveur, notamment
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` et
`RESEND_API_KEY`, qui ne doivent jamais être ajoutés au dépôt.

Pour activer une intégration plus tard, ajoutez ses valeurs dans les variables
d’environnement Netlify, puis passez uniquement son indicateur à `true`.
