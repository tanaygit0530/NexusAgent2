import React, { useState, Fragment } from 'react';
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
  ShieldOff,
  ChevronDown,
  ChevronUp,
  History,
  Play
} from 'lucide-react';
import { format } from 'date-fns';
import { ticketService } from '../services/api';
import TicketDetailModal from './TicketDetailModal';

interface TicketListProps {
  tickets: any[];
}

const TicketList: React.FC<TicketListProps> = ({ tickets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('Active'); // Active, Spam, All
  const [priorityFilter, setPriorityFilter] = useState('All'); // All, Critical, High, Medium, Low
  const [departmentFilter, setDepartmentFilter] = useState('All'); // All, Hardware, Software, Network, Accounts, Security, Other
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Dropdown states
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.summary.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         ticket.ticket_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = filterSource === 'All' || ticket.source === filterSource;
    const matchesPriority = priorityFilter === 'All' || ticket.priority === priorityFilter;
    const matchesDepartment = departmentFilter === 'All' || ticket.department === departmentFilter;
    
    let matchesStatus = true;
    if (filterStatus === 'Active') {
      matchesStatus = ticket.is_spam === 'false' && !['Cancelled', 'Resolved'].includes(ticket.status);
    } else if (filterStatus === 'Spam') {
      matchesStatus = ticket.is_spam === 'true';
    } else if (filterStatus === 'Under Review') {
      matchesStatus = ticket.status === 'Under Review';
    } else if (filterStatus === 'Waiting') {
      matchesStatus = ticket.status === 'Waiting';
    } else if (filterStatus === 'Resolved') {
      matchesStatus = ticket.status === 'Resolved';
    } else if (filterStatus === 'Cancelled') {
      matchesStatus = ticket.status === 'Cancelled';
    }
    
    return matchesSearch && matchesSource && matchesStatus && matchesPriority && matchesDepartment;
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

  const handleClaimTicket = async (ticketId: string) => {
    try {
      // TODO: Replace with actual logged-in admin name from auth context
      const adminName = "Tanay"; // Hardcoded for now
      
      await ticketService.assignTicket(ticketId, adminName);
      alert(`Ticket ${ticketId} claimed successfully! Check "My Workspace" tab.`);
      
      // Refresh the ticket list if onUpdate callback exists
      if (selectedTicket) {
        setSelectedTicket(null);
      }
    } catch (error) {
      console.error("Failed to claim ticket", error);
      alert("Failed to claim ticket. Please try again.");
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-xl overflow-hidden min-h-[600px] card-hover">
      {/* Filters Header - Enhanced */}
      <div className="p-6 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/30 to-transparent">
        {/* Search Bar - Enhanced */}
        <div className="relative flex-1 max-w-2xl mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
          <input 
            type="text" 
            placeholder="Search tickets by ID or summary..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:shadow-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Dropdown Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Filter Dropdown - Enhanced */}
          <div className="relative">
            <button
              onClick={() => {
                setStatusDropdownOpen(!statusDropdownOpen);
                setPlatformDropdownOpen(false);
                setPriorityDropdownOpen(false);
                setDepartmentDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all shadow-sm"
            >
              <span className="text-xs text-gray-500 uppercase tracking-wide font-bold">Status:</span>
              <span className="font-bold text-gray-900">{filterStatus === 'All' ? 'All Status' : filterStatus}</span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${statusDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {statusDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-2 animate-fade-in">
                {['Active', 'Under Review', 'Waiting', 'Resolved', 'Cancelled', 'Spam', 'All'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilterStatus(status);
                      setStatusDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent transition-all ${
                      filterStatus === status ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold' : 'text-gray-700 font-medium'
                    }`}
                  >
                    {status === 'All' ? 'All Status' : status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Platform Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setPlatformDropdownOpen(!platformDropdownOpen);
                setStatusDropdownOpen(false);
                setPriorityDropdownOpen(false);
                setDepartmentDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
            >
              <span className="text-xs text-gray-500 uppercase tracking-wide">Platform:</span>
              <span className="font-semibold">{filterSource}</span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${platformDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {platformDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                {['All', 'WhatsApp', 'Email', 'Website'].map((source) => (
                  <button
                    key={source}
                    onClick={() => {
                      setFilterSource(source);
                      setPlatformDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      filterSource === source ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {source}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Priority Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setPriorityDropdownOpen(!priorityDropdownOpen);
                setStatusDropdownOpen(false);
                setPlatformDropdownOpen(false);
                setDepartmentDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
            >
              <span className="text-xs text-gray-500 uppercase tracking-wide">Priority:</span>
              <span className="font-semibold">{priorityFilter}</span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${priorityDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {priorityDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                {['All', 'Critical', 'High', 'Medium', 'Low'].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => {
                      setPriorityFilter(priority);
                      setPriorityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      priorityFilter === priority ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Department Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setDepartmentDropdownOpen(!departmentDropdownOpen);
                setStatusDropdownOpen(false);
                setPlatformDropdownOpen(false);
                setPriorityDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
            >
              <span className="text-xs text-gray-500 uppercase tracking-wide">Department:</span>
              <span className="font-semibold">{departmentFilter}</span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${departmentDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {departmentDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                {['All', 'Hardware', 'Software', 'Network', 'Accounts', 'Security', 'Other'].map((dept) => (
                  <button
                    key={dept}
                    onClick={() => {
                      setDepartmentFilter(dept);
                      setDepartmentDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      departmentFilter === dept ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left table-fixed">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="w-[35%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ticket Details</th>
              <th className="w-[12%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
              <th className="w-[15%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</th>
              <th className="w-[12%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</th>
              <th className="w-[12%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sentiment</th>
              <th className="w-[12%] px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="w-[2%] px-2 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredTickets.map((ticket) => (
              <Fragment key={ticket.ticket_id}>
                <tr 
                  className={`hover:bg-primary-50/30 transition-all cursor-pointer group ${expandedId === ticket.ticket_id ? 'bg-primary-50/50' : ''}`}
                  onClick={() => setExpandedId(expandedId === ticket.ticket_id ? null : ticket.ticket_id)}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 p-2 rounded-xl shadow-sm ${
                        ticket.source === 'WhatsApp' ? 'bg-green-50 text-green-600' : 
                        ticket.source === 'Email' ? 'bg-blue-50 text-blue-600' :
                        'bg-purple-50 text-purple-600'
                      }`}>
                        {ticket.source === 'WhatsApp' ? <MessageSquare size={16} /> : 
                         ticket.source === 'Email' ? <Mail size={16} /> :
                         <Globe size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-tighter">{ticket.ticket_id}</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-[10px] font-medium text-gray-500 uppercase">{format(new Date(ticket.created_at), 'HH:mm')}</span>
                        </div>
                        <div className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                          {ticket.summary}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 min-h-[16px]">
                          {ticket.is_complete === "false" && (
                            <span className="text-[9px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded flex items-center gap-1 border border-red-100">
                              Needs Info
                            </span>
                          )}
                          {ticket.is_spam === "true" && (
                            <span className="text-[9px] text-gray-600 font-bold bg-gray-100 px-1.5 py-0.5 rounded flex items-center gap-1 border border-gray-200">
                              <ShieldOff size={10} /> Spam
                            </span>
                          )}
                          {ticket.is_duplicate === "true" && (
                            <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-1 border border-amber-100">
                              <Link size={10} /> Linked
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md uppercase tracking-tight">
                      {ticket.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <select 
                        value={ticket.department || 'Software'}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleDepartmentChange(ticket.ticket_id, e.target.value)}
                        className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 uppercase tracking-tight outline-none focus:ring-2 focus:ring-indigo-400"
                      >
                        {['Network', 'Hardware', 'Software', 'Access'].map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-full text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-tight ${
                      ticket.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                      ticket.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                      ticket.priority === 'Medium' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center justify-center w-full text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                      ticket.sentiment === 'Angry' ? 'bg-red-50 text-red-700 border border-red-100' :
                      ticket.sentiment === 'Frustrated' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                      'bg-green-50 text-green-700 border border-green-100'
                     }`}>
                      {ticket.sentiment || 'Calm'}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={ticket.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusChange(ticket.ticket_id, e.target.value)}
                      className="text-[10px] font-extrabold text-gray-700 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200 uppercase tracking-tight outline-none focus:ring-2 focus:ring-primary-500 w-full"
                    >
                      <option value="Received">Received</option>
                      <option value="Processing">Processing</option>
                      <option value="Waiting">Waiting</option>
                      <option value="Spam">Spam</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>
                  <td className="px-2 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicket(ticket);
                        }}
                        className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 transition-all opacity-0 group-hover:opacity-100"
                      >
                        View Details
                      </button>
                      {expandedId === ticket.ticket_id ? <ChevronUp size={16} className="text-primary-600" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </td>
                </tr>
                {expandedId === ticket.ticket_id && (
                  <tr className="bg-primary-50/20">
                    <td colSpan={7} className="px-12 py-8 border-b border-primary-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-primary-700 font-bold uppercase tracking-widest text-[10px]">
                            <History size={14} /> Human Handoff Report
                          </div>
                          <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm">
                            <h4 className="text-[10px] font-extrabold text-gray-400 uppercase mb-3">Technical Summary</h4>
                            <p className="text-sm text-gray-700 leading-relaxed font-medium capitalize">
                              {ticket.handoff_summary || "Automated review completed. Primary issue categorized."}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-primary-700 font-bold uppercase tracking-widest text-[10px]">
                            <Zap size={14} /> AI Efforts & Validations
                          </div>
                          <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm">
                            <h4 className="text-[10px] font-extrabold text-gray-400 uppercase mb-3">Actions Taken</h4>
                            <p className="text-sm text-gray-700 leading-relaxed font-medium">
                              {ticket.ai_attempts || "Standard checks performed: Sentiment analysis, duplicate detection, and department routing."}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-green-700 font-bold uppercase tracking-widest text-[10px]">
                            <Play size={14} /> Next Best Action
                          </div>
                          <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100 shadow-sm">
                            <h4 className="text-[10px] font-extrabold text-green-600/60 uppercase mb-3">Recommended Step</h4>
                            <p className="text-sm text-green-900 leading-relaxed font-bold">
                              {ticket.next_best_action || "Establish user verification and begin technical diagnosis."}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-primary-100 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                           <div className="flex flex-col">
                             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Original Message</span>
                             <p className="text-xs text-gray-600 mt-1 italic font-medium">"{ticket.original_message}"</p>
                           </div>
                        </div>
                        <button 
                           onClick={() => handleClaimTicket(ticket.ticket_id)}
                           className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
                         >
                          <ExternalLink size={14} /> Claim Ticket
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        
        {filteredTickets.length === 0 && (
          <div className="p-12 text-center text-gray-400">
             <p>No tickets found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={() => {
            // Refresh ticket list after update
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default TicketList;
