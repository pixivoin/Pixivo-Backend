import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TabBar from './components/TabBar';
import Masters from './pages/Masters';
import Production from './pages/Production';
import History from './pages/History';
import Auth from './pages/Auth';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import { fetchAllData, subscribeDB } from './data/db';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [loading, setLoading] = useState(false);
  const [dbTick, setDbTick] = useState(0);

  // Multi-tab state
  const [tabs, setTabs] = useState(() => {
    const saved = localStorage.getItem('open_tabs');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTabId, setActiveTabId] = useState(() => {
    return localStorage.getItem('active_tab_id') || 'dashboard';
  });

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

  // Persist tabs
  useEffect(() => {
    localStorage.setItem('open_tabs', JSON.stringify(tabs));
    localStorage.setItem('active_tab_id', activeTabId);
  }, [tabs, activeTabId]);

  if (!user) {
    return <Auth onLogin={(u) => setUser(u)} />;
  }

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><h2>Syncing with Cloud...</h2></div>;
  }

  const openTab = (item) => {
    // If it's dashboard, just switch to it
    if (item.id === 'dashboard') {
      setActiveTabId('dashboard');
      return;
    }

    // Check if tab already exists
    const existingIndex = tabs.findIndex(t => t.id === item.id);
    if (existingIndex !== -1) {
      setActiveTabId(item.id);
    } else {
      // Add new tab
      setTabs(prev => [...prev, item]);
      setActiveTabId(item.id);
    }
  };

  const closeTab = (id) => {
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== id);
      // If we closed the active tab, switch to the previous one or dashboard
      if (activeTabId === id) {
        if (newTabs.length > 0) {
          setActiveTabId(newTabs[newTabs.length - 1].id);
        } else {
          setActiveTabId('dashboard');
        }
      }
      return newTabs;
    });
  };

  const renderContent = () => {
    // If active is dashboard
    if (activeTabId === 'dashboard') return <Dashboard />;

    // Find the active tab metadata
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab) return <Dashboard />;

    const type = activeTab.id; // Using ID as the type/identifier

    switch (type) {
      case 'suppliers':
      case 'materials':
      case 'products':
        return <Masters activeTab={type} />;
      case 'inward':
      case 'production':
        return <Production activeTab={type} />;
      case 'history':
        return <History />;
      case 'settings':
        return user.role === 'ADMIN' ? <Settings /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar onOpenTab={openTab} activeTabId={activeTabId} user={user} />
      
      <TabBar 
        tabs={tabs} 
        activeTabId={activeTabId} 
        onSelect={setActiveTabId} 
        onClose={closeTab} 
      />
      
      <main style={{ 
        flex: 1, 
        overflowY: 'auto',
        background: 'var(--bg-app)',
        padding: activeTabId === 'dashboard' ? '0' : '1.5rem 2rem'
      }}>
        <div style={{ width: '100%' }}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
