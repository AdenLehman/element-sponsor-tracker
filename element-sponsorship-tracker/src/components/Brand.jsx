export function HexMark({ color = '#F2F1EC', size = 44 }) {
  return (
    <svg viewBox="0 0 120 104" width={size} height={Math.round(size * 0.87)} role="img" aria-label="Element Gym mark">
      <polygon points="30,5 90,5 115,52 90,99 30,99 5,52" fill="none" stroke={color} strokeWidth="10" />
      <rect x="38" y="30" width="44" height="10" fill={color} />
      <rect x="38" y="47" width="36" height="10" fill={color} />
      <rect x="38" y="64" width="44" height="10" fill={color} />
      <rect x="38" y="30" width="10" height="44" fill={color} />
    </svg>
  );
}

export function Slash({ className, width = 100 }) {
  return (
    <svg className={className} viewBox="0 0 120 60" width={width} height={width / 2} aria-hidden="true">
      <polygon points="20,0 44,0 24,60 0,60" fill="#D1262B" />
      <polygon points="56,0 80,0 60,60 36,60" fill="#D1262B" />
      <polygon points="92,0 116,0 96,60 72,60" fill="#D1262B" />
    </svg>
  );
}
