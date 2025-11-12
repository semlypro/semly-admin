import Link from 'next/link';
import Image from 'next/image';

interface SemlyLogoProps {
  /**
   * Width of the logo container
   * @default "w-52" (208px)
   */
  width?: string;
  /**
   * Height of the logo container
   * @default "h-16" (64px)
   */
  height?: string;
  /**
   * Whether to show hover effect (opacity transition)
   * @default false
   */
  showHoverEffect?: boolean;
  /**
   * Whether to link to home page
   * @default true
   */
  linkToHome?: boolean;
  /**
   * Image quality (1-100)
   * @default 100
   */
  quality?: number;
  /**
   * Whether to prioritize loading this image
   * @default true
   */
  priority?: boolean;
  /**
   * Whether to skip Next.js image optimization
   * @default false
   */
  unoptimized?: boolean;
  /**
   * Additional className for the container
   */
  className?: string;
  /**
   * Callback when logo is clicked (if linkToHome is false)
   */
  onClick?: () => void;
}

/**
 * Reusable Semly Pro logo component
 * Displays the /semly-pro-logo.png image with consistent styling
 *
 * @example
 * // Default usage (as in add-project page)
 * <SemlyLogo />
 *
 * @example
 * // Custom size for sidebar
 * <SemlyLogo width="w-40" height="h-12" />
 *
 * @example
 * // Without link
 * <SemlyLogo linkToHome={false} onClick={() => console.log('clicked')} />
 */
export function SemlyLogo({
  width = 'w-52',
  height = 'h-16',
  showHoverEffect = false,
  linkToHome = true,
  quality = 100,
  priority = true,
  unoptimized = false,
  className = '',
  onClick,
}: SemlyLogoProps) {
  const containerClasses = `${width} ${height} relative block ${
    showHoverEffect ? 'group' : ''
  } ${className}`;

  const imageClasses = `object-contain object-left ${
    showHoverEffect ? 'transition-opacity group-hover:opacity-80' : ''
  }`;

  const imageElement = (
    <Image
      src="/semly-pro-logo.png"
      alt="Semly Pro"
      fill
      className={imageClasses}
      quality={quality}
      priority={priority}
      unoptimized={unoptimized}
    />
  );

  if (linkToHome) {
    return (
      <Link href="/" className={containerClasses}>
        {imageElement}
      </Link>
    );
  }

  return (
    <div className={containerClasses} onClick={onClick}>
      {imageElement}
    </div>
  );
}
