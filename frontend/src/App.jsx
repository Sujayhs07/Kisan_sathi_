import React from 'react';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CheckEligibilityPage from './pages/CheckEligibilityPage';
import EligibilityResultsPage from './pages/EligibilityResultsPage';
import SchemeDetailsPage from './pages/SchemeDetailsPage';
import MyRemindersPage from './pages/MyRemindersPage';
import ExploreSchemesPage from './pages/ExploreSchemesPage';
import MyProfilePage from './pages/MyProfilePage';
import ApplicationGuidePage from './pages/ApplicationGuidePage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const { currentPage } = useApp();

  // Full-screen standalone pages
  if (currentPage === 'landing') {
    return <LandingPage />;
  }

  if (currentPage === 'login') {
    return <LoginPage initialMode="login" />;
  }

  if (currentPage === 'register') {
    return <LoginPage initialMode="register" />;
  }

  // Dashboard layout with Left Sidebar (Desktop) / Slide Drawer (Mobile) + Active Page + Bottom Nav (Mobile)
  return (
    <div className="flex min-h-screen bg-cream-100 font-sans selection:bg-maroon-700 selection:text-white">
      {/* Desktop Fixed Sidebar & Mobile Slide-over Drawer */}
      <Sidebar />

      {/* Main Routed Page Content (padded at bottom on mobile to accommodate BottomNav) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-16 md:pb-0">
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'eligibility' && <CheckEligibilityPage />}
        {currentPage === 'results' && <EligibilityResultsPage />}
        {currentPage === 'scheme-details' && <SchemeDetailsPage />}
        {currentPage === 'reminders' && <MyRemindersPage />}
        {currentPage === 'explore' && <ExploreSchemesPage />}
        {currentPage === 'guide' && <ApplicationGuidePage />}
        {currentPage === 'profile' && <MyProfilePage />}
        {currentPage === 'settings' && <SettingsPage />}
      </div>

      {/* Mobile Bottom Navigation Bar (hidden on md and above) */}
      <BottomNav />
    </div>
  );
}
