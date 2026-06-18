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
      <circle cx="50" cy="26" r="12" fill="hsl(var(--foreground))" />

      {/* Shoulders — rounded form with a V-notch where the chest accent nests */}
      <path d="M34 40 L66 40 A8 8 0 0 1 66 56 L57 56 L50 46 L43 56 L34 56 A8 8 0 0 1 34 40 Z" fill="hsl(var(--foreground))" />

      {/* Red triangle — chest accent */}
      <polygon points="50,47.5 58,57 42,57" fill="hsl(var(--primary))" />

      {/* Legs — split capsule */}
      <rect x="26" y="60" width="22" height="13" rx="6.5" fill="hsl(var(--foreground))" />
      <rect x="52" y="60" width="22" height="13" rx="6.5" fill="hsl(var(--foreground))" />
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
