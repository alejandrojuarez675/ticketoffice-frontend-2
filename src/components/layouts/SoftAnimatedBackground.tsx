// src/components/layouts/SoftAnimatedBackground.tsx
'use client';

import { Box } from '@mui/material';

export default function SoftAnimatedBackground() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        background:
          'radial-gradient(600px 200px at 20% 20%, rgba(99,102,241,.12), transparent 60%),' +
          'radial-gradient(500px 180px at 80% 10%, rgba(16,185,129,.10), transparent 60%),' +
          'radial-gradient(700px 240px at 60% 80%, rgba(236,72,153,.10), transparent 60%)',
        animation: 'bg-pan 18s linear infinite',
        '@keyframes bg-pan': {
          '0%': { backgroundPosition: '0% 0%, 100% 0%, 50% 100%' },
          '50%': { backgroundPosition: '50% 50%, 50% 0%, 0% 50%' },
          '100%': { backgroundPosition: '0% 0%, 100% 0%, 50% 100%' },
        },
      }}
    />
  );
}
