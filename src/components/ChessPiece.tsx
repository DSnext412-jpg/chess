import { useId } from 'react';
import type { Color, PieceType } from '../types/chess';
import type { PieceColors, PieceTheme } from '../lib/themes';

interface ChessPieceProps {
  type: PieceType;
  color: Color;
  theme: PieceTheme;
  className?: string;
  title?: string;
}

interface PieceInternals {
  colors: PieceColors;
  body: string;
  base: string;
  head: string;
  gloss: string;
  outline: string;
}

function Base({ base, outline }: { base: string; outline: string }) {
  return (
    <>
      <ellipse cx="50" cy="105" rx="27" ry="6" fill="#000" opacity="0.28" />
      <path
        d="M25 98.5C25 94.6 30.6 91.5 50 91.5s25 3.1 25 7L73.2 103c-3.2 4-11.8 6.4-23.2 6.4S29.8 107 26.6 103L25 98.5Z"
        fill={`url(#${base})`}
        stroke={outline}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <ellipse
        cx="50"
        cy="98.2"
        rx="25"
        ry="5.7"
        fill={`url(#${base})`}
        stroke={outline}
        strokeWidth="0.8"
      />
      <ellipse cx="43" cy="96.5" rx="10" ry="2.2" fill="#fff" opacity="0.18" />
    </>
  );
}

function Gloss({
  d,
  color = '#fff',
  opacity = 0.3,
  width = 2,
}: {
  d: string;
  color?: string;
  opacity?: number;
  width?: number;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeOpacity={opacity}
      strokeWidth={width}
      strokeLinecap="round"
    />
  );
}

function Pawn({ colors, body, base, head, outline }: PieceInternals) {
  return (
    <>
      <Base base={base} outline={outline} />
      <path
        d="M36.5 91c0-7.4 2.8-12.5 8.4-15.4h10.2c5.6 2.9 8.4 8 8.4 15.4Z"
        fill={`url(#${body})`}
        stroke={outline}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <ellipse
        cx="50"
        cy="76"
        rx="12.5"
        ry="3.6"
        fill={colors.bodyMid}
        stroke={outline}
        strokeWidth="0.9"
      />
      <circle
        cx="50"
        cy="54"
        r="17.5"
        fill={`url(#${head})`}
        stroke={outline}
        strokeWidth="1.1"
      />
      <ellipse cx="43.5" cy="47" rx="5.6" ry="7.6" fill="#fff" opacity="0.28" />
      <Gloss d="M35.5 88.5c.5-5.2 2.1-9 5.3-11.7" opacity={0.22} width={1.4} />
      <Gloss d="M38.5 58.5c2.8-6.7 7.5-10.8 12.6-11.4" opacity={0.24} width={1.6} />
    </>
  );
}

function Rook({ colors, body, base, outline }: PieceInternals) {
  return (
    <>
      <Base base={base} outline={outline} />
      <path
        d="M35.5 91.5 38.7 47h22.6l3.2 44.5Z"
        fill={`url(#${body})`}
        stroke={outline}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M31.5 47.5V29h8.2v6.2h6.1V29h8.4v6.2h6.1V29h8.2v18.5Z"
        fill={`url(#${body})`}
        stroke={outline}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M32.5 55.5h35M33.5 81.5h33M34.5 87.5h31"
        stroke={colors.bodyDark}
        strokeOpacity="0.5"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <Gloss d="M41 52.5v25M43.5 33v8" opacity={0.22} width={1.5} />
      <rect x="39" y="59" width="22" height="3" rx="1.5" fill="#fff" opacity="0.1" />
    </>
  );
}

