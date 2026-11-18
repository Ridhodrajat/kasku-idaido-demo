import { ImageResponse } from 'next/og';

export const size = {
  width: 192,
  height: 192,
};
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: 44,
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: 108,
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
            right: 42,
            top: 52,
            width: 22,
            height: 22,
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
