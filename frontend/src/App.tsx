import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  BarChart3, 
  Download,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';
import Dashboard from './components/Dashboard.tsx';
import TicketList from './components/TicketList.tsx';
import Analytics from './components/Analytics.tsx';
import DemoPortal from './components/DemoPortal.tsx';
import GuardrailPanel from './components/GuardrailPanel.tsx';
import { RaiseTicket, TrackTicket } from './components/UserPortal.tsx';
import { ticketService } from './services/api';

function AdminLayout({ tickets, stats, fetchData }: any) {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row w-full font-outfit">
      {/* Sidebar - Same logic as before but in a sub-component */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
              <LayoutDashboard size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">NexusAgent</h1>
          </div>
          
          <nav className="space-y-1">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <LayoutDashboard size={20} /> Overview
            </button>
            <button onClick={() => setActiveTab('tickets')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'tickets' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Ticket size={20} /> Tickets
            </button>
            <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'analytics' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <BarChart3 size={20} /> Analytics
            </button>
            <button onClick={() => setActiveTab('logs')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'logs' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <ShieldCheck size={20} /> System Logs
            </button>
            <div className="pt-4 mt-4 border-t border-gray-100">
               <button onClick={() => setActiveTab('demo')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'demo' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                <PlusCircle size={20} /> Raise Issue (Demo)
              </button>
            </div>
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-gray-100 flex flex-col gap-4">
          <div className="bg-primary-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-primary-800 uppercase tracking-wider mb-1">System Status</p>
            <div className="flex items-center gap-2 text-primary-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">AI Core Online</span>
            </div>
          </div>
          <Link to="/raise-ticket" className="text-xs font-bold text-center text-gray-400 hover:text-primary-600 transition-colors">Go to User Portal</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === 'dashboard' && 'Welcome Admin'}
              {activeTab === 'tickets' && 'IT Support Tickets'}
              {activeTab === 'analytics' && 'Operational Insights'}
              {activeTab === 'logs' && 'Guardrail Validation Logs'}
              {activeTab === 'demo' && 'User Demo Portal'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => ticketService.exportExcel()} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
              <Download size={18} /> Export Excel
            </button>
            <button onClick={fetchData} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-all shadow-md shadow-primary-200">
              Refresh Data
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && <Dashboard stats={stats} tickets={tickets.slice(0, 5)} />}
        {activeTab === 'tickets' && <TicketList tickets={tickets} />}
        {activeTab === 'analytics' && <Analytics stats={stats} />}
        {activeTab === 'logs' && <GuardrailPanel tickets={tickets} />}
        {activeTab === 'demo' && <DemoPortal />}
      </main>
    </div>
  );
}

function UserPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa] font-outfit px-4 py-12">
      <div className="max-w-4xl mx-auto mb-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Nexus<span className="text-primary-600">Support</span></span>
        </div>
        <nav className="flex gap-6">
          <Link to="/raise-ticket" className="text-sm font-bold text-gray-600 hover:text-primary-600 transition-colors">Raise Issue</Link>
          <Link to="/track-ticket" className="text-sm font-bold text-gray-600 hover:text-primary-600 transition-colors">Track Status</Link>
        </nav>
      </div>
      {children}
      <p className="mt-12 text-center text-gray-400 text-xs font-medium">Powered by NexusAgent AI Automation Engine</p>
    </div>
  );
}

function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    by_priority: {},
    by_source: {},
    by_status: {},
    volume_over_time: []
  });

  const fetchData = async () => {
    try {
      const [ticketsData, statsData] = await Promise.all([
        ticketService.getTickets(),
        ticketService.getStats()
      ]);
      setTickets(ticketsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/" element={<AdminLayout tickets={tickets} stats={stats} fetchData={fetchData} />} />
        <Route path="/admin" element={<Navigate to="/" replace />} />
        
        {/* User Portal Routes */}
        <Route path="/raise-ticket" element={<UserPortalLayout><RaiseTicket /></UserPortalLayout>} />
        <Route path="/track-ticket" element={<UserPortalLayout><TrackTicket /></UserPortalLayout>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
