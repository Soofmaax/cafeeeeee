/*
# Extend products table with full catalog fields

## Summary
Adds metadata and variation support to the existing products table so it can
hold the real Café de Papá catalog (15 products with multiple weight/size
variations each). Existing columns (slug, name, description, price_cents,
image, weight, stock) are preserved — new columns are nullable or have safe
defaults so nothing breaks.

## New Columns on `products`
- `sku` (text, nullable) — product-level stock keeping unit
- `category` (text, nullable) — 'Café', 'Thé', or 'Cafetières'
- `short_description` (text, nullable) — one-line summary for cards
- `origin` (text, nullable) — geographic origin label
- `aromatic_notes` (text, nullable) — tasting notes string
- `intensity` (text, nullable) — intensity rating string e.g. "3/5"
- `preparation_guide` (text, nullable) — brewing/preparation instructions
- `images` (jsonb, nullable) — array of image URLs (replaces single `image`)
- `variations` (jsonb, nullable) — array of {id, name, sku, attribute, price_cents, weight, stock}

## Data Migration
- `images` is backfilled from the existing `image` column for current rows.
- `variations` is backfilled with a single entry derived from the existing
  `price_cents`, `weight`, and `stock` columns so current products remain
  purchasable.
- `category` is left null for existing rows (the seed step will overwrite).

## Security
- No RLS policy changes. Existing anon/authenticated policies remain in place.
*/

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS origin text,
  ADD COLUMN IF NOT EXISTS aromatic_notes text,
  ADD COLUMN IF NOT EXISTS intensity text,
  ADD COLUMN IF NOT EXISTS preparation_guide text,
  ADD COLUMN IF NOT EXISTS images jsonb,
  ADD COLUMN IF NOT EXISTS variations jsonb;

-- Backfill images array from single image column for existing rows
UPDATE products
  SET images = COALESCE(images, jsonb_build_array(image))
  WHERE image IS NOT NULL AND images IS NULL;

-- Backfill a single variation from legacy columns for existing rows
UPDATE products
  SET variations = COALESCE(variations, jsonb_build_array(
    jsonb_build_object(
      'id', slug || '-default',
      'name', name,
      'sku', COALESCE(sku, slug),
      'attribute', weight,
      'price_cents', price_cents,
      'weight', weight,
      'stock', stock
    )
  ))
  WHERE variations IS NULL;