function Knight({ colors, body, base, outline }: PieceInternals) {
  return (
    <>
      <Base base={base} outline={outline} />
      <path
        d="M31.5 92c-1.2-8.5 1-15.4 6.6-20.6 4.2-3.9 8.4-5.2 12.2-4.1-2.8-6.4-1.5-13.1 4-19.2 4.1-4.5 8.9-7.4 14.3-8.7l2.4-9.9 6.8 9.2c7.3 7.2 8.6 16.4 3.5 25.4-2.4 4.2-7 7.7-9.5 12.2-2.5 4.5-2.8 10.4-1.5 15.7Z"
        fill={`url(#${body})`}
        stroke={outline}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="m69.2 20.8 1.3 8.2 5.7 5.9-2.1-11.4Z"
        fill={colors.bodyMid}
        stroke={outline}
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <path
        d="M46.7 69.8c-4.1-8.6-1.8-17.4 6.7-25.7 3.4-3.3 6.6-6.4 9.4-10.2-1.1 8.7-4.8 15.2-9.4 20.1-3.7 4-5.5 8.5-6.7 15.8Z"
        fill={colors.bodyDark}
        opacity="0.34"
      />
      <circle cx="66.6" cy="41.6" r="1.8" fill={colors.outline} />
      <circle cx="69.4" cy="49.3" r="1.2" fill={colors.outline} opacity="0.8" />
      <path
        d="M56.5 49.6c3.3 1.8 5.6 4.3 6.9 7.5"
        stroke={colors.highlight}
        strokeOpacity="0.36"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <Gloss d="M37 88.5c-.4-5.5.7-10.1 3.1-13.6" opacity={0.22} width={1.5} />
      <Gloss d="M51.5 62.5c4.7-10.4 10.4-18.2 17-23.6" opacity={0.26} width={1.8} />
      <path
        d="M43.7 86.7h22.2"
        stroke={colors.bodyDark}
        strokeOpacity="0.42"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </>
  );
}

function Bishop({ colors, body, base, head, outline }: PieceInternals) {
  return (
    <>
      <Base base={base} outline={outline} />
      <path
        d="M39 91.5c.8-10.7 4.4-18.5 11-23.5 6.6 5 10.2 12.8 11 23.5Z"
        fill={`url(#${body})`}
        stroke={outline}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <ellipse
        cx="50"
        cy="68"
        rx="13.7"
        ry="4"
        fill={`url(#${base})`}
        stroke={outline}
        strokeWidth="0.9"
      />
      <path
        d="M50 16.8c6.4 7.4 13.3 17.5 13.3 27.8 0 11.3-6.4 18-13.3 18s-13.3-6.7-13.3-18c0-10.3 6.9-20.4 13.3-27.8Z"
        fill={`url(#${head})`}
        stroke={outline}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="13.8" r="4.2" fill={`url(#${head})`} stroke={outline} strokeWidth="1" />
      <path
        d="M50 31.5v17.2M44.5 38h11"
        stroke={colors.outline}
        strokeOpacity="0.75"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <Gloss d="M42 72.5c1-7.6 3-13.1 6.2-17" opacity={0.22} width={1.4} />
      <Gloss d="M43.3 57.5c2.1-8.8 6-16 10.3-21.5" opacity={0.27} width={1.7} />
      <ellipse cx="45" cy="35" rx="4" ry="7" fill="#fff" opacity="0.16" />
    </>
  );
}

function Queen({ colors, body, base, head, outline }: PieceInternals) {
  return (
    <>
      <Base base={base} outline={outline} />
      <path
        d="M36.5 91.5c.7-9 2.8-18.4 5.7-24.8 1.9-4.1 3-8.3 2.6-12.7h10.4c-.4 4.4.7 8.6 2.6 12.7 2.9 6.4 5 15.8 5.7 24.8Z"
        fill={`url(#${body})`}
        stroke={outline}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <ellipse
        cx="50"
        cy="53.5"
        rx="14.5"
        ry="4.2"
        fill={`url(#${base})`}
        stroke={outline}
        strokeWidth="0.9"
      />
      <path
        d="M34.5 52.5 28.5 27l10.8 10.5L44.5 18l5.5 16.4L55.5 18l5.2 19.5L71.5 27l-6 25.5Z"
        fill={`url(#${head})`}
        stroke={outline}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      {[
        [28.5, 25.5],
        [44.5, 16],
        [55.5, 16],
        [71.5, 25.5],
      ].map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="2.9"
          fill={`url(#${head})`}
          stroke={outline}
          strokeWidth="0.9"
        />
      ))}
      <path
        d="M36 57.5h28"
        stroke={colors.bodyDark}
        strokeOpacity="0.5"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <Gloss d="M41.5 74.5c.6-7.4 1.9-13.1 4.1-17.4" opacity={0.24} width={1.6} />
      <Gloss d="M38.7 49.5 35.8 35" opacity={0.25} width={1.6} />
      <ellipse cx="44" cy="37" rx="3.8" ry="8" fill="#fff" opacity="0.14" />
    </>
  );
}

