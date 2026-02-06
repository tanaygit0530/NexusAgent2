import React, { useState } from 'react';
import { 
  Mail, 
  MessageSquare, 
  Filter,
  Search,
  ExternalLink,
  Globe,
  AlertTriangle,
  Zap,
  UserCheck,
  Link,
  ShieldCheck,
  ShieldAlert,
  ShieldOff
} from 'lucide-react';
import { format } from 'date-fns';
import { ticketService } from '../services/api';

interface TicketListProps {
  tickets: any[];
}

const TicketList: React.FC<TicketListProps> = ({ tickets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('All');
  const [filterStatus, setFilterStatus] = useState('Active'); // Active, Spam, All

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.summary.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         ticket.ticket_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = filterSource === 'All' || ticket.source === filterSource;
    
    let matchesStatus = true;
    if (filterStatus === 'Active') {
      matchesStatus = ticket.status !== 'Spam';
    } else if (filterStatus === 'Spam') {
      matchesStatus = ticket.status === 'Spam';
    }
    
    return matchesSearch && matchesSource && matchesStatus;
  });

  const handleStatusChange = async (ticketId: string, status: string) => {
    try {
      await ticketService.updateStatus(ticketId, status);
    } catch (error) {
       console.error("Failed to update status", error);
    }
  };

  const handleDepartmentChange = async (ticketId: string, department: string) => {
    try {
      await ticketService.updateDepartment(ticketId, department);
    } catch (error) {
       console.error("Failed to update department", error);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Filters Header */}
      <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search tickets by ID or summary..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {['Active', 'Spam', 'All Status'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status.split(' ')[0])}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all ${
                  (filterStatus === status.split(' ')[0]) ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {['All', 'WhatsApp', 'Email', 'Website'].map((source) => (
              <button
                key={source}
                onClick={() => setFilterSource(source)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-tight transition-all ${
                  filterSource === source ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {source}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter size={18} />
            Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ticket Details</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sentiment</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredTickets.map((ticket) => (
              <tr key={ticket.ticket_id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      ticket.source === 'WhatsApp' ? 'bg-green-50 text-green-600' : 
                      ticket.source === 'Email' ? 'bg-blue-50 text-blue-600' :
                      'bg-purple-50 text-purple-600'
                    }`}>
                      {ticket.source === 'WhatsApp' ? <MessageSquare size={16} /> : 
                       ticket.source === 'Email' ? <Mail size={16} /> :
                       <Globe size={16} />}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-0.5">{ticket.ticket_id}</div>
                      <div className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {ticket.summary}
                      </div>
                      {ticket.is_complete === "false" && ticket.clarification_question && (
                        <div className="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded mt-1 flex items-center gap-1 italic border border-red-100 w-fit">
                          <MessageSquare size={8} /> Needs Info: {ticket.clarification_question}
                        </div>
                      )}
                      {ticket.is_spam === "true" && (
                        <div className="text-[10px] text-gray-500 font-bold bg-gray-100 px-1.5 py-0.5 rounded mt-1 flex items-center gap-1 uppercase border border-gray-200 w-fit">
                          <ShieldOff size={8} /> Spam: {ticket.spam_reason || 'Filtered'}
                        </div>
                      )}
                      <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-tight font-medium flex items-center gap-2">
                        <span>Opened {format(new Date(ticket.created_at), 'MMM dd, HH:mm')}</span>
                        {ticket.is_duplicate === "true" && (
                          <span className="flex items-center gap-0.5 text-amber-600 font-bold bg-amber-50 px-1 rounded">
                            <Link size={10} /> {ticket.parent_incident_id} ({ticket.similarity_score}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {ticket.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <select 
                      value={ticket.department || 'Software'}
                      onChange={(e) => handleDepartmentChange(ticket.ticket_id, e.target.value)}
                      className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100 uppercase tracking-tighter outline-none focus:ring-1 focus:ring-indigo-400"
                    >
                      {['Network', 'Hardware', 'Software', 'Access'].map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1">
                      {ticket.is_flagged === "true" && (
                        <span className="flex items-center gap-0.5 text-[8px] font-bold text-red-500 bg-red-50 px-1 rounded uppercase">
                          <AlertTriangle size={8} /> Flagged
                        </span>
                      )}
                      {ticket.reassigned_by === "AI" && (
                        <span className="flex items-center gap-0.5 text-[8px] font-bold text-amber-500 bg-amber-50 px-1 rounded uppercase">
                          <Zap size={8} /> Rerouted
                        </span>
                      )}
                      {ticket.reassigned_by === "Human" && (
                        <span className="flex items-center gap-0.5 text-[8px] font-bold text-blue-500 bg-blue-50 px-1 rounded uppercase">
                          <UserCheck size={8} /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-tight flex items-center justify-center gap-1 ${
                      ticket.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                      ticket.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                      ticket.priority === 'Medium' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {ticket.priority}
                    </span>
                    {ticket.ticket_role === "Primary" ? (
                      <span className="flex items-center gap-0.5 text-[8px] font-bold text-green-600 bg-green-50 px-1 rounded uppercase self-center">
                        <ShieldCheck size={8} /> Primary
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-[8px] font-bold text-blue-600 bg-blue-50 px-1 rounded uppercase self-center">
                        <ShieldAlert size={8} /> Follower
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                   <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    ticket.sentiment === 'Angry' ? 'bg-red-50 text-red-700 border border-red-100' :
                    ticket.sentiment === 'Frustrated' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                    'bg-green-50 text-green-700 border border-green-100'
                   }`}>
                    {ticket.sentiment}
                   </span>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket.ticket_id, e.target.value)}
                    className="text-xs font-bold text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer hover:text-primary-600 transition-colors"
                  >
                    <option value="Received">Received</option>
                    <option value="Processing">Processing</option>
                    <option value="Waiting">Waiting</option>
                    <option value="Spam">Spam</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                    <ExternalLink size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredTickets.length === 0 && (
          <div className="p-12 text-center text-gray-400">
             <p>No tickets found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketList;
