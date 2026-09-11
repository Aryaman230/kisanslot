// @ts-expect-error React types are unavailable in this project.
import React, { useMemo } from 'react';

interface TokenQRCodeProps {
  token: string;
  size?: number;
  className?: string;
  showCenterBadge?: boolean;
}

// Deterministic PRNG seeded with string
function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

function createRng(seed: number) {
  let s = seed;
  return () => {
    // Xorshift32
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

export const TokenQRCode: React.FC<TokenQRCodeProps> = ({
  token,
  size = 64,
  className = '',
  showCenterBadge = false,
}: TokenQRCodeProps) => {
  const matrix = useMemo(() => {
    const N = 25; // 25x25 Version 2 QR
    const grid: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
    const isReserved: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));

    // Helper: draw Finder Pattern (7x7)
    const drawFinder = (startX: number, startY: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const x = startX + c;
          const y = startY + r;
          isReserved[y][x] = true;
          // Outer 7x7 border or inner 3x3 box
          if (
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            grid[y][x] = 1;
          } else {
            grid[y][x] = 0;
          }
        }
      }

      // Separators: 1-cell white ring around finders
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const x = startX + c;
          const y = startY + r;
          if (x >= 0 && x < N && y >= 0 && y < N) {
            if (!isReserved[y][x]) {
              isReserved[y][x] = true;
              grid[y][x] = 0;
            }
          }
        }
      }
    };

    // Draw 3 main finders
    drawFinder(0, 0);
    drawFinder(N - 7, 0);
    drawFinder(0, N - 7);

    // Timing patterns on row 6 and col 6
    for (let i = 8; i < N - 8; i++) {
      isReserved[6][i] = true;
      grid[6][i] = i % 2 === 0 ? 1 : 0;

      isReserved[i][6] = true;
      grid[i][6] = i % 2 === 0 ? 1 : 0;
    }

    // Alignment pattern (5x5) at bottom-right (center at 18, 18)
    const ax = 18;
    const ay = 18;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const x = ax + c;
        const y = ay + r;
        if (!isReserved[y][x]) {
          isReserved[y][x] = true;
          if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
            grid[y][x] = 1;
          } else {
            grid[y][x] = 0;
          }
        }
      }
    }

    // Dark module at (4*version + 9, 8) -> for ver 2: (8, 17)
    isReserved[17][8] = true;
    grid[17][8] = 1;

    // Center area reservation if showCenterBadge
    if (showCenterBadge) {
      for (let r = 10; r <= 14; r++) {
        for (let c = 10; c <= 14; c++) {
          isReserved[r][c] = true;
          grid[r][c] = 0;
        }
      }
    }

    // Populate data modules using deterministic pseudo-random stream seeded by the token
    const seed = hashString(token || 'KISANSLOT-A127');
    const rng = createRng(seed);

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (!isReserved[r][c]) {
          // Standard QR module frequency is roughly 50%
          grid[r][c] = rng() > 0.48 ? 1 : 0;
        }
      }
    }

    return grid;
  }, [token, showCenterBadge]);

  const N = matrix.length;

  return React.createElement(
    'div',
    {
      className: `relative select-none inline-block bg-white p-1 rounded-lg ${className}`,
      style: { width: size, height: size },
    },
    React.createElement(
      'svg',
      {
        viewBox: `0 0 ${N} ${N}`,
        className: 'w-full h-full text-slate-900 fill-current',
        shapeRendering: 'crispEdges',
      },
      ...matrix.flatMap((row: number[], y: number) =>
        row
          .map((cell: number, x: number) =>
            cell === 1
              ? React.createElement('rect', {
                  key: `${x}-${y}`,
                  x,
                  y,
                  width: 1,
                  height: 1,
                  fill:
                    (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
                    (x >= N - 5 && x <= N - 3 && y >= 2 && y <= 4) ||
                    (x >= 2 && x <= 4 && y >= N - 5 && y <= N - 3)
                      ? '#2563EB'
                      : '#0F172A',
                })
              : null
          )
          .filter(Boolean)
      )
    ),
    showCenterBadge
      ? React.createElement(
          'div',
          { className: 'absolute inset-0 flex items-center justify-center pointer-events-none' },
          React.createElement(
            'div',
            { className: 'bg-white border-2 border-[#2563EB] shadow-xs px-1.5 py-0.5 rounded text-[10px] font-mono font-black text-[#2563EB]' },
            token
          )
        )
      : null
  );
};
