import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, TrendingUp, Award, Target, Zap } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

interface Ticket {
  ticket_id: string;
  summary: string;
  priority: string;
  department: string;
  status: string;
  assigned_at: string;
  resolved_at?: string;
  created_at: string;
}

interface Performance {
  admin_name: string;
  total_solved: number;
  currently_solving: number;
  avg_resolution_hours: number;
  high_priority_handled: number;
  sla_success_rate: number;
}

const AdminWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'solving' | 'history' | 'performance'>('solving');
  const [adminName, setAdminName] = useState('Tanay'); // Default admin name
  const [currentlySolving, setCurrentlySolving] = useState<Ticket[]>([]);
  const [solvedHistory, setSolvedHistory] = useState<Ticket[]>([]);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWorkspaceData();
  }, [adminName, activeTab]);

  const fetchWorkspaceData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'solving') {
        const response = await axios.get(`${API_BASE}/tickets/workspace/currently-solving?admin_name=${adminName}`);
        setCurrentlySolving(response.data);
      } else if (activeTab === 'history') {
        const response = await axios.get(`${API_BASE}/tickets/workspace/solved-history?admin_name=${adminName}`);
        setSolvedHistory(response.data);
      } else if (activeTab === 'performance') {
        const response = await axios.get(`${API_BASE}/tickets/workspace/performance?admin_name=${adminName}`);
        setPerformance(response.data);
      }
    } catch (error) {
      console.error('Error fetching workspace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeElapsed = (assignedAt: string) => {
    return formatDistanceToNow(new Date(assignedAt), { addSuffix: false });
  };

  const calculateResolutionTime = (assignedAt: string, resolvedAt: string) => {
    const assigned = new Date(assignedAt);
    const resolved = new Date(resolvedAt);
    const hours = Math.round((resolved.getTime() - assigned.getTime()) / (1000 * 60 * 60));
    return `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Workspace</h2>
          <p className="text-sm text-gray-500 mt-1">Admin: {adminName}</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('solving')}
            className={`px-4 py-2 rounded-md text-sm font-bold uppercase tracking-tight transition-all ${
              activeTab === 'solving' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock size={16} className="inline mr-2" />
            Currently Solving
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md text-sm font-bold uppercase tracking-tight transition-all ${
              activeTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CheckCircle size={16} className="inline mr-2" />
            Solved History
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 rounded-md text-sm font-bold uppercase tracking-tight transition-all ${
              activeTab === 'performance' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp size={16} className="inline mr-2" />
            Performance
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <>
          {/* Currently Solving Tab */}
          {activeTab === 'solving' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ticket ID</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Issue Title</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Started At</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time Elapsed</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {currentlySolving.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                          No tickets currently being worked on
                        </td>
                      </tr>
                    ) : (
                      currentlySolving.map((ticket) => (
                        <tr key={ticket.ticket_id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-primary-600">{ticket.ticket_id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-900">{ticket.summary}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                              ticket.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                              ticket.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                              ticket.priority === 'Medium' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                              {ticket.department}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-gray-600">
                              {ticket.assigned_at ? format(new Date(ticket.assigned_at), 'MMM dd, HH:mm') : 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-amber-500" />
                              <span className="text-xs font-bold text-amber-600">
                                {ticket.assigned_at ? calculateTimeElapsed(ticket.assigned_at) : 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-gray-700">{ticket.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Solved History Tab */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ticket ID</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Issue Summary</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resolution Time</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Closed Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {solvedHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                          No resolved tickets yet
                        </td>
                      </tr>
                    ) : (
                      solvedHistory.map((ticket) => (
                        <tr key={ticket.ticket_id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-green-600">{ticket.ticket_id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-900">{ticket.summary}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                              {ticket.department}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-gray-700">
                              {ticket.assigned_at && ticket.resolved_at 
                                ? calculateResolutionTime(ticket.assigned_at, ticket.resolved_at)
                                : 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-gray-600">
                              {ticket.resolved_at ? format(new Date(ticket.resolved_at), 'MMM dd, yyyy HH:mm') : 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && performance && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Solved */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <CheckCircle size={24} className="text-white" />
                  </div>
                  <span className="text-3xl font-bold text-green-700">{performance.total_solved}</span>
                </div>
                <h3 className="text-sm font-bold text-green-900 uppercase tracking-wide">Total Tickets Solved</h3>
              </div>

              {/* Currently Solving */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                    <Clock size={24} className="text-white" />
                  </div>
                  <span className="text-3xl font-bold text-amber-700">{performance.currently_solving}</span>
                </div>
                <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide">Currently Solving</h3>
              </div>

              {/* Avg Resolution Time */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Zap size={24} className="text-white" />
                  </div>
                  <span className="text-3xl font-bold text-blue-700">{performance.avg_resolution_hours}h</span>
                </div>
                <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide">Avg Resolution Time</h3>
              </div>

              {/* High Priority Handled */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                    <Award size={24} className="text-white" />
                  </div>
                  <span className="text-3xl font-bold text-red-700">{performance.high_priority_handled}</span>
                </div>
                <h3 className="text-sm font-bold text-red-900 uppercase tracking-wide">High Priority Handled</h3>
              </div>

              {/* SLA Success Rate */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Target size={24} className="text-white" />
                  </div>
                  <span className="text-3xl font-bold text-purple-700">{performance.sla_success_rate}%</span>
                </div>
                <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wide">SLA Success Rate</h3>
                <p className="text-xs text-purple-600 mt-2">24-hour SLA target</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminWorkspace;
