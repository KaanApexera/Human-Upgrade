import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar, AppHeader } from "@/components/AppSidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex min-h-screen w-full relative">
        {/* Ambient glow — top-right crimson */}
        <div
          aria-hidden
          style={{
            position: "fixed",
            top: "-320px",
            right: "-180px",
            width: "900px",
            height: "900px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(220,38,38,0.055) 0%, rgba(220,38,38,0.02) 35%, transparent 68%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        {/* Ambient glow — bottom-left violet */}
        <div
          aria-hidden
          style={{
            position: "fixed",
            bottom: "-280px",
            left: "8%",
            width: "720px",
            height: "720px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.04) 0%, rgba(124,58,237,0.015) 35%, transparent 68%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        {/* Noise grain texture */}
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            opacity: 0.028,
            pointerEvents: "none",
            zIndex: 9999,
            mixBlendMode: "soft-light" as const,
          }}
        />
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 relative z-10">
          <AppHeader />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
