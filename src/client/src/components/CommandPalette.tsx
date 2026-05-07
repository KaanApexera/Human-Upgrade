import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Command } from "cmdk";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/components/ThemeProvider";
import {
  LayoutDashboard,
  Upload,
  TrendingUp,
  Settings,
  CreditCard,
  HelpCircle,
  Sun,
  Moon,
  Search,
  FileText,
  Users,
  BookOpen,
  Video,
  Gift,
  Activity,
  Beaker,
  X,
} from "lucide-react";
import type { User } from "@shared/schema";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState("");

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const isLoggedIn = !!user;

  const runCommand = useCallback((command: () => void) => {
    onOpenChange(false);
    command();
  }, [onOpenChange]);

  const navigationItems = [
    { icon: LayoutDashboard, label: "Dashboard", shortcut: "D", action: () => setLocation("/dashboard"), requiresAuth: true },
    { icon: Upload, label: "Upload Bloodwork", shortcut: "U", action: () => setLocation("/dashboard"), requiresAuth: true },
    { icon: TrendingUp, label: "View Progress", shortcut: "P", action: () => setLocation("/progress"), requiresAuth: true },
    { icon: Activity, label: "Compare Reports", shortcut: "C", action: () => setLocation("/compare"), requiresAuth: true },
    { icon: Beaker, label: "Biomarker Library", shortcut: "B", action: () => setLocation("/biomarkers"), requiresAuth: false },
    { icon: CreditCard, label: "Pricing", shortcut: "R", action: () => setLocation("/pricing"), requiresAuth: false },
    { icon: Gift, label: "Referrals", shortcut: "F", action: () => setLocation("/referrals"), requiresAuth: true },
    { icon: BookOpen, label: "Blog", shortcut: "L", action: () => setLocation("/blog"), requiresAuth: false },
    { icon: Video, label: "Tutorials", shortcut: "T", action: () => setLocation("/tutorials"), requiresAuth: false },
    { icon: Users, label: "Success Stories", shortcut: "S", action: () => setLocation("/success-stories"), requiresAuth: false },
  ];

  const actionItems = [
    { 
      icon: theme === "dark" ? Sun : Moon, 
      label: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode", 
      shortcut: "M", 
      action: () => setTheme(theme === "dark" ? "light" : "dark"),
      requiresAuth: false 
    },
    { icon: FileText, label: "Privacy Policy", action: () => setLocation("/privacy"), requiresAuth: false },
    { icon: FileText, label: "Terms of Service", action: () => setLocation("/terms"), requiresAuth: false },
    { icon: HelpCircle, label: "Help & Support", action: () => window.open("mailto:support@humanupgradeos.com", "_blank"), requiresAuth: false },
  ];

  const filteredNavItems = navigationItems.filter(item => 
    !item.requiresAuth || isLoggedIn
  );

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command Palette"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
    >
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        data-testid="command-palette-backdrop"
      />
      <div className="relative w-full max-w-xl mx-4 glass-card border border-white/20 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search for pages, actions..."
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base"
            data-testid="input-command-search"
          />
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover-elevate rounded-md"
            data-testid="button-close-command"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        
        <Command.List className="max-h-[50vh] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-muted-foreground text-sm">
            No results found.
          </Command.Empty>

          <Command.Group heading="Navigation" className="text-xs text-muted-foreground px-2 py-1.5">
            {filteredNavItems.map((item) => (
              <Command.Item
                key={item.label}
                value={item.label}
                onSelect={() => runCommand(item.action)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover-elevate data-[selected=true]:bg-white/10"
                data-testid={`command-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1 text-foreground">{item.label}</span>
                {item.shortcut && (
                  <kbd className="px-1.5 py-0.5 text-xs bg-white/5 rounded border border-white/10 text-muted-foreground">
                    {item.shortcut}
                  </kbd>
                )}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Actions" className="text-xs text-muted-foreground px-2 py-1.5 mt-2">
            {actionItems.map((item) => (
              <Command.Item
                key={item.label}
                value={item.label}
                onSelect={() => runCommand(item.action)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover-elevate data-[selected=true]:bg-white/10"
                data-testid={`command-action-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1 text-foreground">{item.label}</span>
                {item.shortcut && (
                  <kbd className="px-1.5 py-0.5 text-xs bg-white/5 rounded border border-white/10 text-muted-foreground">
                    {item.shortcut}
                  </kbd>
                )}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>

        <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white/5 rounded border border-white/10">↑</kbd>
              <kbd className="px-1 py-0.5 bg-white/5 rounded border border-white/10">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white/5 rounded border border-white/10">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-white/5 rounded border border-white/10">esc</kbd>
            <span>to close</span>
          </span>
        </div>
      </div>
    </Command.Dialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { open, setOpen };
}
