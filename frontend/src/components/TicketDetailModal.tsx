import React, { useState } from 'react';
import { X, User, Tag, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

interface Ticket {
  id: number;
  ticket_id: string;
  source: string;
  sender: string;
  original_message: string;
  summary: string;
  category: string;
  priority: string;
  department: string;
  sentiment: string;
  status: string;
  is_spam: string;
  is_duplicate: string;
  parent_incident_id?: string;
  ticket_role: string;
  similarity_score: number;
  is_complete: string;
  clarification_question?: string;
  handoff_summary?: string;
  ai_attempts?: string;
  next_best_action?: string;
  assigned_to?: string;
  assigned_at?: string;
  resolved_at?: string;
  internal_notes?: string;
  created_at: string;
  spam_reason?: string;
  swarm_reason?: string;
}

interface TicketDetailModalProps {
  ticket: Ticket;
  onClose: () => void;
  onUpdate?: () => void;
}

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ ticket, onClose, onUpdate }) => {
  const [status, setStatus] = useState(ticket.status);
  const [internalNote, setInternalNote] = useState(ticket.internal_notes || '');
  const [assignAdmin, setAssignAdmin] = useState(ticket.assigned_to || '');
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      await axios.patch(`${API_BASE}/tickets/${ticket.ticket_id}/status`, {
        status: newStatus
      });
      setStatus(newStatus);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignTicket = async () => {
    if (!assignAdmin.trim()) {
      alert('Please enter an admin name');
      return;
    }
    setUpdating(true);
    try {
      await axios.patch(`${API_BASE}/tickets/${ticket.ticket_id}/assign`, {
        admin_name: assignAdmin
      });
      if (onUpdate) onUpdate();
      alert(`Ticket assigned to ${assignAdmin}`);
    } catch (error) {
      console.error('Error assigning ticket:', error);
      alert('Failed to assign ticket');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    setUpdating(true);
    try {
      await axios.patch(`${API_BASE}/tickets/${ticket.ticket_id}/notes`, {
        notes: internalNote
      });
      if (onUpdate) onUpdate();
      alert('Notes saved successfully');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes');
    } finally {
      setUpdating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Angry': return 'bg-red-100 text-red-700';
      case 'Frustrated': return 'bg-orange-100 text-orange-700';
      case 'Calm': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Check if message contains image URLs or attachments
  const hasImages = ticket.original_message?.includes('http') && 
                    (ticket.original_message.includes('.jpg') || 
                     ticket.original_message.includes('.png') || 
                     ticket.original_message.includes('.jpeg'));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Ticket Details</h2>
            <p className="text-sm text-gray-500 mt-1">{ticket.ticket_id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Section 1: Issue Content */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={20} className="text-primary-600" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Issue Description</h3>
            </div>
            
            {/* Original Message */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {ticket.original_message}
              </p>
            </div>

            {/* Image Preview (if detected) */}
            {hasImages && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon size={16} className="text-gray-500" />
                  <span className="text-xs font-bold text-gray-600 uppercase">Attached Images</span>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 italic">Image URLs detected in message</p>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="text-xs font-bold text-gray-500 uppercase">AI Summary</span>
              <p className="text-sm text-gray-700 mt-2 font-medium">{ticket.summary}</p>
            </div>
          </div>

          {/* Section 2: AI Context */}
          <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={20} className="text-indigo-600" />
              <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">AI Analysis</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <span className="text-xs font-bold text-gray-600 uppercase block mb-2">Priority</span>
                <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold border ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </div>

              {/* Department */}
              <div>
                <span className="text-xs font-bold text-gray-600 uppercase block mb-2">Department</span>
                <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                  {ticket.department || 'Unassigned'}
                </span>
              </div>

              {/* Sentiment */}
              <div>
                <span className="text-xs font-bold text-gray-600 uppercase block mb-2">Sentiment</span>
                <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${getSentimentColor(ticket.sentiment)}`}>
                  {ticket.sentiment}
                </span>
              </div>

              {/* Category */}
              <div>
                <span className="text-xs font-bold text-gray-600 uppercase block mb-2">Category</span>
                <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700">
                  {ticket.category}
                </span>
              </div>

              {/* Ticket Role */}
              <div>
                <span className="text-xs font-bold text-gray-600 uppercase block mb-2">Incident Role</span>
                <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${
                  ticket.ticket_role === 'Primary' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {ticket.ticket_role}
                  {ticket.is_duplicate === 'true' && ' (Duplicate)'}
                </span>
              </div>

              {/* Status Flags */}
              <div>
                <span className="text-xs font-bold text-gray-600 uppercase block mb-2">Flags</span>
                <div className="flex gap-2 flex-wrap">
                  {ticket.is_spam === 'true' && (
                    <span className="px-2 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700">
                      Spam
                    </span>
                  )}
                  {ticket.is_complete === 'false' && (
                    <span className="px-2 py-1 rounded-md text-xs font-bold bg-yellow-100 text-yellow-700">
                      Waiting
                    </span>
                  )}
                  {ticket.is_duplicate === 'true' && (
                    <span className="px-2 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-700">
                      Duplicate
                    </span>
                  )}
                  {ticket.is_spam === 'false' && ticket.is_complete === 'true' && ticket.is_duplicate === 'false' && (
                    <span className="px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700">
                      Clean
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Context */}
            {(ticket.handoff_summary || ticket.next_best_action) && (
              <div className="mt-4 pt-4 border-t border-indigo-200 space-y-3">
                {ticket.handoff_summary && (
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase block mb-1">Handoff Summary</span>
                    <p className="text-sm text-gray-700">{ticket.handoff_summary}</p>
                  </div>
                )}
                {ticket.next_best_action && (
                  <div>
                    <span className="text-xs font-bold text-green-600 uppercase block mb-1">Next Best Action</span>
                    <p className="text-sm text-gray-700 font-medium">{ticket.next_best_action}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Admin Actions */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <User size={20} className="text-gray-700" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Admin Actions</h3>
            </div>

            <div className="space-y-4">
              {/* Assign Ticket */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase block mb-2">
                  Assign To Admin
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={assignAdmin}
                    onChange={(e) => setAssignAdmin(e.target.value)}
                    placeholder="Enter admin name"
                    className="flex-1 px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                  <button
                    onClick={handleAssignTicket}
                    disabled={updating}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 disabled:opacity-50 transition-all"
                  >
                    Assign
                  </button>
                </div>
                {ticket.assigned_to && (
                  <p className="text-xs text-gray-500 mt-1">
                    Currently assigned to: <span className="font-bold text-gray-700">{ticket.assigned_to}</span>
                  </p>
                )}
              </div>

              {/* Change Status */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase block mb-2">
                  Change Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Processing', 'Under Review', 'Waiting', 'Resolved', 'Cancelled'].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={updating || status === s}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        status === s
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase block mb-2">
                  Internal Notes
                </label>
                <textarea
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Add internal notes (not visible to user)..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                />
                <button 
                  onClick={handleSaveNotes}
                  disabled={updating}
                  className="mt-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-xs font-bold hover:bg-gray-800 disabled:opacity-50 transition-all"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <span>
                <strong>Source:</strong> {ticket.source}
              </span>
              <span>
                <strong>Sender:</strong> {ticket.sender}
              </span>
            </div>
            <div>
              <strong>Created:</strong> {format(new Date(ticket.created_at), 'MMM dd, yyyy HH:mm')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
