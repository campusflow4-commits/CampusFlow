import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Navbar } from './components/Navbar.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { Footer } from './components/Footer.jsx';

// Pages
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { SkillExchangePage } from './pages/SkillExchangePage.jsx';
import { SmartMatchesPage } from './pages/SmartMatchesPage.jsx';
import { VideosPage } from './pages/VideosPage.jsx';
import { QuizPage } from './pages/QuizPage.jsx';
import { DoubtsPage } from './pages/DoubtsPage.jsx';
import { PlannerPage } from './pages/PlannerPage.jsx';
import { NotesPage } from './pages/NotesPage.jsx';
import { ChatPage } from './pages/ChatPage.jsx';
import { InviteFriendsPage } from './pages/InviteFriendsPage.jsx';
import { ReportsPage } from './pages/ReportsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

function AppRoutes() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Apply persisted font preference across the entire application
  useEffect(() => {
    const savedFont = localStorage.getItem('campusflow_font') || 'default';
    if (savedFont && savedFont !== 'default') {
      document.documentElement.setAttribute('data-font', savedFont);
      document.body.setAttribute('data-font', savedFont);
    } else {
      document.documentElement.removeAttribute('data-font');
      document.body.removeAttribute('data-font');
    }
  }, []);

  // Public visitor layout (Landing, Login, Register)
  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    );
  }

  // Authenticated Student App Layout (Left Vertical Sidebar + Top Header + Content Area)
  return (
    <div className="app-shell">
      {/* Left Vertical Sidebar with Grouped Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="app-main">
        <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
        <main className="app-body">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/register" element={<Navigate to="/dashboard" replace />} />

            {/* Protected Student Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/swaps" element={<SkillExchangePage />} />
              <Route path="/matches" element={<SmartMatchesPage />} />
              <Route path="/videos" element={<VideosPage />} />
              <Route path="/quizzes" element={<QuizPage />} />
              <Route path="/doubts" element={<DoubtsPage />} />
              <Route path="/planner" element={<PlannerPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/invite" element={<InviteFriendsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}
