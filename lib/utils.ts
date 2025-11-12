import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert hex color to oklch format
 * @param hex - Hex color string (e.g., "#0f172a" or "0f172a")
 * @returns oklch color string (e.g., "oklch(0.205 0 0)")
 */
export function hexToOklch(hex: string): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Validate hex format
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    console.warn(`Invalid hex color: ${hex}, using fallback`);
    return 'oklch(0.5 0 0)'; // Fallback to gray
  }

  // Convert hex to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  // Convert RGB to linear RGB
  const linearR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const linearG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const linearB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // Convert to XYZ color space
  const x = linearR * 0.4124564 + linearG * 0.3575761 + linearB * 0.1804375;
  const y = linearR * 0.2126729 + linearG * 0.7151522 + linearB * 0.072175;
  const z = linearR * 0.0193339 + linearG * 0.119192 + linearB * 0.9503041;

  // Convert to Lab color space
  const xn = 0.95047;
  const yn = 1.0;
  const zn = 1.08883;

  const fx =
    x / xn > 0.008856 ? Math.pow(x / xn, 1 / 3) : (7.787 * x) / xn + 16 / 116;
  const fy =
    y / yn > 0.008856 ? Math.pow(y / yn, 1 / 3) : (7.787 * y) / yn + 16 / 116;
  const fz =
    z / zn > 0.008856 ? Math.pow(z / zn, 1 / 3) : (7.787 * z) / zn + 16 / 116;

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b_lab = 200 * (fy - fz);

  // Convert Lab to oklch
  const C = Math.sqrt(a * a + b_lab * b_lab);
  const h = (Math.atan2(b_lab, a) * 180) / Math.PI;

  // Normalize lightness to 0-1 range
  const lightness = Math.max(0, Math.min(1, L / 100));

  // Handle achromatic colors (no chroma)
  if (C < 0.001) {
    return `oklch(${lightness.toFixed(3)} 0 0)`;
  }

  // Convert chroma to oklch range (approximate)
  const chroma = Math.min(0.4, C / 100);

  return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${h.toFixed(1)})`;
}

/**
 * Convert a theme object with hex colors to oklch format
 * @param theme - Theme object with hex color properties
 * @returns Theme object with oklch color properties
 */
export function convertThemeToOklch(
  theme: Record<string, unknown>
): Record<string, unknown> {
  const convertedTheme = { ...theme };

  // List of color properties that should be converted
  const colorProperties = [
    'primary',
    'secondary',
    'accent',
    'background',
    'foreground',
    'card',
    'cardForeground',
    'popover',
    'popoverForeground',
    'muted',
    'mutedForeground',
    'border',
    'input',
    'ring',
    'destructive',
    'destructiveForeground',
  ];

  colorProperties.forEach(prop => {
    if (convertedTheme[prop] && typeof convertedTheme[prop] === 'string') {
      // Check if it's a hex color (starts with # or is 6 hex digits)
      if (convertedTheme[prop].match(/^#?[0-9A-Fa-f]{6}$/)) {
        convertedTheme[prop] = hexToOklch(convertedTheme[prop]);
      }
    }
  });

  return convertedTheme;
}
