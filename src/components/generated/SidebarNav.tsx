import React from 'react';
import { LayoutDashboard, History, Users, Settings, PhoneCall, ChevronRight, Disc3, MessageSquare } from 'lucide-react';
interface SidebarNavProps {
  activeTab?: 'Dashboard' | 'Call History' | 'Agents' | 'Records' | 'Settings';
  onTabChange?: (tabId: string) => void;
}
export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab = 'Dashboard',
  onTabChange
}) => {
  const navItems = [{
    name: 'Dashboard',
    icon: LayoutDashboard,
    id: 'Dashboard'
  },
   {
    name: 'Call History',
    icon: History,
    id: 'Call History'
  }, {
    name: 'Agents',
    icon: Users,
    id: 'Agents'
  }, {
    name: 'AI Assistant',
    icon: MessageSquare,
    id: 'Records'
  }, {
    name: 'Settings',
    icon: Settings,
    id: 'Settings'
  }
];
  return <div className="flex flex-col h-screen w-64 bg-slate-900 text-slate-300 border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <PhoneCall size={24} className="text-white" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">Praangan Elitus</span>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map(item => {
        const isActive = activeTab === item.id;
        return <button 
              key={item.id} 
              onClick={() => onTabChange?.(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}`}>
              <div className="flex items-center gap-3">
                <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                <span className="font-medium">{item.name}</span>
              </div>
              {isActive && <ChevronRight size={16} />}
            </button>;
      })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm text-slate-300 font-medium">All systems normal</span>
          </div>
        </div>
      </div>
    </div>;
};