export interface CartItem {
  productId: string;
  slug: string;
  variationId: string;
  name: string;
  variationName: string;
  priceCents: number;
  image: string;
  quantity: number;
  weight: string;
}
