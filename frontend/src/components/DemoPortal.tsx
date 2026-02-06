import React, { useState } from 'react';
import { Send, User, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const DemoPortal: React.FC = () => {
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender || !message) return;

    setStatus('loading');
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await axios.post(`${API_BASE_URL}/webhooks/whatsapp`, {
        sender,
        message
      });
      
      setTicketId(response.data.ticket_id);
      setStatus('success');
      setSender('');
      setMessage('');
    } catch (error) {
      console.error("Submission error:", error);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="bg-primary-600 p-8 text-white">
          <h3 className="text-2xl font-bold">Submit Support Request</h3>
          <p className="text-primary-100 mt-2 text-sm">Experience the AI-driven automation in real-time. Your request will be instantly analyzed and validatd.</p>
        </div>

        <div className="p-8">
          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Request Submitted!</h4>
              <p className="text-gray-500 mt-2 mb-6">
                Your ticket <span className="font-mono font-bold text-primary-600">{ticketId}</span> has been created. 
                Switch to the 'Tickets' tab to see it live.
              </p>
              <button 
                onClick={() => setStatus('idle')}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Send Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Your Name or Contact</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe or +123456789"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-medium"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Issue Description</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 text-gray-400" size={18} />
                  <textarea 
                    rows={4}
                    placeholder="Describe your technical problem in detail..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-medium resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
              </div>

              {status === 'error' && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
                  <AlertCircle size={20} />
                  <span className="text-sm font-medium">Failed to submit request. Is the backend running?</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 shadow-lg shadow-primary-200 disabled:opacity-50 transition-all uppercase tracking-widest text-sm"
              >
                {status === 'loading' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send size={18} />
                    Submit to AI Triage
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6">
        <h4 className="flex items-center gap-2 text-blue-800 font-bold mb-2">
          <AlertCircle size={18} />
          Demo Mode Info
        </h4>
        <p className="text-blue-700 text-sm leading-relaxed">
          This portal simulates an end-user sending a message via WhatsApp. 
          When you click submit, the message is sent to the FastAPI backend, 
          where **NexusAgent's AI** will:
          <ol className="list-decimal list-inside mt-2 space-y-1 font-medium">
            <li>Extract core issue & category</li>
            <li>Assign priority & detect sentiment</li>
            <li>Validate against extraction guardrails</li>
            <li>Create a structured ticket in real-time</li>
          </ol>
        </p>
      </div>
    </div>
  );
};

export default DemoPortal;
