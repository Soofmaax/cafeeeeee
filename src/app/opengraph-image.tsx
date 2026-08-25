import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Café de Papá, de la terre péruvienne à la tasse parisienne';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: '#1a1613',
          color: '#f7f7f6',
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          padding: '72px',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '940px' }}>
          <span style={{ color: '#c9a24a', fontSize: 24, letterSpacing: 8 }}>
            PÉROU · PARIS
          </span>
          <span style={{ fontFamily: 'Georgia', fontSize: 88, lineHeight: 1.05, marginTop: 30 }}>
            Café de Papá
          </span>
          <span style={{ color: '#d8d2cc', fontSize: 36, lineHeight: 1.35, marginTop: 28 }}>
            Café de spécialité familial, cultivé au Pérou et torréfié à Paris.
          </span>
        </div>
      </div>
    ),
    size,
  );
}
