export interface Store {
  id: string;
  name: string;
  cityArea: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  hours: string;
  access: string;
  mapQuery: string;
  description: string;
  rating: string;
  allowsClickAndCollect: boolean;
}

export const OFFICIAL_STORES: Store[] = [
  {
    id: 'store-poteau',
    name: 'Café de Papá — Paris 18e (Rue du Poteau)',
    cityArea: 'Paris 18e — Jules Joffrin / Montmartre',
    address: '1 Rue du Poteau',
    postalCode: '75018',
    city: 'Paris',
    phone: '01 46 06 51 75 / 06 99 76 12 76',
    email: 'lacampina.francia@gmail.com',
    hours: 'Mar - Ven : 10h-13h & 15h30-20h | Sam : 10h-14h & 15h-19h30 | Dim : 10h-13h30 (Fermé le Lundi)',
    access: 'Métro Jules Joffrin (L12) ou Simplon (L4)',
    mapQuery: '1+Rue+du+Poteau+75018+Paris',
    description:
      "La brûlerie historique d'Amélia Flores : atelier de torréfaction, dégustation et point unique de retrait Click & Collect des commandes en ligne.",
    rating: '4.7/5 (100+ avis)',
    allowsClickAndCollect: true,
  },
  {
    id: 'store-caulaincourt',
    name: 'Café de Papá — Paris 18e (Caulaincourt)',
    cityArea: 'Paris 18e — Lamarck-Caulaincourt',
    address: '116 Rue Caulaincourt',
    postalCode: '75018',
    city: 'Paris',
    phone: '09 81 10 49 80',
    email: 'lacampina.francia@gmail.com',
    hours: 'Mardi - Samedi : 11h00 - 19h00 | Dimanche : 11h00 - 15h00',
    access: 'Métro Lamarck - Caulaincourt (L12)',
    mapQuery: '116+Rue+Caulaincourt+75018+Paris',
    description:
      'Comptoir barista et dégustation sur le versant nord de Montmartre.',
    rating: '4.7/5 (Avis Google)',
    allowsClickAndCollect: false,
  },
  {
    id: 'store-courbevoie',
    name: 'Café de Papá — Courbevoie (Galerie Charras)',
    cityArea: 'Courbevoie / La Défense (92)',
    address: '12 Rue Baudin',
    postalCode: '92400',
    city: 'Courbevoie',
    phone: '06 99 76 12 76',
    email: 'lacampina.francia@gmail.com',
    hours: 'Mardi - Vendredi : 11h00 - 19h00 | Samedi : 10h00 - 20h00',
    access: 'Gare de Courbevoie (Ligne L) ou Métro Esplanade de La Défense (L1)',
    mapQuery: '12+Rue+Baudin+92400+Courbevoie',
    description:
      'Boutique chaleureuse et brûlerie artisanale à deux pas du centre Charras.',
    rating: '5.0/5 (20+ avis)',
    allowsClickAndCollect: false,
  },
];

export const PICKUP_STORE = OFFICIAL_STORES[0];
