import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

const colorSchemes = {
  default: { primary: [0, 70, 85], secondary: [0, 60, 75], accent: [0, 65, 80] },
  red: { primary: [0, 70, 85], secondary: [0, 60, 75], accent: [0, 65, 80] },
  blue: { primary: [210, 70, 85], secondary: [200, 60, 75], accent: [220, 65, 80] },
  green: { primary: [120, 70, 85], secondary: [110, 60, 75], accent: [130, 65, 80] },
  purple: { primary: [270, 70, 85], secondary: [260, 60, 75], accent: [280, 65, 80] },
  orange: { primary: [30, 70, 85], secondary: [20, 60, 75], accent: [40, 65, 80] },
  teal: { primary: [180, 70, 85], secondary: [170, 60, 75], accent: [190, 65, 80] },
};

function getFontSize(title: string, isSubtitle = false): number {
  const length = title.length;
  if (isSubtitle) return length > 100 ? 24 : length > 70 ? 28 : 32;
  return length > 100 ? 32 : length > 70 ? 40 : length > 50 ? 48 : length > 30 ? 56 : 64;
}

function hslToRgb(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)].map(Math.round);
}

function rgbToString(rgb: number[]) {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Default Title';
    const subtitle = searchParams.get('subtitle') || '';
    const showDate = searchParams.get('date') === 'true';
    const logo = searchParams.get('logo') === 'true';
    const colorScheme = searchParams.get('color') || 'default';

    const scheme = colorSchemes[colorScheme as keyof typeof colorSchemes] || colorSchemes.default;
    const primaryRgb = hslToRgb(scheme.primary[0], scheme.primary[1], scheme.primary[2]);
    const secondaryRgb = hslToRgb(scheme.secondary[0], scheme.secondary[1], scheme.secondary[2]);
    const accentRgb = hslToRgb(scheme.accent[0], scheme.accent[1], scheme.accent[2]);
    const darkRgb = hslToRgb(0, 0, 5);

    const colors = {
      primary: rgbToString(primaryRgb),
      secondary: rgbToString(secondaryRgb),
      accent: rgbToString(accentRgb),
      dark: rgbToString(darkRgb),
    };

    const titleSize = getFontSize(title);
    const subtitleSize = getFontSize(subtitle, true);
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            padding: '64px',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              right: '-20%',
              width: '70%',
              height: '70%',
              background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
              borderRadius: '50%',
              filter: 'blur(100px)',
              opacity: '0.6',
            }}
          />

          {logo && (
            <div
              style={{
                position: 'absolute',
                top: '64px',
                left: '64px',
                color: colors.dark,
                fontSize: '24px',
                fontWeight: '700',
                zIndex: '1',
              }}
            >
              LOGO
            </div>
          )}

          {showDate && (
            <div
              style={{
                position: 'absolute',
                top: '64px',
                right: '64px',
                color: colors.dark,
                fontSize: '18px',
                zIndex: '1',
              }}
            >
              {currentDate}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              maxWidth: '900px',
              zIndex: '1',
            }}
          >
            <div
              style={{
                fontSize: `${titleSize}px`,
                fontWeight: '700',
                color: colors.dark,
                lineHeight: '1.2',
                letterSpacing: '-0.02em',
                fontFamily: 'system-ui',
              }}
            >
              {title}
            </div>

            {subtitle && (
              <div
                style={{
                  fontSize: `${subtitleSize}px`,
                  color: colors.dark,
                  lineHeight: '1.4',
                  fontFamily: 'system-ui',
                  fontWeight: '500',
                  opacity: '0.9',
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 628,
        emoji: 'twemoji',
      }
    );
  } catch (e) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}