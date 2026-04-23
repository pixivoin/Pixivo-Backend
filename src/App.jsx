import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import TabBar from './components/TabBar';
import Masters from './pages/Masters';
import Production from './pages/Production';
import History from './pages/History';
import Auth from './pages/Auth';
import Settings from './pages/Settings';
import { fetchAllData, subscribeDB } from './data/db';
import { 
  UserSquare2, 
  FileBox, 
  Package, 
  CircleDot, 
  Database, 
  History as HistoryIcon,
  Settings as SettingsIcon
} from 'lucide-react';

// Central registry for tab metadata
export const TAB_REGISTRY = {
  suppliers: { label: 'Suppliers Registry', icon: UserSquare2 },
  materials: { label: 'Raw Materials', icon: FileBox },
  products: { label: 'Product Catalog', icon: Package },
  inward: { label: 'Material Inward', icon: CircleDot },
  production: { label: 'Production Entry', icon: Database },
  history: { label: 'Production History', icon: HistoryIcon },
  settings: { label: 'Settings', icon: SettingsIcon },
};

function App() {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [dbTick, setDbTick] = useState(0);

  // Multi-tab state (stored as ID strings for safe serialization)
  const [tabIds, setTabIds] = useState(() => {
    const saved = localStorage.getItem('open_tabs_ids');
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.filter(id => id !== 'dashboard' && TAB_REGISTRY[id]);
    } catch (e) {
      return [];
    }
  });

  const [activeTabId, setActiveTabId] = useState(() => {
    const saved = localStorage.getItem('active_tab_id');
    return (saved && saved !== 'dashboard' && TAB_REGISTRY[saved]) ? saved : 'suppliers';
  });

  // Sync window size with login status
  useEffect(() => {
    if (user && window.electronAPI) {
      window.electronAPI.loginSuccess();
    } else if (!user && window.electronAPI) {
      window.electronAPI.logout();
    }
  }, [user]);

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

  // Persist state
  useEffect(() => {
    localStorage.setItem('open_tabs_ids', JSON.stringify(tabIds));
    localStorage.setItem('active_tab_id', activeTabId);
  }, [tabIds, activeTabId]);

  if (!user) {
    return <Auth onLogin={(u) => setUser(u)} />;
  }

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><h2>Syncing with Cloud...</h2></div>;
  }

  const openTab = (id) => {
    if (!TAB_REGISTRY[id]) return;
    
    setTabIds(prev => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
    setActiveTabId(id);
  };

  const closeTab = (id) => {
    setTabIds(prev => {
      const newTabs = prev.filter(t => t !== id);
      if (activeTabId === id) {
        if (newTabs.length > 0) {
          setActiveTabId(newTabs[newTabs.length - 1]);
        } else {
          setActiveTabId('suppliers');
        }
      }
      return newTabs;
    });
  };

  const renderContent = () => {
    const currentType = TAB_REGISTRY[activeTabId] ? activeTabId : 'suppliers';

    switch (currentType) {
      case 'suppliers':
      case 'materials':
      case 'products':
        return <Masters activeTab={currentType} />;
      case 'inward':
      case 'production':
        return <Production activeTab={currentType} />;
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
      <Navbar onOpenTab={openTab} activeTabId={activeTabId} user={user} onLogout={() => {
        sessionStorage.clear();
        setUser(null);
        if (window.electronAPI) window.electronAPI.logout();
      }} />
      
      <TabBar 
        tabIds={tabIds} 
        activeTabId={activeTabId} 
        onSelect={setActiveTabId} 
        onClose={closeTab} 
      />
      
      <main style={{ 
        flex: 1, 
        overflowY: 'auto',
        background: 'var(--bg-app)',
        padding: '1.2rem 1.5rem'
      }}>
        <div style={{ width: '100%' }}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