function King({ colors, body, base, head, outline }: PieceInternals) {
  return (
    <>
      <Base base={base} outline={outline} />
      <path
        d="M36.8 91.5c.7-9.2 3-18 6.1-23.8L45 64h10l2.1 3.7c3.1 5.8 5.4 14.6 6.1 23.8Z"
        fill={`url(#${body})`}
        stroke={outline}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <ellipse
        cx="50"
        cy="63.5"
        rx="14"
        ry="4"
        fill={`url(#${base})`}
        stroke={outline}
        strokeWidth="0.9"
      />
      <path
        d="M35.5 62.5 34 40.5l9.1 7.6L50 34l6.9 14.1 9.1-7.6-1.5 22Z"
        fill={`url(#${head})`}
        stroke={outline}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <rect x="46.5" y="11" width="7" height="21" rx="2.2" fill={`url(#${head})`} stroke={outline} strokeWidth="1" />
      <rect x="39.5" y="17.5" width="21" height="7" rx="2.2" fill={`url(#${head})`} stroke={outline} strokeWidth="1" />
      <path
        d="M37.5 67.5h25"
        stroke={colors.bodyDark}
        strokeOpacity="0.48"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <Gloss d="M42 76.5c.7-6.4 1.9-11 3.8-14.5" opacity={0.24} width={1.6} />
      <Gloss d="M38.5 59 37.6 45" opacity={0.26} width={1.5} />
      <ellipse cx="44" cy="47" rx="3.5" ry="7" fill="#fff" opacity="0.14" />
    </>
  );
}

export function ChessPiece({
  type,
  color,
  theme,
  className = '',
  title,
}: ChessPieceProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const colors = color === 'w' ? theme.white : theme.black;
  const body = `body-${uid}`;
  const base = `base-${uid}`;
  const head = `head-${uid}`;

  const internals: PieceInternals = {
    colors,
    body,
    base,
    head,
    gloss: colors.highlight,
    outline: colors.outline,
  };

  return (
    <svg
      viewBox="0 0 100 112"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={body} x1="0.16" y1="0" x2="0.86" y2="1">
          <stop offset="0" stopColor={colors.highlight} />
          <stop offset="0.2" stopColor={colors.body} />
          <stop offset="0.62" stopColor={colors.bodyMid} />
          <stop offset="1" stopColor={colors.bodyDark} />
        </linearGradient>
        <linearGradient id={base} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={colors.bodyMid} />
          <stop offset="0.45" stopColor={colors.base} />
          <stop offset="1" stopColor={colors.baseDark} />
        </linearGradient>
        <radialGradient id={head} cx="0.36" cy="0.26" r="0.85">
          <stop offset="0" stopColor={colors.highlight} />
          <stop offset="0.28" stopColor={colors.body} />
          <stop offset="0.7" stopColor={colors.bodyMid} />
          <stop offset="1" stopColor={colors.bodyDark} />
        </radialGradient>
      </defs>
      {type === 'p' && <Pawn {...internals} />}
      {type === 'r' && <Rook {...internals} />}
      {type === 'n' && <Knight {...internals} />}
      {type === 'b' && <Bishop {...internals} />}
      {type === 'q' && <Queen {...internals} />}
      {type === 'k' && <King {...internals} />}
    </svg>
  );
}
