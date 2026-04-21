import React from 'react';
import { X } from 'lucide-react';

const TabBar = ({ tabs, activeTabId, onSelect, onClose }) => {
  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <div 
          key={tab.id}
          className={`tab-item ${activeTabId === tab.id ? 'active' : ''}`}
          onClick={() => onSelect(tab.id)}
        >
          {tab.icon && (
            <div className="tab-icon">
              <tab.icon size={12} />
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
            <X size={10} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default TabBar;
