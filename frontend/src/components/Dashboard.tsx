import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BarChart3,
  Mail,
  MessageSquare,
  Globe,
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DashboardProps {
  stats: any;
  tickets: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats, tickets }) => {
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  
  const totalTickets = Object.values(stats.by_status).reduce((a, b) => (a as number) + (b as number), 0) as number;
  
  // Filter tickets by priority
  const filteredTickets = priorityFilter === 'All' 
    ? tickets 
    : tickets.filter(t => t.priority === priorityFilter);
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Cards - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50/30 p-6 rounded-2xl border border-blue-100/50 shadow-lg hover:shadow-xl transition-all duration-300 card-hover group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 size={24} />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full shadow-sm">+12%</span>
          </div>
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Total Tickets</p>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mt-2">{totalTickets}</h3>
        </div>
        
        <div className="bg-gradient-to-br from-white to-orange-50/30 p-6 rounded-2xl border border-orange-100/50 shadow-lg hover:shadow-xl transition-all duration-300 card-hover group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform duration-300">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Needs Info</p>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mt-2">{stats.by_status['Waiting'] || 0}</h3>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50/30 p-6 rounded-2xl border border-gray-100/50 shadow-lg hover:shadow-xl transition-all duration-300 card-hover group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-xl shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform duration-300">
              <AlertCircle size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Filtered Spam</p>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mt-2">{stats.by_status['Spam'] || 0}</h3>
        </div>

        <div className="bg-gradient-to-br from-white to-green-50/30 p-6 rounded-2xl border border-green-100/50 shadow-lg hover:shadow-xl transition-all duration-300 card-hover group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg shadow-green-200 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Resolved</p>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mt-2">{stats.by_status['Resolved'] || 0}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tickets - Enhanced */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-xl overflow-hidden card-hover">
          <div className="p-6 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-transparent">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent text-lg">Recent Tickets</h3>
              <button className="text-primary-600 text-sm font-bold hover:text-primary-700 hover:underline transition-all">View All →</button>
            </div>
            {/* Priority Filter Buttons - Enhanced */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={16} className="text-gray-400" />
              {['All', 'Critical', 'High', 'Medium', 'Low'].map((priority) => (
                <button
                  key={priority}
                  onClick={() => setPriorityFilter(priority)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 shadow-sm ${
                    priorityFilter === priority
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md shadow-primary-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-100/50">
            {filteredTickets.length > 0 ? filteredTickets.map((ticket, index) => (
              <div key={ticket.ticket_id} className="p-6 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent transition-all duration-200 cursor-pointer group animate-slide-in-up" style={{animationDelay: `${index * 50}ms`}}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className={`mt-1 p-2 rounded-lg ${
                      ticket.source === 'WhatsApp' ? 'bg-green-50 text-green-600' : 
                      ticket.source === 'Email' ? 'bg-blue-50 text-blue-600' :
                      'bg-purple-50 text-purple-600'
                    }`}>
                      {ticket.source === 'WhatsApp' ? <MessageSquare size={18} /> : 
                       ticket.source === 'Email' ? <Mail size={18} /> :
                       <Globe size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">{ticket.ticket_id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          ticket.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                          ticket.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <h4 className="text-gray-900 font-semibold mt-1 group-hover:text-primary-600 transition-colors uppercase tracking-tight text-sm">
                        {ticket.summary}
                      </h4>
                      <p className="text-gray-500 text-xs mt-1 truncate max-w-xs">{ticket.sender}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-medium">
                      {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                    </span>
                    <div className="mt-2">
                       <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-gray-400">
                <p>No tickets yet. Send a message to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Channel Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 text-lg mb-6">Channel Distribution</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MessageSquare size={16} className="text-green-600" />
                  WhatsApp
                </div>
                <span className="text-sm font-bold text-gray-900">{stats.by_source['WhatsApp'] || 0}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${totalTickets > 0 ? (stats.by_source['WhatsApp'] || 0) / totalTickets * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail size={16} className="text-blue-600" />
                  Email
                </div>
                <span className="text-sm font-bold text-gray-900">{stats.by_source['Email'] || 0}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${totalTickets > 0 ? (stats.by_source['Email'] || 0) / totalTickets * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Globe size={16} className="text-purple-600" />
                  Website
                </div>
                <span className="text-sm font-bold text-gray-900">{stats.by_source['Website'] || 0}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${totalTickets > 0 ? (stats.by_source['Website'] || 0) / totalTickets * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-50">
            <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">AI Guardrail Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                 <p className="text-xs text-gray-500 font-medium mb-1">Validation Rate</p>
                 <p className="text-xl font-bold text-gray-900">99.2%</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                 <p className="text-xs text-gray-500 font-medium mb-1">Avg AI Speed</p>
                 <p className="text-xl font-bold text-gray-900">1.2s</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
