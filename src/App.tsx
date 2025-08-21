import React, { useState, useEffect } from 'react';
import { User as CustomUser, UserRole } from '../types.ts';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';
import Dashboard from '../components/Dashboard.tsx';
import AdminPanel from '../components/AdminPanel.tsx';
import UserProfile from '../components/feature/UserProfile.tsx';
import CoinDetailPage from '../components/feature/CoinDetailPage.tsx';
import DepositPage from '../components/feature/DepositPage.tsx';
import AuthPage from '../components/feature/AuthPage.tsx';
import { LogoIcon, DashboardIcon, AdminIcon, UserIcon, DepositIcon, LogoutIcon } from '../components/shared/Icons.tsx';
import { getUserProfile, updateUserProfile } from '../services/firebaseService.ts';

type ActiveView = 'dashboard' | 'admin' | 'profile' | 'coinDetail' | 'deposit';

const App: React.FC = () => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.USER);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [detailCoinId, setDetailCoinId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userProfile = await getUserProfile(fbUser.uid);
        if (userProfile) {
            setUser(userProfile);
            setActiveRole(userProfile.role);
            setActiveView(userProfile.role === UserRole.ADMIN ? 'admin' : 'dashboard');
        } else {
            setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveRole(UserRole.USER);
      setActiveView('dashboard');
    } catch (error) {
      console.error("Logout error", error);
    }
  };
  
  const handleUserUpdate = async (updatedUser: CustomUser) => {
      setUser(updatedUser);
      if (firebaseUser) {
          try {
              await updateUserProfile(firebaseUser.uid, updatedUser);
          } catch (error) {
              console.error("Kullanıcı verisi Firestore'a kaydedilirken hata oluştu:", error);
          }
      }
  }
  
  const handleRoleChange = (role: UserRole) => {
      setActiveRole(role);
      setActiveView(role === UserRole.ADMIN ? 'admin' : 'dashboard');
  }

  const handleShowDetail = (coinId: string) => {
    setActiveView('coinDetail');
    setDetailCoinId(coinId);
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard'); 
    setDetailCoinId(null);
  };
  
  const NavButton = ({ view, icon, label }: { view: ActiveView, icon: React.ReactNode, label: string }) => (
    <button onClick={() => setActiveView(view)} className={`p-2 rounded-full transition-colors ${activeView === view ? 'bg-primary/20 text-primary' : 'text-muted hover:bg-surface'}`} aria-label={label}>
      {icon}
    </button>
  );

  const Header = () => (
    <header className="bg-surface border-b border-border-color px-6 py-3 flex justify-between items-center sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <LogoIcon className="w-8 h-8 text-primary" />
        <h1 className="text-xl font-bold text-white">Trademeta</h1>
      </div>
      <div className="flex items-center gap-4">
        {user?.role === UserRole.ADMIN && activeRole === UserRole.USER && (
          <div className="flex items-center gap-2 p-1 bg-background rounded-lg">
            <button onClick={() => handleRoleChange(UserRole.USER)} className="px-3 py-1.5 text-sm font-semibold rounded-md flex items-center gap-2 bg-primary text-background">
                <DashboardIcon className="w-4 h-4" /> User View
            </button>
            <button onClick={() => handleRoleChange(UserRole.ADMIN)} className="px-3 py-1.5 text-sm font-semibold rounded-md flex items-center gap-2 text-muted hover:bg-border-color">
                <AdminIcon className="w-4 h-4" /> Admin View
            </button>
          </div>
        )}
        
        {activeRole === UserRole.USER && (
          <div className="flex items-center gap-2 border-l border-border-color pl-4 ml-2">
            <NavButton view="dashboard" icon={<DashboardIcon className="w-5 h-5" />} label="Dashboard" />
            <NavButton view="deposit" icon={<DepositIcon className="w-5 h-5" />} label="Deposit" />
            <NavButton view="profile" icon={<UserIcon className="w-5 h-5" />} label="User Profile" />
            <button onClick={handleLogout} className="p-2 rounded-full text-muted hover:bg-surface" aria-label="Logout"><LogoutIcon className="w-5 h-5" /></button>
          </div>
        )}

        {activeRole === UserRole.ADMIN && (
             <div className="flex items-center gap-2">
                <span className="text-sm text-white font-semibold">Admin Panel</span>
                <div className="border-l border-border-color pl-4 ml-2">
                     <button onClick={handleLogout} className="p-2 rounded-full text-muted hover:bg-surface" aria-label="Logout"><LogoutIcon className="w-5 h-5" /></button>
                </div>
             </div>
        )}
      </div>
    </header>
  );
  
  if (isLoading) {
      return (
          <div className="flex justify-center items-center h-screen bg-background">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
      )
  }

  if (!firebaseUser) {
    return <AuthPage />;
  }

  if (!user) {
       return (
          <div className="flex justify-center items-center h-screen bg-background">
              <p className="text-danger">Kullanıcı verileri yüklenemedi. Lütfen tekrar giriş yapmayı deneyin.</p>
          </div>
      )
  }

  const renderContent = () => {
      if (activeView === 'coinDetail' && detailCoinId) {
          return <CoinDetailPage coinId={detailCoinId} onBack={handleBackToDashboard} />;
      }
      
      switch (activeView) {
          case 'dashboard': 
              return <Dashboard user={user} onUserUpdate={handleUserUpdate} onShowDetail={handleShowDetail} onGoToDeposit={() => setActiveView('deposit')} />;
          case 'admin': 
              return user.role === UserRole.ADMIN 
                  ? <AdminPanel currentUser={user} onUserUpdate={handleUserUpdate} /> 
                  : <Dashboard user={user} onUserUpdate={handleUserUpdate} onShowDetail={handleShowDetail} onGoToDeposit={() => setActiveView('deposit')} />;
          case 'profile': 
              return <UserProfile user={user} onUpdateUser={handleUserUpdate} />;
          case 'deposit': 
              return <DepositPage user={user} onDepositRequest={handleUserUpdate} />;
          default: 
              return <Dashboard user={user} onUserUpdate={handleUserUpdate} onShowDetail={handleShowDetail} onGoToDeposit={() => setActiveView('deposit')} />;
      }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="overflow-x-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;