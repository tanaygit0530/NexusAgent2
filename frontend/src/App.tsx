import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  BarChart3, 
  Download,
  PlusCircle,
  ShieldCheck,
  User
} from 'lucide-react';
import Dashboard from './components/Dashboard.tsx';
import TicketList from './components/TicketList.tsx';
import Analytics from './components/Analytics.tsx';
import DemoPortal from './components/DemoPortal.tsx';
import GuardrailPanel from './components/GuardrailPanel.tsx';
import AdminWorkspace from './components/AdminWorkspace.tsx';
import { RaiseTicket, TrackTicket } from './components/UserPortal.tsx';
import Login from './pages/Login.tsx';
import { ticketService } from './services/api';

function AdminLayout({ tickets, stats, fetchData }: any) {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex flex-col md:flex-row w-full font-outfit">
      {/* Sidebar - Enhanced with gradients and shadows */}
      <aside className="w-full md:w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex-shrink-0 shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-300/50 animate-pulse-slow">
              <LayoutDashboard size={24} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">NexusAgent</h1>
          </div>
          
          <nav className="space-y-1">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-200' : 'text-gray-600 hover:bg-gray-50 hover:shadow-md'}`}>
              <LayoutDashboard size={20} /> Overview
            </button>
            <button onClick={() => setActiveTab('tickets')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'tickets' ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-200' : 'text-gray-600 hover:bg-gray-50 hover:shadow-md'}`}>
              <Ticket size={20} /> Tickets
            </button>
            <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'analytics' ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-200' : 'text-gray-600 hover:bg-gray-50 hover:shadow-md'}`}>
              <BarChart3 size={20} /> Analytics
            </button>
            <button onClick={() => setActiveTab('workspace')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'workspace' ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-200' : 'text-gray-600 hover:bg-gray-50 hover:shadow-md'}`}>
              <User size={20} /> My Workspace
            </button>
            <button onClick={() => setActiveTab('logs')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'logs' ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-200' : 'text-gray-600 hover:bg-gray-50 hover:shadow-md'}`}>
              <ShieldCheck size={20} /> System Logs
            </button>
            <div className="pt-4 mt-4 border-t border-gray-100">
               <button onClick={() => setActiveTab('demo')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'demo' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-200' : 'text-gray-600 hover:bg-gray-50 hover:shadow-md'}`}>
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
          <div className="flex flex-col gap-2">
            <Link to="/raise-ticket" className="text-xs font-bold text-center text-gray-400 hover:text-primary-600 transition-colors">Go to User Portal</Link>
            <Link to="/login" className="text-xs font-bold text-center text-gray-500 hover:text-gray-700 transition-colors">Sign Out</Link>
          </div>
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
              {activeTab === 'workspace' && 'My Workspace'}
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
        {activeTab === 'workspace' && <AdminWorkspace />}
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
          <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">Sign Out</Link>
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
    
    // WebSocket for real-time updates
    const ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket Message Received:", data);
      if (data.event === "ticket_updated") {
        // Refresh everything when a ticket is updated or created
        fetchData();
      }
    };

    ws.onopen = () => console.log("WebSocket Connected");
    ws.onerror = (err) => console.error("WebSocket Error:", err);
    ws.onclose = () => console.log("WebSocket Disconnected");

    return () => ws.close();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<Login />} />
        
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
