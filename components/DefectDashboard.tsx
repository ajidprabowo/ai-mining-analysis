
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { DefectEntry } from '../types';
import { DEFECT_CATEGORIES } from '../constants';
import { LayoutDashboard, AlertTriangle, CheckCircle2, AlertCircle, BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

interface DefectDashboardProps {
  data: DefectEntry[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
const STATUS_COLORS = {
  'Jelas': '#10b981',
  'Kurang Jelas': '#f59e0b',
  'Tidak Jelas': '#ef4444',
  'Unknown': '#94a3b8'
};

const DefectDashboard: React.FC<DefectDashboardProps> = ({ data }) => {
  const stats = useMemo(() => {
    if (!data.length) return null;

    // 1. Category Distribution
    const categoryMap: Record<string, number> = {};
    data.forEach(item => {
      const label = DEFECT_CATEGORIES.find(c => c.id === item.id_defect)?.label || item.id_defect;
      categoryMap[label] = (categoryMap[label] || 0) + 1;
    });
    
    const totalCount = data.length;
    const categoryData = Object.entries(categoryMap)
      .map(([name, value]) => ({ 
        name, 
        value,
        percentage: ((value / totalCount) * 100).toFixed(1)
      }))
      .sort((a, b) => b.value - a.value);

    // 2. Status Distribution
    const statusMap: Record<string, number> = {
      'Jelas': 0,
      'Kurang Jelas': 0,
      'Tidak Jelas': 0
    };
    data.forEach(item => {
      const status = item.cek || 'Unknown';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    // 3. Trends over Time
    const timeMap: Record<string, number> = {};
    data.forEach(item => {
      if (item.date) {
        timeMap[item.date] = (timeMap[item.date] || 0) + 1;
      }
    });
    const timeData = Object.entries(timeMap)
      .map(([date, count]) => {
        const [d, m, y] = date.split('/').map(Number);
        return { 
          date, 
          count, 
          timestamp: new Date(y, m - 1, d).getTime() 
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    // 4. Summary Stats
    const totalDefects = data.length;
    const unreliableCount = data.filter(d => d.cek === 'Kurang Jelas' || d.cek === 'Tidak Jelas').length;
    const criticalCount = data.filter(d => d.cek === 'Tidak Jelas').length;

    return { categoryData, statusData, timeData, totalDefects, unreliableCount, criticalCount };
  }, [data]);

  if (!stats) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Defects</p>
            <p className="text-2xl font-black text-slate-800">{stats.totalDefects}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unreliable Data</p>
            <p className="text-2xl font-black text-slate-800">{stats.unreliableCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical (Tidak Jelas)</p>
            <p className="text-2xl font-black text-slate-800">{stats.criticalCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-800">Defects by Category</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number, name: string, props: any) => {
                    if (name === 'value' && props?.payload) {
                      return [`${value} (${props.payload.percentage || '0'}%)`, 'Count'];
                    }
                    return [value, name];
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 4, 4, 0]} 
                  barSize={20} 
                  label={{ 
                    position: 'right', 
                    formatter: (val: number, entry: any) => entry?.payload?.percentage ? `${entry.payload.percentage}%` : '', 
                    fontSize: 10, 
                    fill: '#64748b' 
                  }}
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-800">Visual Clarity Status</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || STATUS_COLORS.Unknown} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-slate-800">Defect Trends Over Time</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.timeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefectDashboard;
