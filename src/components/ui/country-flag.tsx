import React from 'react';
import { cn } from '@/lib/utils';

type CountryFlagProps = {
  iso: string;              // ISO 3166-1 alpha-2, e.g., 'ZA'
  className?: string;
  alt?: string;
  size?: number;            // Height in px; width auto-maintains aspect ratio
};

export function CountryFlag({ iso, className, alt, size = 16 }: CountryFlagProps) {
  const lower = (iso || '').toLowerCase();
  // FlagCDN small PNGs; provide srcSet for crispness on hidpi
  const src = `https://flagcdn.com/w${size}/${lower}.png`;
  const srcSet = `https://flagcdn.com/w${size * 2}/${lower}.png 2x, https://flagcdn.com/w${size * 3}/${lower}.png 3x`;
  const title = alt || `${iso} flag`;

  // Basic fallback to emoji if image fails
  const [failed, setFailed] = React.useState(false);
  const emoji = iso
    ? String.fromCodePoint(127397 + iso.charCodeAt(0), 127397 + iso.charCodeAt(1))
    : '';

  if (failed) {
    return <span className={cn('inline-block align-middle', className)} aria-label={title} title={title}>{emoji}</span>;
  }

  return (
    <img
      alt={title}
      title={title}
      src={src}
      srcSet={srcSet}
      loading="lazy"
      className={cn('inline-block h-4 w-auto rounded-[2px] align-middle', className)}
      width={size * 1.5}
      height={size}
      onError={() => setFailed(true)}
    />
  );
}
