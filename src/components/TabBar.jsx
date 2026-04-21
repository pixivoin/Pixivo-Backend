import React from 'react';
import { X, LayoutDashboard } from 'lucide-react';

const TabBar = ({ tabs, activeTabId, onSelect, onClose }) => {
  return (
    <div className="tab-bar">
      {/* Permanent Dashboard Tab */}
      <div 
        className={`tab-item ${activeTabId === 'dashboard' ? 'active' : ''}`}
        onClick={() => onSelect('dashboard')}
      >
        <div className="tab-icon">
          <LayoutDashboard size={14} />
        </div>
        <span>Dashboard</span>
      </div>

      {tabs.map((tab) => (
        <div 
          key={tab.id}
          className={`tab-item ${activeTabId === tab.id ? 'active' : ''}`}
          onClick={() => onSelect(tab.id)}
        >
          {tab.icon && (
            <div className="tab-icon">
              <tab.icon size={14} />
            </div>
          )}
          <span>{tab.label}</span>
          <button 
            className="tab-close" 
            onClick={(e) => {
              e.stopPropagation();
              onClose(tab.id);
            }}
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default TabBar;
