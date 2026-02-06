import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Send, 
  Search, 
  Ticket, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowLeft,
  User,
  MessageSquare
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const RaiseTicket: React.FC = () => {
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender || !message) return;
    setStatus('loading');
    try {
      const response = await axios.post(`${API_BASE_URL}/webhooks/intake`, { 
        sender, 
        message,
        source: 'Website'
      });
      setTicketId(response.data.ticket_id);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Raised!</h2>
        <p className="text-gray-500 mb-6">Your request has been received and is being processed by our AI triage team.</p>
        
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Your Ticket ID</p>
          <p className="text-3xl font-mono font-black text-primary-600 tracking-tighter">{ticketId}</p>
          <p className="text-xs text-green-600 font-bold mt-2 flex items-center justify-center gap-1">
            <Clock size={12} /> Status: Received
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link 
            to={`/track-ticket?id=${ticketId}`}
            className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
          >
            Track Status
          </Link>
          <button 
            onClick={() => setStatus('idle')}
            className="w-full py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            Raise Another Issue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-primary-600 p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight">Support Portal</h2>
            <p className="text-primary-100 mt-2 font-medium">How can we help you today?</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Identity</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Name, Email or Phone"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-semibold"
                value={sender}
                onChange={e => setSender(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Describe the Issue</label>
            <div className="relative group">
              <MessageSquare className="absolute left-4 top-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
              <textarea 
                rows={5}
                placeholder="What exactly is the problem? Please provide details..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-semibold resize-none"
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
              />
            </div>
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm font-bold">
              <AlertCircle size={20} />
              Failed to connect. Please try again.
            </div>
          )}

          <button 
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {status === 'loading' ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Submit Request
                <Send size={20} />
              </>
            )}
          </button>
        </form>
      </div>
      
      <div className="mt-8 text-center">
        <Link to="/track-ticket" className="text-gray-500 font-bold hover:text-primary-600 transition-colors flex items-center justify-center gap-2">
          <Search size={18} />
          Already have a ticket? Track it here
        </Link>
      </div>
    </div>
  );
};

export const TrackTicket: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [ticketId, setTicketId] = useState(searchParams.get('id') || '');
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ticketId) return;

    setLoading(true);
    setError('');
    setTicket(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/${ticketId.toUpperCase()}`);
      setTicket(response.data);
    } catch (err: any) {
      setError(err.response?.status === 404 ? 'Ticket not found. Please check the ID.' : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('id')) {
      handleTrack();
    }
  }, []);

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Search className="text-primary-600" />
            Track Ticket Status
          </h2>
          <p className="text-gray-500 text-sm mt-1">Enter your unique Ticket ID to see real-time progress.</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleTrack} className="flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. TICK-123456"
              className="flex-1 px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-primary-500 outline-none transition-all font-bold text-lg uppercase placeholder:normal-case"
              value={ticketId}
              onChange={e => setTicketId(e.target.value)}
              required
            />
            <button 
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Track'}
            </button>
          </form>

          {error && (
            <div className="mt-6 flex items-center gap-3 p-4 bg-orange-50 text-orange-700 rounded-2xl border border-orange-100 text-sm font-bold animate-in slide-in-from-top-2 duration-300">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {ticket && (
            <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider ${
                      ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                      ticket.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ticket ID</p>
                  <p className="text-xl font-black text-gray-900 font-mono mt-1">{ticket.ticket_id}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Issue Summary</p>
                  <p className="font-bold text-gray-900 leading-tight">{ticket.summary}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200/50">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Created</p>
                    <p className="text-sm font-bold text-gray-700">{new Date(ticket.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Last Updated</p>
                    <p className="text-sm font-bold text-gray-700">{new Date(ticket.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 p-4 bg-primary-50 rounded-2xl border border-primary-100">
                <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <Ticket size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary-800">Support Note</p>
                  <p className="text-xs text-primary-700 mt-1 leading-relaxed">
                    Our AI has categorized this as <span className="font-bold">{ticket.category}</span>. 
                    An agent will prioritize this based on its <span className="font-bold">{ticket.priority}</span> impact.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/raise-ticket" className="text-gray-500 font-bold hover:text-primary-600 transition-colors flex items-center justify-center gap-2">
          <ArrowLeft size={18} />
          Back to Portal
        </Link>
      </div>
    </div>
  );
};
