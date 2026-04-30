import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import SiteLayout from './components/site/SiteLayout';
import AppLayout from './components/app/AppLayout';
import Landing from './pages/Landing';
import Docs from './pages/Docs';
import Concepts from './pages/Concepts';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import PolicyBuilder from './pages/PolicyBuilder';
import Explorer from './pages/Explorer';
import Playground from './pages/Playground';
import Alerting from './pages/Alerting';
import Swarm from './pages/Swarm';
import Team from './pages/Team';
import Onboarding from './pages/Onboarding';
import { AlertNotificationProvider } from '@/lib/alertContext';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Public marketing/docs site */}
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/concepts" element={<Concepts />} />
      </Route>

      {/* App */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/agents" element={<Agents />} />
        <Route path="/policy-builder" element={<PolicyBuilder />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/swarm" element={<Swarm />} />
        <Route path="/alerting" element={<Alerting />} />
        <Route path="/explorer" element={<Explorer />} />
        <Route path="/team" element={<Team />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <AlertNotificationProvider>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </AlertNotificationProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App