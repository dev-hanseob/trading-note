import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: '#059669',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10l4-4V5a2 2 0 0 0-2-2H6z"
            fill="white"
            fillOpacity="0.9"
          />
          <path
            d="M8 13l2 2 2-3 2 1.5"
            stroke="rgba(5,150,105,0.8)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
