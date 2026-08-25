export function getPublicAppUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, '');

  const previewHost = process.env.VERCEL_URL?.trim();
  if (previewHost) return `https://${previewHost.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;

  return 'http://localhost:3000';
}
