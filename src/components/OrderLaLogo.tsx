import React from 'react';

export type LogoVariant = 'badge' | 'icon' | 'circle' | 'horizontal' | 'symbol';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface OrderLaLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  showSubtitle?: boolean;
  subtitleText?: string;
}

const sizeMap: Record<LogoSize, { px: number; textClass: string; subTextClass: string }> = {
  xs: { px: 24, textClass: 'text-xs', subTextClass: 'text-[9px]' },
  sm: { px: 32, textClass: 'text-sm', subTextClass: 'text-[10px]' },
  md: { px: 40, textClass: 'text-base', subTextClass: 'text-xs' },
  lg: { px: 52, textClass: 'text-lg', subTextClass: 'text-xs' },
  xl: { px: 68, textClass: 'text-2xl', subTextClass: 'text-sm' },
  '2xl': { px: 96, textClass: 'text-3xl', subTextClass: 'text-base' }
};

export const OrderLaLogo: React.FC<OrderLaLogoProps> = ({
  variant = 'badge',
  size = 'md',
  className = '',
  showSubtitle = false,
  subtitleText = 'Wholesale Business OS'
}) => {
  const { px, textClass, subTextClass } = sizeMap[size];

  // The Exact OrderLa Icon SVG reproducing the uploaded design
  const renderSvgIcon = (withTextInside: boolean, isCircleBadge: boolean = false) => (
    <svg
      viewBox="0 0 200 200"
      width={px}
      height={px}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-sm transition-transform hover:scale-105"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <defs>
        {/* Main Blue Gradient */}
        <linearGradient id="orderlaBlueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0091FF" />
          <stop offset="50%" stopColor="#007BFF" />
          <stop offset="100%" stopColor="#0062E3" />
        </linearGradient>

        {/* Soft Specular Top Highlight */}
        <linearGradient id="orderlaHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Shadow for truck checkmark */}
        <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#004399" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* 1. Rounded Square or Circle Background Badge */}
      <rect
        x="2"
        y="2"
        width="196"
        height="196"
        rx={isCircleBadge ? 98 : 46}
        fill="url(#orderlaBlueGrad)"
      />
      {/* Specular Top Shimmer */}
      <rect
        x="3"
        y="3"
        width="194"
        height="100"
        rx={isCircleBadge ? 97 : 45}
        fill="url(#orderlaHighlight)"
      />

      {/* 2. Left Horizontal Speed Trails */}
      <g fill="#FFFFFF">
        <rect x="22" y="84" width="22" height="6.5" rx="3.25" opacity="0.95" />
        <rect x="14" y="96" width="34" height="6.5" rx="3.25" opacity="0.95" />
        <rect x="24" y="108" width="18" height="6.5" rx="3.25" opacity="0.9" />
      </g>

      {/* 3. Truck Cab & Flatbed Body */}
      <g fill="#FFFFFF" filter="url(#softGlow)">
        {/* Flatbed platform */}
        <path
          d="M38 108H132V115C132 116.657 130.657 118 129 118H41C39.3431 118 38 116.657 38 115V108Z"
        />

        {/* Truck Cab with Sloped Windshield */}
        <path
          d="M126 68H143C145.5 68 147.8 69.3 149 71.4L165.2 97.4C166.4 99.2 167 101.3 167 103.5V114C167 116.2 165.2 118 163 118H126V68Z"
        />

        {/* Cab Door / Window Cutout (Blue fill inside) */}
        <path
          d="M132 74H142.5C144 74 145.2 74.8 145.9 76.1L156.4 94.6C157.1 95.8 156.9 97.2 155.8 97.8C155.4 98 154.9 98.1 154.4 98.1H132V74Z"
          fill="#0074F0"
        />

        {/* Circular Cargo Hub Ring */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M74 42C93.8823 42 110 58.1177 110 78C110 97.8823 93.8823 114 74 114C54.1177 114 38 97.8823 38 78C38 58.1177 54.1177 42 74 42ZM74 54C87.2548 54 98 64.7452 98 78C98 91.2548 87.2548 102 74 102C60.7452 102 50 91.2548 50 78C50 64.7452 60.7452 54 74 54Z"
        />

        {/* Dynamic Soaring Checkmark Arrow piercing upward and rightward */}
        {/* Checkmark arm rising up to piercing arrowhead */}
        <path
          d="M58 74L86 102L132 46L143 56L88 116L48 76L58 74Z"
        />
        {/* Arrowhead at the top right */}
        <path
          d="M145 34L144 65L131 52L116 57L145 34Z"
        />

        {/* Rear Wheel */}
        <circle cx="68" cy="118" r="16" />
        <circle cx="68" cy="118" r="7.5" fill="#0074F0" />

        {/* Front Wheel */}
        <circle cx="148" cy="118" r="16" />
        <circle cx="148" cy="118" r="7.5" fill="#0074F0" />
      </g>

      {/* 4. Optional Text "OrderLa" and Red Accent Dot inside badge */}
      {withTextInside && (
        <g>
          <text
            x="100"
            y="166"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontSize="32"
            fontWeight="800"
            fill="#FFFFFF"
            letterSpacing="-0.5px"
          >
            OrderLa
          </text>
          {/* Signature Coral-Red Accent Dot above the 'La' */}
          <circle cx="142" cy="136" r="4.5" fill="#FF453A" />
        </g>
      )}
    </svg>
  );

  // Variant 1: Complete App Icon Badge (matches the uploaded concept image 100%)
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderSvgIcon(true)}
      </div>
    );
  }

  // Variant 2: Compact Icon Only (Square truck icon badge without text inside)
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {renderSvgIcon(false, false)}
      </div>
    );
  }

  // Variant 2b: Circular Brand Icon Only (Circle truck icon badge without text inside)
  if (variant === 'circle') {
    return (
      <div className={`inline-flex items-center justify-center rounded-full overflow-hidden ${className}`}>
        {renderSvgIcon(false, true)}
      </div>
    );
  }

  // Variant 3: Horizontal Layout (Icon Badge + Crisp Typography with the Red Dot)
  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
        {renderSvgIcon(false)}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black text-[var(--text-main)] tracking-tight ${textClass} flex items-center`}>
              Order
              <span className="relative">
                La
                {/* Signature Red Dot over the La */}
                <span className="absolute -top-1 right-0 w-1.5 h-1.5 rounded-full bg-[#FF453A] animate-pulse" />
              </span>
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-[var(--accent-blue)]/15 text-[var(--accent-blue)] uppercase tracking-wider">
              BOS
            </span>
          </div>
          {showSubtitle && (
            <span className={`text-[var(--text-secondary)] font-semibold mt-0.5 ${subTextClass}`}>
              {subtitleText}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Variant 4: Pure Vector Symbol (Transparent truck + arrow with theme colors)
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 160 120"
        width={px}
        height={(px * 3) / 4}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <g fill="currentColor">
          <rect x="2" y="52" width="22" height="5" rx="2.5" opacity="0.9" />
          <rect x="0" y="62" width="30" height="5" rx="2.5" opacity="0.9" />
          <rect x="4" y="72" width="16" height="5" rx="2.5" opacity="0.8" />
          <path d="M24 70H112V76C112 77.5 110.5 78.5 109 78.5H26C24.5 78.5 23.5 77.5 23.5 76V70Z" />
          <path d="M106 38H122C124 38 126 39.2 127 41L141 63C142 64.5 142.5 66.2 142.5 68V76C142.5 77.5 141.2 78.5 139.5 78.5H106V38Z" />
          <path fillRule="evenodd" clipRule="evenodd" d="M60 18C76 18 90 31.5 90 47.5C90 63.5 76 77 60 77C44 77 31 63.5 31 47.5C31 31.5 44 18 60 18ZM60 28C70.5 28 79 36.7 79 47.5C79 58.3 70.5 67 60 67C49.5 67 41 58.3 41 47.5C41 36.7 49.5 28 60 28Z" />
          <path d="M48 44L70 66L110 20L118 28L72 78L40 46L48 44Z" />
          <path d="M120 12L119 36L108 26L96 30L120 12Z" />
          <circle cx="54" cy="78" r="13" />
          <circle cx="124" cy="78" r="13" />
        </g>
      </svg>
    </div>
  );
};
