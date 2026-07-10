import React, { useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { PhoneCall, CheckCircle2, Clock, Users, ArrowUpRight, MoreHorizontal, Download, Calendar, Filter, Phone, Type } from 'lucide-react';
import { SidebarNav } from './SidebarNav';
import { StatCard } from './StatCard';
import { RecordPage } from './RecordPage';

const callTrendData = [
  { day: 'Mon', calls: 1400, success: 1320 },
  { day: 'Tue', calls: 1800, success: 1710 },
  { day: 'Wed', calls: 1600, success: 1540 },
  { day: 'Thu', calls: 2100, success: 1980 },
  { day: 'Fri', calls: 1900, strokeWidth: 1820 },
  { day: 'Sat', calls: 800, success: 760 },
  { day: 'Sun', calls: 600, success: 580 }
];

const topAgents = [
  { name: 'Sarah Jenkins', calls: 452, rate: '98.5%', status: 'Online' },
  { name: 'Michael Chen', calls: 412, rate: '96.2%', status: 'Away' },
  { name: 'Elena Rodriguez', calls: 389, rate: '95.8%', status: 'Online' },
  { name: 'David Smith', calls: 367, rate: '94.1%', status: 'Online' },
  { name: 'Jessica Taylor', calls: 342, rate: '92.9%', status: 'Busy' }
];

export const AnalyticsDashboard: React.FC<{ onOpenAssistant: (mode: 'chat' | 'call') => void }> = ({ onOpenAssistant }) => {

  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Call History' | 'Agents' | 'Records' | 'Settings'>('Dashboard');


  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <SidebarNav activeTab={activeTab} onTabChange={(tabId) => setActiveTab(tabId as any)} />

      <main className="flex-1 overflow-y-auto">
        {activeTab === 'Dashboard' && (
          <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics Dashboard</h1>
                <p className="text-slate-500 mt-1 font-medium">Real-time performance overview of your AI voice agents.</p>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                  <Calendar size={16} />
                  <span>Last 7 Days</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                  <Filter size={16} />
                  <span>Filters</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20">
                  <Download size={16} />
                  <span>Export Report</span>
                </button>
              </div>
            </header>

           

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard label="Total Calls" value="12,402" icon={PhoneCall} trend={{ value: 12.5, isUpward: true }} description="Total call volume this week" />
              <StatCard label="Success Rate" value="94.2%" icon={CheckCircle2} trend={{ value: 0.8, isUpward: true }} description="Calls resolved successfully" />
              <StatCard label="Avg. Duration" value="4m 12s" icon={Clock} trend={{ value: 3.2, isUpward: false }} description="Mean time spent on calls" />
              <StatCard label="Active Users" value="850" icon={Users} trend={{ value: 24.1, isUpward: true }} description="Current concurrent callers" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart Area */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Call Trends</h2>
                    <p className="text-sm text-slate-500">Daily call volume vs successful resolutions</p>
                  </div>
                </div>

                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={callTrendData}>
                      <defs>
                        <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="calls" stroke="#2563eb" strokeWidth={3} fill="url(#colorCalls)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Agents Panel */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-slate-900">Top Agents</h2>
                  <button className="text-blue-600 hover:text-blue-700">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  {topAgents.map((agent) => (
                    <div key={agent.name} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                          {agent.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600">{agent.name}</p>
                          <p className="text-xs text-slate-500">{agent.calls} calls</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-emerald-600">{agent.rate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Records' && <RecordPage />}
      </main>
    </div>
  );
};

