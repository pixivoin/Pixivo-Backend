import React from 'react';
import { getDB } from '../data/db';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, MoveDown, BarChart3, Clock } from 'lucide-react';
import { getStartOfMonth, getTodayDate } from '../data/db';

const Dashboard = () => {
  const db = getDB();
  const [dateRange, setDateRange] = React.useState({ 
    start: getStartOfMonth(), 
    end: getTodayDate() 
  });

  const filteredProductions = db.productions.filter(item => {
    const itemDate = item.date || (item.timestamp ? new Date(item.timestamp).toISOString().split('T')[0] : '');
    return itemDate >= dateRange.start && itemDate <= dateRange.end;
  });

  const totalUsedWeight = filteredProductions.reduce((acc, p) => acc + (Number(p.materialUsed) || 0), 0);
  const totalProducedPCS = filteredProductions.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
  
  // Calculate average daily efficiency in period
  const daysInPeriod = (new Date(dateRange.end) - new Date(dateRange.start)) / (1000 * 60 * 60 * 24) + 1;
  const efficiency = ((totalProducedPCS / (8500 * daysInPeriod)) * 100).toFixed(1);

  // Chart data (simulated based on period totals)
  const chartData = [
    { name: 'Start', pcs: 0 },
    { name: 'Period Total', pcs: totalProducedPCS },
  ];

  const KPICard = ({ title, value, unit, icon: Icon, color }) => (
    <div className="glass-card" style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div className="kpi-label">{title}</div>
        <div style={{ padding: '0.5rem', background: `rgba(${color}, 0.1)`, borderRadius: '8px', color: `rgb(${color})` }}>
          <Icon size={20} />
        </div>
      </div>
      <div className="kpi-value">
        {value} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{unit}</span>
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <TrendingUp size={12} /> +12% from yesterday
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1, overflowY: 'auto' }}>
      <header>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Production Control</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Live factory metrics and inventory status</p>
      </header>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '2rem', background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Clock size={16} color="var(--text-secondary)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Analyze Period:</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>From:</label>
            <input 
              type="date" 
              className="input-field" 
              style={{ width: '130px', padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>To:</label>
            <input 
              type="date" 
              className="input-field" 
              style={{ width: '130px', padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <KPICard title="Material Consumption" value={totalUsedWeight.toLocaleString()} unit="KG" icon={MoveDown} color="59, 130, 246" />
        <KPICard title="Production Output" value={totalProducedPCS.toLocaleString()} unit="PCS" icon={Package} color="34, 197, 94" />
        <KPICard title="Average Efficiency" value={efficiency} unit="%" icon={BarChart3} color="239, 68, 68" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
            Production Trend
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Standard: 8,500 PCS/Day</span>
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPcs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-slate-900)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--accent-blue)' }}
                />
                <Area type="monotone" dataKey="pcs" stroke="var(--accent-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorPcs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem' }}>Recent Period Batches</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
            {filteredProductions.slice(0, 5).map(entry => (
              <div key={entry.id} style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <code style={{ color: 'var(--primary)', fontWeight: 600 }}>{entry.batchCode}</code>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {entry.date}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem' }}>
                  {entry.quantity} PCS produced
                </div>
              </div>
            ))}
            {filteredProductions.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>No activity in this period</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
