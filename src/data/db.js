import { useState, useEffect } from 'react';

const API_URL = 'https://pixivo-backend.onrender.com/api/data';

// In-memory cache to maintain sync behavior for React components
let IN_MEMORY_DB = {
  suppliers: [],
  materials: [],
  materialInward: [],
  products: [],
  productConfigs: [],
  productions: []
};

// Global subscription for reactivity
let listeners = [];
export const subscribeDB = (listener) => {
  listeners.push(listener);
  return () => { listeners = listeners.filter(l => l !== listener); };
};
const notify = () => listeners.forEach(l => l(IN_MEMORY_DB));

export const getDB = () => IN_MEMORY_DB;

export const useDB = () => {
  const [db, setDb] = useState(getDB());
  useEffect(() => {
    return subscribeDB(setDb);
  }, []);
  return db;
};

// Helper for API requests
const api = async (endpoint, options = {}) => {
  const token = sessionStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    if(res.status === 401) {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user');
      window.location.reload();
    }
    throw new Error('API Request Failed');
  }
  return res.json();
};

export const fetchAllData = async () => {
  try {
    const [suppliers, materials, products, configs, inward, productions] = await Promise.all([
      api('/suppliers'),
      api('/materials'),
      api('/products'),
      api('/configs'),
      api('/inward'),
      api('/productions')
    ]);

    IN_MEMORY_DB = {
      suppliers, 
      materials, 
      products, 
      productConfigs: configs, 
      materialInward: inward, 
      productions
    };
    notify();
  } catch (e) {
    console.error("Failed to sync data", e);
  }
};

// Generic Add Function
const addItem = async (endpoint, item) => {
  const result = await api(endpoint, { method: 'POST', body: JSON.stringify(item) });
  await fetchAllData();
  return result;
};

// Generic Delete Function
export const deleteItem = async (store, id) => {
  let endpoint = `/${store}`;
  // Map old frontend store names to backend endpoints
  if (store === 'materialInward') endpoint = '/inward';
  else if (store === 'productConfigs') endpoint = '/configs';
  
  await api(`${endpoint}/${id}`, { method: 'DELETE' });
  await fetchAllData();
};

// Generic Update Function
export const updateItem = async (store, id, updatedData) => {
  let endpoint = `/${store}`;
  if (store === 'materialInward') endpoint = '/inward';
  else if (store === 'productConfigs') endpoint = '/configs';
  
  await api(`${endpoint}/${id}`, { method: 'PUT', body: JSON.stringify(updatedData) });
  await fetchAllData();
};

// Specialized CRUD wrappers
export const addSupplier = (s) => addItem('/suppliers', s);
export const addMaterial = (m) => addItem('/materials', m);
export const addProduct = (p) => addItem('/products', { ...p, isActive: true });
export const addProductConfig = (c) => addItem('/configs', c);

// Transaction Wrappers (Calculation is done in frontend component or API. Since API expects simple objects:)
export const addMaterialInward = async (entry) => addItem('/inward', entry);
export const addProduction = async (entry) => addItem('/productions', entry);

// Utilities
export const getMaterialStock = (materialId) => {
  const inward = IN_MEMORY_DB.materialInward.filter(i => i.materialId === materialId).reduce((sum, i) => sum + Number(i.quantity), 0);
  const used = IN_MEMORY_DB.productions.filter(p => p.materialId === materialId).reduce((sum, p) => sum + Number(p.materialUsed), 0);
  return (inward - used).toFixed(3);
};

export const getStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
};

export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

export const logOut = () => {
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('user');
  window.location.reload();
}
