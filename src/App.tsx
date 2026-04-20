import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { LogOut, TreePine as Tree, Sparkles, LayoutDashboard, User, FileText } from 'lucide-react';
import { cn } from './lib/utils';
import { AppProvider, useAppContext } from './context/AppContext';

// Import Screens
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import ObservationForm from './components/ObservationForm';
import SubmitScreen from './components/SubmitScreen';
import ReportScreen from './components/ReportScreen';
import AdminScreen from './components/AdminScreen';

// Import Modals
import { PastReportsModal, DeleteConfirmationModal, ChangeTeacherClassModal } from './components/Modals';

function AppUI() {
  const { 
    currentTeacher, setCurrentTeacher, 
    isAdmin, setIsAdmin 
  } = useAppContext();
  
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentTeacher(null);
    setIsAdmin(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-[#2D2D2D] font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Tree size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-emerald-900 leading-none">Mind Garden</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 mt-1">A Smart Start Preschool</p>
          </div>
        </div>
        {currentTeacher || isAdmin ? (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">{isAdmin ? 'Administrator' : currentTeacher?.designation}</p>
              <p className="text-sm font-semibold">{isAdmin ? 'Admin Panel' : currentTeacher?.name}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 hover:text-rose-500 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : null}
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* @ts-expect-error - React 19 types issue with react-router-dom Routes key */}
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to={isAdmin ? "/admin" : currentTeacher ? "/home" : "/login"} replace />} />
            <Route path="/login" element={!currentTeacher && !isAdmin ? <LoginScreen /> : <Navigate to={isAdmin ? "/admin" : "/home"} replace />} />
            
            {/* Protected Routes */}
            <Route path="/home" element={currentTeacher ? <HomeScreen /> : <Navigate to={isAdmin ? "/admin" : "/login"} replace />} />
            <Route path="/form" element={currentTeacher ? <ObservationForm /> : <Navigate to={isAdmin ? "/admin" : "/login"} replace />} />
            <Route path="/submit" element={currentTeacher ? <SubmitScreen /> : <Navigate to={isAdmin ? "/admin" : "/login"} replace />} />
            <Route path="/report" element={currentTeacher || isAdmin ? <ReportScreen /> : <Navigate to="/login" replace />} />
            <Route path="/admin" element={isAdmin ? <AdminScreen /> : <Navigate to={currentTeacher ? "/home" : "/login"} replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Modals */}
      <PastReportsModal />
      <DeleteConfirmationModal />
      <ChangeTeacherClassModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppUI />
      </AppProvider>
    </BrowserRouter>
  );
}
