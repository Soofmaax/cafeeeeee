import { formatPrice } from '@/lib/format';
import { PICKUP_STORE } from '@/data/stores';

interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  attribute: string;
  quantity: number;
  unitPrice: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

interface DeliveryDetails {
  relayId?: string;
  relayName?: string;
  relayAddress?: string;
  pickupAddress?: string;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'commandes@cafedepapa.fr';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@cafedepapa.fr';

async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Café de Papá <${FROM_EMAIL}>`,
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error('Resend email failed:', await res.text());
    }
  } else {
    console.log(`[EMAIL SIMULATION] To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL SIMULATION] Body length: ${html.length} chars`);
  }
}

function buildItemsHtml(items: OrderItem[]): string {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px 0; color: #555;">${item.name} (${item.attribute})</td>
          <td style="padding: 8px 0; text-align: center; color: #888;">${item.quantity}</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 500; color: #1a1a1a;">${formatPrice(item.unitPrice * item.quantity)}</td>
        </tr>`,
    )
    .join('');
}

function buildShippingSection(shippingType: string, deliveryDetails: DeliveryDetails): string {
  if (shippingType === 'mondial_relay') {
    return `
      <p style="margin: 0 0 4px; font-weight: 600; color: #1a1a1a;">Point Relais (Mondial Relay)</p>
      <p style="margin: 0; color: #555;">${deliveryDetails.relayName ?? ''}</p>
      <p style="margin: 0; color: #888;">${deliveryDetails.relayAddress ?? ''}</p>`;
  }
  return `
    <p style="margin: 0 0 4px; font-weight: 600; color: #1a1a1a;">Retrait en boutique</p>
    <p style="margin: 0; color: #555;">${PICKUP_STORE.name}</p>
    <p style="margin: 0; color: #888;">${PICKUP_STORE.address}, ${PICKUP_STORE.postalCode} ${PICKUP_STORE.city}</p>
    <p style="margin: 0; color: #888;">${PICKUP_STORE.hours}</p>`;
}

export async function sendCustomerConfirmationEmail(
  customerInfo: CustomerInfo,
  orderId: string,
  items: OrderItem[],
  totalCents: number,
  shippingCost: number,
  shippingType: string,
  deliveryDetails: DeliveryDetails,
): Promise<void> {
  const itemsHtml = buildItemsHtml(items);
  const shippingHtml = buildShippingSection(shippingType, deliveryDetails);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-family: Georgia, serif; font-size: 24px; color: #1a1a1a; margin: 0;">CAFÉ DE PAPÁ</h1>
        <p style="font-size: 13px; color: #888; margin: 4px 0 0;">De la Terre Péruvienne à la Tasse Parisienne</p>
      </div>

      <h2 style="font-size: 20px; color: #1a1a1a; margin: 0 0 8px;">Merci pour votre commande !</h2>
      <p style="color: #555; margin: 0 0 24px;">Bonjour ${customerInfo.name},<br/>Nous avons bien reçu votre paiement. Voici le récapitulatif de votre commande.</p>

      <div style="background: #f8f8f8; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 4px; font-size: 13px; color: #888;">Numéro de commande</p>
        <p style="margin: 0; font-weight: 600; font-size: 16px; color: #1a1a1a;">#${orderId.slice(0, 8).toUpperCase()}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <th style="text-align: left; padding: 8px 0; font-size: 13px; color: #888; font-weight: 500;">Article</th>
            <th style="text-align: center; padding: 8px 0; font-size: 13px; color: #888; font-weight: 500;">Qté</th>
            <th style="text-align: right; padding: 8px 0; font-size: 13px; color: #888; font-weight: 500;">Prix</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="border-top: 1px solid #e0e0e0; padding-top: 16px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #555;">Frais de livraison</span>
          <span style="font-weight: 500; color: #1a1a1a;">${shippingCost === 0 ? 'Offerte' : formatPrice(shippingCost)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="font-weight: 600; color: #1a1a1a;">Total TTC</span>
          <span style="font-family: Georgia, serif; font-size: 20px; font-weight: 600; color: #1a1a1a;">${formatPrice(totalCents)}</span>
        </div>
      </div>

      <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin-bottom: 24px; color: #f0f0f0;">
        <p style="margin: 0 0 8px; font-size: 13px; color: #aaa;">Livraison</p>
        ${shippingHtml}
      </div>

      <p style="color: #888; font-size: 13px; margin: 0 0 16px;">Votre commande est entrée en préparation artisanale. Elle sera expédiée ou disponible au retrait sous 4 jours ouvrés.</p>

      <p style="color: #888; font-size: 13px; margin: 0;">Vous recevrez une notification dès l'expédition de votre colis. Pour toute question, contactez-nous à ${ADMIN_EMAIL}.</p>

      <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e0e0e0;">
        <p style="font-size: 12px; color: #aaa; margin: 0;">© 2026 Café de Papá — De la Terre Péruvienne à la Tasse Parisienne</p>
      </div>
    </div>`;

  await sendEmail({
    to: customerInfo.email,
    subject: `Confirmation de commande #${orderId.slice(0, 8).toUpperCase()} — Café de Papá`,
    html,
  });
}

export async function sendAdminNotificationEmail(
  customerInfo: CustomerInfo,
  orderId: string,
  items: OrderItem[],
  totalCents: number,
  shippingCost: number,
  shippingType: string,
  deliveryDetails: DeliveryDetails,
): Promise<void> {
  const itemsHtml = buildItemsHtml(items);
  const shippingHtml = buildShippingSection(shippingType, deliveryDetails);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
      <h2 style="font-size: 20px; color: #1a1a1a; margin: 0 0 8px;">Nouvelle commande payée</h2>
      <p style="color: #555; margin: 0 0 24px;">Une nouvelle commande a été payée et nécessite votre préparation.</p>

      <div style="background: #f8f8f8; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 4px; font-size: 13px; color: #888;">Numéro de commande</p>
        <p style="margin: 0; font-weight: 600; font-size: 16px; color: #1a1a1a;">#${orderId.slice(0, 8).toUpperCase()}</p>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 15px; color: #1a1a1a; margin: 0 0 8px;">Client</h3>
        <p style="margin: 0; color: #555;">${customerInfo.name}</p>
        <p style="margin: 0; color: #555;">${customerInfo.email}</p>
        <p style="margin: 0; color: #555;">${customerInfo.phone}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="border-bottom: 1px solid #e0e0e0;">
            <th style="text-align: left; padding: 8px 0; font-size: 13px; color: #888; font-weight: 500;">Article</th>
            <th style="text-align: center; padding: 8px 0; font-size: 13px; color: #888; font-weight: 500;">Qté</th>
            <th style="text-align: right; padding: 8px 0; font-size: 13px; color: #888; font-weight: 500;">Prix</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="border-top: 1px solid #e0e0e0; padding-top: 16px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #555;">Frais de livraison</span>
          <span style="font-weight: 500; color: #1a1a1a;">${shippingCost === 0 ? 'Offerte' : formatPrice(shippingCost)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="font-weight: 600; color: #1a1a1a;">Total TTC</span>
          <span style="font-family: Georgia, serif; font-size: 20px; font-weight: 600; color: #1a1a1a;">${formatPrice(totalCents)}</span>
        </div>
      </div>

      <div style="background: #f8f8f8; border-radius: 8px; padding: 20px;">
        <p style="margin: 0 0 8px; font-size: 13px; color: #888;">Livraison</p>
        ${shippingHtml}
      </div>
    </div>`;

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `[Nouvelle commande] #${orderId.slice(0, 8).toUpperCase()} — ${customerInfo.name}`,
    html,
  });
}
