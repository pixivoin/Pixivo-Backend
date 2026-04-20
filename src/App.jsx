import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Masters from './pages/Masters';
import Production from './pages/Production';
import History from './pages/History';
import Auth from './pages/Auth';
import Settings from './pages/Settings';
import { fetchAllData, subscribeDB, getDB } from './data/db';

function App() {
  const [activeTab, setActiveTab] = useState('suppliers');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [loading, setLoading] = useState(false);

  // Global db state just to trigger re-renders
  const [dbTick, setDbTick] = useState(0);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchAllData().then(() => setLoading(false));
      
      const unsubscribe = subscribeDB(() => {
        setDbTick(prev => prev + 1);
      });
      return unsubscribe;
    }
  }, [user]);

  if (!user) {
    return <Auth onLogin={(u) => setUser(u)} />;
  }

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><h2>Syncing with Cloud...</h2></div>;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'suppliers':
      case 'materials':
      case 'products':
        return <Masters activeTab={activeTab} />;
      case 'inward':
      case 'production':
        return <Production activeTab={activeTab} />;
      case 'history':
        return <History />;
      case 'settings':
        return user.role === 'ADMIN' ? <Settings /> : <Masters activeTab="suppliers" />;
      default:
        return <Masters activeTab="suppliers" />;
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
      
      <main style={{ 
        flex: 1, 
        overflowY: 'auto',
        background: 'var(--bg-app)',
        padding: '1.5rem 2rem'
      }}>
        <div style={{ width: '100%' }}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
