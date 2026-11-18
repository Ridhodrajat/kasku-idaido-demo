import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: 104,
            fontWeight: 900,
            fontFamily: 'sans-serif',
            letterSpacing: -2,
          }}
        >
          K
        </div>
        <div
          style={{
            position: 'absolute',
            right: 40,
            top: 48,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#DDA15E',
            border: '3px solid white',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
