interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: "text-lg" },
    md: { icon: 44, text: "text-xl" },
    lg: { icon: 56, text: "text-2xl" },
    xl: { icon: 72, text: "text-3xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`} data-testid="logo">
      <LogoSymbol size={icon} />
      {showText && (
        <div className={`font-heading font-bold ${text} tracking-wider uppercase`}>
          <span className="text-foreground">Human</span>
          <span className="text-foreground ml-1.5">Upgrade</span>
        </div>
      )}
    </div>
  );
}

export function LogoSymbol({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 ${className}`}
      style={{ minWidth: size, minHeight: size }}
      data-testid="logo-symbol"
    >
      {/* Head */}
      <circle cx="50" cy="18" r="13" fill="#FFFFFF" />

      {/* Shoulders / upper body */}
      <ellipse cx="50" cy="44" rx="28" ry="16" fill="#FFFFFF" />

      {/* Red triangle — chest accent */}
      <path d="M50 34 L66 54 L34 54 Z" fill="#DC2626" />

      {/* Left leg */}
      <rect x="16" y="62" width="30" height="18" rx="9" fill="#FFFFFF" />

      {/* Right leg */}
      <rect x="54" y="62" width="30" height="18" rx="9" fill="#FFFFFF" />
    </svg>
  );
}

export function LogoFull({ size = 120, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`} data-testid="logo-full">
      <LogoSymbol size={size} />
      <div className="font-heading font-bold text-2xl tracking-wider uppercase mt-4 text-center">
        <div className="text-foreground">Human</div>
        <div className="text-foreground">Upgrade</div>
      </div>
    </div>
  );
}

export function LoadingLogo({ size = 80 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center gap-4" data-testid="loading-logo">
      <div className="animate-pulse">
        <LogoSymbol size={size} />
      </div>
      <div className="text-muted-foreground text-sm font-medium">
        Analyzing your biomarkers...
      </div>
    </div>
  );
}
