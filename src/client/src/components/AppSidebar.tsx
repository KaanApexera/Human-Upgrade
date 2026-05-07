import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  FileText,
  Utensils,
  ClipboardList,
  BarChart3,
  Watch,
  Settings,
  Gift,
  LogOut,
  CreditCard,
  Shield,
  ChevronUp,
  Bell,
  Lock,
  Syringe,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

const mainNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    premiumOnly: false,
  },
  {
    title: "Biomarkers",
    url: "/biomarkers",
    icon: FileText,
    hidden: true,
    premiumOnly: false,
  },
  {
    title: "Meal Plan",
    url: "/meal-plan",
    icon: Utensils,
    premiumOnly: true,
  },
  {
    title: "Check-ins",
    url: "/check-ins",
    icon: ClipboardList,
    premiumOnly: true,
  },
  {
    title: "Compare Reports",
    url: "/compare",
    icon: BarChart3,
    premiumOnly: true,
  },
  {
    title: "Devices",
    url: "/integrations",
    icon: Watch,
    premiumOnly: true,
  },
  {
    title: "Reminders",
    url: "/reminders",
    icon: Bell,
    premiumOnly: false,
  },
  {
    title: "GLP-1 & Peptides",
    url: "/glp1",
    icon: Syringe,
    premiumOnly: false,
    highlight: true,
  },
];

const secondaryNavItems = [
  {
    title: "Referrals",
    url: "/referrals",
    icon: Gift,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/logout"),
    onSuccess: () => {
      queryClient.clear();
      setLocation("/login");
    },
  });

  const handleBillingPortal = async () => {
    try {
      const response = await apiRequest("GET", "/api/billing-portal");
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error("Failed to open billing portal");
    }
  };

  const isPremium = user?.subscriptionPlan === "premium_monthly" || user?.subscriptionPlan === "premium_annual";
  const isAdmin = (user as any)?.role === "super_admin";

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="cursor-pointer" data-testid="link-sidebar-logo">
          <Logo size="lg" showText={false} />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.filter((item) => !item.hidden).map((item) => {
                const isLocked = item.premiumOnly && !isPremium;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={!isLocked && location === item.url}
                      onClick={() => isLocked ? setLocation("/pricing") : setLocation(item.url)}
                      className={`${isLocked ? "opacity-60" : ""} ${"highlight" in item && item.highlight ? "text-amber-400 hover:text-amber-300" : ""}`}
                      data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <item.icon className={`w-4 h-4 ${"highlight" in item && item.highlight ? "text-amber-400" : ""}`} />
                      <span className="flex-1">{item.title}</span>
                      {"highlight" in item && item.highlight && !isLocked && (
                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded px-1">NEW</span>
                      )}
                      {isLocked && <Lock className="w-3 h-3 ml-auto text-muted-foreground" />}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={location === item.url}
                    onClick={() => setLocation(item.url)}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location === "/admin"}
                    onClick={() => setLocation("/admin")}
                    data-testid="nav-admin"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => logoutMutation.mutate()}
                  className="text-destructive hover:text-destructive"
                  data-testid="nav-logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="w-full"
                  data-testid="button-user-menu"
                >
                  <div className={`p-0.5 rounded-full ${isPremium ? "bg-gradient-to-br from-brand-red via-red-400 to-brand-red" : "bg-gradient-to-br from-white/20 to-white/5"}`}>
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user?.avatarUrl || undefined} />
                      <AvatarFallback className="bg-[#1a1a22] text-brand-red text-xs font-bold">
                        {user?.name?.[0] || user?.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex flex-col items-start text-left flex-1 min-w-0">
                    <span className="text-sm font-medium truncate w-full">
                      {user?.name || "User"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-dropdown-menu-trigger-width]"
              >
                <div className="px-2 py-1.5">
                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold tracking-wide ${isPremium ? "border-brand-red/40 text-brand-red bg-brand-red/8 badge-premium" : "border-white/15 text-white/50"}`}
                  >
                    {isPremium ? "⬡ Premium" : user?.subscriptionPlan || "Free"}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setLocation("/settings")}
                  data-testid="menu-settings"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleBillingPortal}
                  data-testid="menu-billing"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logoutMutation.mutate()}
                  className="text-destructive focus:text-destructive"
                  data-testid="menu-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppHeader() {
  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 gap-4 sticky top-0 z-40">
      <SidebarTrigger data-testid="button-sidebar-toggle" />
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
