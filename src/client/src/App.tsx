import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CommandPalette, useCommandPalette } from "@/components/CommandPalette";
import { AppLayout } from "@/components/AppLayout";
import { MedicalDisclaimerModal } from "@/components/MedicalDisclaimerModal";
import './i18n';
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Pricing from "@/pages/Pricing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Progress from "@/pages/Progress";
import Biomarkers from "@/pages/Biomarkers";
import SuccessStories from "@/pages/SuccessStories";
import CompareReports from "@/pages/CompareReports";
import Blog from "@/pages/Blog";
import Tutorials from "@/pages/Tutorials";
import Referrals from "@/pages/Referrals";
import CheckIns from "@/pages/CheckIns";
import Admin from "@/pages/Admin";
import Settings from "@/pages/Settings";
import Integrations from "@/pages/Integrations";
import MealPlan from "@/pages/MealPlan";
import Partners from "@/pages/Partners";
import Reminders from "@/pages/Reminders";
import WeeklyReport from "@/pages/WeeklyReport";
import GLP1Insights from "@/pages/GLP1Insights";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/not-found";
import type { User } from "@shared/schema";

function ProtectedRoute({ component: Component, withSidebar = true }: { component: () => JSX.Element | null; withSidebar?: boolean }) {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (withSidebar) {
    return (
      <AppLayout>
        <Component />
      </AppLayout>
    );
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/progress" component={() => <ProtectedRoute component={Progress} />} />
      <Route path="/biomarkers" component={() => <ProtectedRoute component={Biomarkers} />} />
      <Route path="/success-stories" component={SuccessStories} />
      <Route path="/compare" component={() => <ProtectedRoute component={CompareReports} />} />
      <Route path="/blog" component={Blog} />
      <Route path="/tutorials" component={Tutorials} />
      <Route path="/referrals" component={() => <ProtectedRoute component={Referrals} />} />
      <Route path="/check-ins" component={() => <ProtectedRoute component={CheckIns} />} />
      <Route path="/admin" component={() => <ProtectedRoute component={Admin} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route path="/integrations" component={() => <ProtectedRoute component={Integrations} />} />
      <Route path="/meal-plan" component={() => <ProtectedRoute component={MealPlan} />} />
      <Route path="/partners" component={Partners} />
      <Route path="/reminders" component={() => <ProtectedRoute component={Reminders} />} />
      <Route path="/reports/:id" component={() => <ProtectedRoute component={WeeklyReport} />} />
      <Route path="/glp1" component={() => <ProtectedRoute component={GLP1Insights} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { open, setOpen } = useCommandPalette();
  
  return (
    <>
      <MedicalDisclaimerModal />
      <CommandPalette open={open} onOpenChange={setOpen} />
      <Toaster />
      <Router />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="human-upgrade-theme">
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
